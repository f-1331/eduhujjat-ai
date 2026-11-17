import asyncio
import json
import logging
import os
import re
import subprocess
import sys
import time
from pathlib import Path
import httpx

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s : %(message)s"
)
logger = logging.getLogger("unified_server")

BASE_DIR = Path(__file__).resolve().parent
LOCAL_PORT = 10000
LOCAL_TARGET = f"http://127.0.0.1:{LOCAL_PORT}"
RENDER_URL = "https://eduhujjat-bot.onrender.com"
RENDER_HEALTH_URL = f"{RENDER_URL}/health"
LOCAL_HEALTH_URL = f"{LOCAL_TARGET}/health"
OWNER_TELEGRAM_ID = 6707839718
CHECK_INTERVAL_SECONDS = 90
STATE_FILE = BASE_DIR / "failover_state.json"
TUNNEL_FILE = BASE_DIR / "tunnel_url.txt"

CURRENT_ACTIVE_TUNNEL = ""


def get_bot_token() -> str:
    env_path = BASE_DIR / ".env"
    if env_path.exists():
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("BOT_TOKEN="):
                        return line.split("=", 1)[1].strip().strip('"').strip("'")
        except Exception:
            pass
    return ""


def load_state() -> dict:
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "current_target": "UNKNOWN",
        "render_fail_count": 0,
        "render_success_count": 0,
        "last_switch_time": None
    }


def save_state(state: dict):
    try:
        with open(STATE_FILE, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2)
    except Exception as e:
        logger.warning(f"State faylini saqlab bo'lmadi: {e}")


def get_current_vercel_target() -> str:
    vercel_path = BASE_DIR / "vercel.json"
    if not vercel_path.exists():
        return "UNKNOWN"
    try:
        with open(vercel_path, "r", encoding="utf-8") as f:
            content = f.read()
        if "eduhujjat-bot.onrender.com" in content:
            return "RENDER"
        elif "trycloudflare.com" in content or "loca.lt" in content:
            return "TUNNEL"
    except Exception:
        pass
    return "UNKNOWN"


def update_vercel_route(new_target_url: str, target_name: str) -> bool:
    """Update vercel.json rewrites, commit, and push to GitHub origin main."""
    vercel_path = BASE_DIR / "vercel.json"
    if not vercel_path.exists():
        logger.error("vercel.json mavjud emas!")
        return False

    try:
        with open(vercel_path, "r", encoding="utf-8") as f:
            content = f.read()

        old_pattern = r'https://[a-zA-Z0-9\.\-]+\.(?:onrender\.com|trycloudflare\.com|loca\.lt)'
        new_content = re.sub(old_pattern, new_target_url, content)

        if new_content == content:
            logger.info(f"vercel.json allaqachon {new_target_url} manziliga yo'naltirilgan.")
            return True

        with open(vercel_path, "w", encoding="utf-8") as f:
            f.write(new_content)

        logger.info(f"vercel.json yangilandi -> {new_target_url}")

        subprocess.run(["git", "add", "vercel.json"], cwd=str(BASE_DIR), check=True)
        subprocess.run(["git", "commit", "-m", f"chore(ha-failover): auto-route to {target_name} ({new_target_url})"], cwd=str(BASE_DIR), check=True)
        subprocess.run(["git", "push", "origin", "main"], cwd=str(BASE_DIR), check=True)
        logger.info(f"✅ GitHub'ga muvaffaqiyatli push qilindi -> {target_name}")
        return True
    except Exception as e:
        logger.error(f"vercel.json ni yangilash va push qilishda xatolik: {e}")
        return False


async def notify_owner_telegram(message_html: str):
    """QAT'IY QOIDA: Ushbu xabarlar FAQAT Super Admin (OWNER_TELEGRAM_ID) ga yuboriladi."""
    token = get_bot_token()
    if not token or not OWNER_TELEGRAM_ID:
        return

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": OWNER_TELEGRAM_ID,
        "text": message_html,
        "parse_mode": "HTML"
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                logger.info("Telegram egasiga ogohlantirish xabari muvaffaqiyatli yuborildi.")
            else:
                logger.warning(f"Telegram API javobi: {resp.status_code} - {resp.text}")
    except Exception as e:
        logger.warning(f"Telegram xabari yuborilmadi: {e}")


async def check_render_health() -> bool:
    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
            resp = await client.get(RENDER_HEALTH_URL)
            if resp.status_code == 200:
                try:
                    data = resp.json()
                    if data.get("status") in ("healthy", "ok"):
                        return True
                except Exception:
                    return True
    except Exception:
        pass
    return False


