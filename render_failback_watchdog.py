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
logger = logging.getLogger("ha_failover_watchdog")

BASE_DIR = Path(__file__).resolve().parent
RENDER_URL = "https://eduhujjat-bot.onrender.com"
RENDER_HEALTH_URL = f"{RENDER_URL}/health"
LOCAL_HEALTH_URL = "http://127.0.0.1:10000/health"
OWNER_TELEGRAM_ID = 6707839718
CHECK_INTERVAL_SECONDS = 90  # Har 90 soniyada tekshiriladi
STATE_FILE = BASE_DIR / "failover_state.json"


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
        elif "trycloudflare.com" in content:
            return "TUNNEL"
    except Exception:
        pass
    return "UNKNOWN"


def get_active_tunnel_url() -> str:
    tunnel_file = BASE_DIR / "tunnel_url.txt"
    if tunnel_file.exists():
        try:
            with open(tunnel_file, "r", encoding="utf-8") as f:
                url = f.read().strip()
                if url.startswith("https://") and "trycloudflare.com" in url:
                    return url
        except Exception:
            pass
    return ""


def update_vercel_route(new_target_url: str, target_name: str) -> bool:
    vercel_path = BASE_DIR / "vercel.json"
    if not vercel_path.exists():
        logger.error("vercel.json mavjud emas!")
        return False

    try:
        with open(vercel_path, "r", encoding="utf-8") as f:
            content = f.read()

        old_pattern = r'https://[a-zA-Z0-9\.\-]+\.(?:onrender\.com|trycloudflare\.com)'
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
    token = get_bot_token()
    if not token:
        logger.warning("Telegram xabar yuborish uchun BOT_TOKEN topilmadi.")
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


async def run_ha_watchdog():
    logger.info("=" * 65)
    logger.info("🔄 EduHujjat Bi-directional HA Auto-Failover Watchdog Ishga Tushdi")
    logger.info(f"   Asosiy (Primary): Render ({RENDER_URL})")
    logger.info("   Zaxira (Backup):  Cloudflare Tunnel (Lokal Kompyuter)")
    logger.info(f"   Davriylik:        Har {CHECK_INTERVAL_SECONDS} soniyada")
    logger.info("=" * 65)

    state = load_state()

    while True:
        try:
            current_target = get_current_vercel_target()
            render_alive = await check_render_health()

            if render_alive:
                state["render_success_count"] += 1
                state["render_fail_count"] = 0
                logger.info(f"[HEALTH] Render: ISHLAYAPTI (ketma-ket {state['render_success_count']} marta) | Hozirgi yo'nalish: {current_target}")

                # 2-YO'NALISH (Render limiti yangilanganda yoki server tiklanganda):
                # Agar Render 2 marta ketma-ket muvaffaqiyatli bo'lsa va hozir TUNNEL bo'lsa -> RENDER'ga qaytarish
                if current_target == "TUNNEL" and state["render_success_count"] >= 2:
                    logger.info("🎉 RENDER TIKLANDI! Render bulut serveriga avtomatik qaytarilmoqda...")
                    success = update_vercel_route(RENDER_URL, "RENDER")
                    if success:
                        state["current_target"] = "RENDER"
                        state["last_switch_time"] = time.strftime("%Y-%m-%d %H:%M:%S")
                        save_state(state)
                        msg = (
                            "🎉 <b>EduHujjat: Render limiti yangilandi va server to'liq tiklandi!</b>\n\n"
                            f"Vercel sayti avtomatik ravishda asosiy <b>Render bulut serveriga</b> (<code>{RENDER_URL}</code>) qaytarildi.\n"
                            "Barcha xizmatlar (AI Slayd, Hujjatlar, WebApp, Bot) yana to'liq bulutda uzluksiz ishlamoqda!"
                        )
                        await notify_owner_telegram(msg)
            else:
                state["render_fail_count"] += 1
                state["render_success_count"] = 0
                logger.warning(f"[HEALTH] Render: ISHLAMAYAPTI (ketma-ket {state['render_fail_count']} marta) | Hozirgi yo'nalish: {current_target}")

                # 1-YO'NALISH (Render limiti tugaganda / 503 Suspended):
                # Agar Render 2 marta ketma-ket xato bersa va hozir RENDER bo'lsa -> ZAXIRA TUNNELIGA o'tkazish
                if current_target == "RENDER" and state["render_fail_count"] >= 2:
                    logger.warning("🚨 RENDER LIMITI TUGADI (503) YOKI SERVER TO'XTADI! Zaxira tunneliga o'tkazilmoqda...")
                    tunnel_url = get_active_tunnel_url()
                    local_alive = await check_local_server_health()

                    if tunnel_url and local_alive:
                        success = update_vercel_route(tunnel_url, "TUNNEL")
                        if success:
                            state["current_target"] = "TUNNEL"
                            state["last_switch_time"] = time.strftime("%Y-%m-%d %H:%M:%S")
                            save_state(state)
                            msg = (
                                "⚠️ <b>EduHujjat: Render limiti tugadi yoki server to'xtab qoldi (HTTP 503)!</b>\n\n"
                                "Tizim uzilishsiz ishlashi uchun Vercel avtomatik ravishda <b>Zaxira (Cloudflare Tunnel)</b> serveriga ulandi.\n"
                                f"🌐 Jonli zaxira manzili: <code>{tunnel_url}</code>\n"
                                "✅ Telegram bot va sayt 100% uzilishsiz zaxira rejimida ishlamoqda!"
                            )
                            await notify_owner_telegram(msg)
                    else:
                        logger.error(f"Zaxiraga o'tib bo'lmadi: local_alive={local_alive}, tunnel_url={tunnel_url}")

            save_state(state)

        except Exception as e:
            logger.error(f"Watchdog kutilmagan xatosi: {e}", exc_info=True)

        await asyncio.sleep(CHECK_INTERVAL_SECONDS)


if __name__ == "__main__":
    try:
        asyncio.run(run_ha_watchdog())
    except KeyboardInterrupt:
        logger.info("Watchdog foydalanuvchi tomonidan to'xtatildi.")