async def check_local_server_health() -> bool:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(LOCAL_HEALTH_URL)
            if resp.status_code == 200:
                return True
    except Exception:
        pass
    return False


async def check_tunnel_health(tunnel_url: str) -> bool:
    """Check if the active tunnel URL is responsive from outside."""
    if not tunnel_url:
        return False
    try:
        headers = {"Bypass-Tunnel-Reminder": "true"}
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
            resp = await client.get(f"{tunnel_url}/health", headers=headers)
            if resp.status_code == 200:
                return True
    except Exception:
        pass
    return False


async def monitor_stream(stream, prefix):
    """Log output asynchronously."""
    while True:
        try:
            line = await asyncio.to_thread(stream.readline)
            if not line:
                break
            line_str = line.strip()
            if line_str:
                logger.info(f"[{prefix}] {line_str}")
        except Exception:
            break


async def monitor_cf_stream(stream, cf_proc):
    """Monitors cloudflared stdout and detects expired / rejected tunnels to trigger auto-restart."""
    while True:
        try:
            line = await asyncio.to_thread(stream.readline)
            if not line:
                break
            line_str = line.strip()
            if line_str:
                logger.info(f"[Cloudflare] {line_str}")
                # Auto-kill if tunnel was closed or expired by Cloudflare servers
                if any(err_sig in line_str for err_sig in [
                    "Unauthorized: Tunnel not found",
                    "Tunnel credentials are not valid",
                    "Tunnel not found",
                    "Cannot determine default configuration",
                    "failed to serve quic connection",
                ]) and "Retrying connection" in line_str:
                    logger.warning("🚨 Cloudflare tunnel muddati tugadi yoki uzildi! Yangi tunnel yaratish uchun to'xtatilmoqda...")
                    try:
                        cf_proc.terminate()
                    except Exception:
                        pass
                    break
        except Exception:
            break


async def start_localtunnel():
    """Start localtunnel via npx as an instant fallback during Cloudflare rate limits."""
    logger.info("⚡ Zaxira Tunnel (localtunnel) ishga tushirilmoqda...")
    proc = subprocess.Popen(
        "npx --yes localtunnel --port 10000",
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )
    url = None
    start = time.time()
    while time.time() - start < 20:
        if proc.poll() is not None:
            break
        line = await asyncio.to_thread(proc.stdout.readline)
        if not line:
            await asyncio.sleep(0.2)
            continue
        line_clean = line.strip()
        match = re.search(r"https://[a-zA-Z0-9-]+\.loca\.lt", line_clean)
        if match:
            url = match.group(0)
            break

    if url:
        logger.info(f"✅ Localtunnel jonli URL: {url}")
        return proc, url
    return None, None


async def tunnel_supervisor():
    """Manages tunnel: Cloudflare primary, localtunnel fallback, and auto-heals expired tunnels."""
    global CURRENT_ACTIVE_TUNNEL
    cf_binary = BASE_DIR / "cloudflared.exe"
    active_lt_proc = None

    while True:
        logger.info(f"Cloudflare tezkor tunnelga ulanishga urinish ({LOCAL_TARGET})...")
        cf_proc = subprocess.Popen(
            [str(cf_binary), "tunnel", "--url", LOCAL_TARGET, "--no-autoupdate"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )

        tunnel_url = None
        start = time.time()
        while time.time() - start < 30:
            if cf_proc.poll() is not None:
                break
            line = await asyncio.to_thread(cf_proc.stdout.readline)
            if not line:
                await asyncio.sleep(0.2)
                continue
            line_clean = line.strip()
            if "trycloudflare.com" in line_clean:
                match = re.search(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com", line_clean)
                if match:
                    tunnel_url = match.group(0)
                    break
            elif "status 429" in line_clean:
                logger.warning("Cloudflare tunnel: 429 Too Many Requests (vaqtinchalik limit).")
                break

        if tunnel_url:
            logger.info(f"✅ Jonli Cloudflare Tunnel URL olindi: {tunnel_url}")
            CURRENT_ACTIVE_TUNNEL = tunnel_url

            # Kill localtunnel fallback if was active
            if active_lt_proc and active_lt_proc.poll() is None:
                try:
                    active_lt_proc.terminate()
                except Exception:
                    pass
                active_lt_proc = None

            try:
                with open(TUNNEL_FILE, "w", encoding="utf-8") as f:
                    f.write(tunnel_url)
            except Exception:
                pass

            render_down = not (await check_render_health())
            if render_down:
                logger.warning(f"Render 503 holatida. Vercel tunnelga yo'naltirilmoqda -> {tunnel_url}")
                success = update_vercel_route(tunnel_url, "TUNNEL")
                if success:
                    msg = (
                        "🔒 <b>[MAXFIY TEXNIK XABAR — FAQAT ADMIN UCHUN]</b>\n"
                        "<i>(Ushbu xabar faqat sizga yuborildi, oddiy foydalanuvchilarga yuborilmaydi)</i>\n\n"
                        "⚠️ <b>EduHujjat Zaxira Tizimi Ishga Tushirildi!</b>\n\n"
                        "Render oylik limiti tugagani (HTTP 503) sababli, loyiha kompyuterdagi zaxira serveriga o'tkazildi.\n"
                        f"🌐 Zaxira Tunnel URL: <code>{tunnel_url}</code>\n"
                        "✅ Sayt va Telegram bot to'liq faol!"
                    )
                    await notify_owner_telegram(msg)

            cf_task = asyncio.create_task(monitor_cf_stream(cf_proc.stdout, cf_proc))

            # Periodic health verification: ensure active tunnel URL stays alive
            consecutive_tunnel_fails = 0
            while cf_proc.poll() is None:
                await asyncio.sleep(25)
                is_tunnel_ok = await check_tunnel_health(tunnel_url)
                if not is_tunnel_ok:
                    consecutive_tunnel_fails += 1
                    logger.warning(f"[TUNNEL-HEALTH] Tunnel tekshiruvi xato bo'ldi ({consecutive_tunnel_fails}/3)")
                    if consecutive_tunnel_fails >= 3:
                        logger.error("🚨 Tunnel 3 marta javob bermadi! Yangi tunnel ochish uchun to'xtatilmoqda...")
                        try:
                            cf_proc.terminate()
                        except Exception:
                            pass
                        break
                else:
                    consecutive_tunnel_fails = 0

            cf_task.cancel()
            logger.warning("Cloudflare tunnel jarayoni to'xtadi! Yangi tunnel ochilmoqda...")

        else:
            if cf_proc.poll() is None:
                try:
                    cf_proc.terminate()
                except Exception:
                    pass

            # If Cloudflare failed/limited and no tunnel active, start localtunnel immediately
            if not CURRENT_ACTIVE_TUNNEL or not (await check_tunnel_health(CURRENT_ACTIVE_TUNNEL)):
                if active_lt_proc is None or active_lt_proc.poll() is not None:
                    lt_proc, lt_url = await start_localtunnel()
                    if lt_url:
                        active_lt_proc = lt_proc
                        CURRENT_ACTIVE_TUNNEL = lt_url
                        try:
                            with open(TUNNEL_FILE, "w", encoding="utf-8") as f:
                                f.write(lt_url)
                        except Exception:
                            pass
                        render_down = not (await check_render_health())
                        if render_down:
                            update_vercel_route(lt_url, "TUNNEL")

            logger.info("Cloudflare tunnel 30 soniyadan so'ng qayta tekshiriladi...")
            await asyncio.sleep(30)


async def ha_watchdog_loop():
    """Bi-directional HA Watchdog loop: checks Render health every 90 seconds."""
    logger.info("🔄 Bi-directional HA Watchdog fonda faollashtirildi (har 90s).")
    state = load_state()

    while True:
        try:
            await asyncio.sleep(CHECK_INTERVAL_SECONDS)
            current_target = get_current_vercel_target()
            render_alive = await check_render_health()

            if render_alive:
                state["render_success_count"] += 1
                state["render_fail_count"] = 0
                logger.info(f"[HEALTH] Render: ISHLAYAPTI (ketma-ket {state['render_success_count']} marta) | Hozirgi yo'nalish: {current_target}")

                # 2-YO'NALISH (Render tiklanganda):
                if current_target == "TUNNEL" and state["render_success_count"] >= 2:
                    logger.info("🎉 RENDER TIKLANDI! Render bulut serveriga avtomatik qaytarilmoqda...")
                    success = update_vercel_route(RENDER_URL, "RENDER")
                    if success:
                        state["current_target"] = "RENDER"
                        state["last_switch_time"] = time.strftime("%Y-%m-%d %H:%M:%S")
                        save_state(state)
                        msg = (
                            "🔒 <b>[MAXFIY TEXNIK XABAR — FAQAT ADMIN UCHUN]</b>\n"
                            "<i>(Ushbu xabar faqat sizga yuborildi, oddiy foydalanuvchilarga yuborilmaydi)</i>\n\n"
                            "🎉 <b>EduHujjat: Render limiti yangilandi va server to'liq tiklandi!</b>\n\n"
                            f"Vercel sayti avtomatik ravishda asosiy <b>Render bulut serveriga</b> (<code>{RENDER_URL}</code>) qaytarildi.\n"
                            "Barcha xizmatlar (AI Slayd, Hujjatlar, WebApp, Bot) yana to'liq bulutda uzluksiz ishlamoqda!"
                        )
                        await notify_owner_telegram(msg)
            else:
                state["render_fail_count"] += 1
                state["render_success_count"] = 0
                logger.warning(f"[HEALTH] Render: ISHLAMAYAPTI (ketma-ket {state['render_fail_count']} marta) | Hozirgi yo'nalish: {current_target}")

                # 1-YO'NALISH (Render limiti tugaganda / 503):
                if current_target == "RENDER" and state["render_fail_count"] >= 2:
                    logger.warning("🚨 RENDER LIMITI TUGADI (503)! Zaxira tunneliga o'tkazilmoqda...")
                    tunnel_url = CURRENT_ACTIVE_TUNNEL
                    local_alive = await check_local_server_health()

                    if tunnel_url and local_alive:
                        success = update_vercel_route(tunnel_url, "TUNNEL")
                        if success:
                            state["current_target"] = "TUNNEL"
                            state["last_switch_time"] = time.strftime("%Y-%m-%d %H:%M:%S")
                            save_state(state)
                            msg = (
                                "🔒 <b>[MAXFIY TEXNIK XABAR — FAQAT ADMIN UCHUN]</b>\n"
                                "<i>(Ushbu xabar faqat sizga yuborildi, oddiy foydalanuvchilarga yuborilmaydi)</i>\n\n"
                                "⚠️ <b>EduHujjat: Render limiti tugadi yoki server to'xtab qoldi (HTTP 503)!</b>\n\n"
                                "Tizim uzilishsiz ishlashi uchun Vercel avtomatik ravishda <b>Zaxira Serverga</b> ulandi.\n"
                                f"🌐 Jonli zaxira manzili: <code>{tunnel_url}</code>\n"
                                "✅ Telegram bot va sayt 100% uzilishsiz zaxira rejimida ishlamoqda!"
                            )
                            await notify_owner_telegram(msg)

            save_state(state)
        except Exception as e:
            logger.error(f"Watchdog tsiklida xatolik: {e}")


async def main_unified():
    logger.info("=" * 65)
    logger.info("🚀 EduHujjat All-In-One Unified Server & HA Watchdog")
    logger.info("=" * 65)

    # 1. Start Node.js Bot & Local API Server on port 10000 DARHOL
    node_env = os.environ.copy()
    node_env["PORT"] = str(LOCAL_PORT)
    node_env["API_PORT"] = str(LOCAL_PORT)

    logger.info(f"Node.js Bot Server ishga tushirilmoqda (PORT={LOCAL_PORT})...")
    node_proc = subprocess.Popen(
        ["node", "bot-local.js"],
        cwd=str(BASE_DIR),
        env=node_env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    node_task = asyncio.create_task(monitor_stream(node_proc.stdout, "EduBot"))

    # 2. Start Cloudflare Tunnel Supervisor and HA Watchdog in parallel
    tunnel_task = asyncio.create_task(tunnel_supervisor())
    watchdog_task = asyncio.create_task(ha_watchdog_loop())

    try:
        while True:
            await asyncio.sleep(2)

            # Auto-restart node if died
            if node_proc.poll() is not None:
                logger.warning("Node.js server to'xtadi! 3 soniyada qayta ishga tushirilmoqda...")
                await asyncio.sleep(3)
                node_proc = subprocess.Popen(
                    ["node", "bot-local.js"],
                    cwd=str(BASE_DIR),
                    env=node_env,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                    bufsize=1
                )
                node_task.cancel()
                node_task = asyncio.create_task(monitor_stream(node_proc.stdout, "EduBot"))

    except (KeyboardInterrupt, SystemExit):
        logger.info("Server to'xtatilmoqda...")
    finally:
        tunnel_task.cancel()
        watchdog_task.cancel()
        if node_proc and node_proc.poll() is None:
            node_proc.terminate()
        node_task.cancel()
        logger.info("Unified server to'liq to'xtatildi.")


if __name__ == "__main__":
    try:
        asyncio.run(main_unified())
    except KeyboardInterrupt:
        pass
