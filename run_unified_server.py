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
OWNER_TELEGRAM_ID = 6707839718


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


def start_cloudflared_tunnel():
    """Start cloudflared in the background and extract the live HTTPS tunnel URL."""
    cf_binary = BASE_DIR / "cloudflared.exe"
    if not cf_binary.exists():
        logger.error(f"cloudflared.exe topilmadi: {cf_binary}")
        return None, None

    cmd = [str(cf_binary), "tunnel", "--url", LOCAL_TARGET, "--no-autoupdate"]
    logger.info(f"Cloudflare tezkor tunnel ishga tushirilmoqda ({LOCAL_TARGET})...")
    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    tunnel_url = None
    start = time.time()
    while time.time() - start < 35:
        line = proc.stdout.readline()
        if not line:
            time.sleep(0.1)
            continue
        line_clean = line.strip()
        if "trycloudflare.com" in line_clean:
            match = re.search(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com", line_clean)
            if match:
                tunnel_url = match.group(0)
                break

    if not tunnel_url:
        logger.error("Cloudflare tunnel URL 35 soniya ichida olinmadi.")
        proc.terminate()
        return None, None

    logger.info(f"✅ Jonli Cloudflare Tunnel URL: {tunnel_url}")
    with open(BASE_DIR / "tunnel_url.txt", "w", encoding="utf-8") as f:
        f.write(tunnel_url)

    return proc, tunnel_url


def update_vercel_json_if_needed(tunnel_url: str):
    """If Render is suspended/down, immediately point vercel.json to the active tunnel."""
    vercel_path = BASE_DIR / "vercel.json"
    if not vercel_path.exists():
        return

    # Check Render status
    render_suspended = True
    try:
        r = httpx.get(f"{RENDER_URL}/health", timeout=6.0, follow_redirects=True)
        if r.status_code == 200:
            render_suspended = False
    except Exception:
        render_suspended = True

    if render_suspended:
        logger.warning(f"Render hozirda ishlamayapti (503 yoki suspend). Vercel tunnelga ulanmoqda -> {tunnel_url}")
        try:
            with open(vercel_path, "r", encoding="utf-8") as f:
                content = f.read()

            old_pattern = r'https://[a-zA-Z0-9\.\-]+\.(?:onrender\.com|trycloudflare\.com)'
            new_content = re.sub(old_pattern, tunnel_url, content)

            if new_content != content:
                with open(vercel_path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                logger.info(f"vercel.json yangilandi: yangi target = {tunnel_url}")

                subprocess.run(["git", "add", "vercel.json"], cwd=str(BASE_DIR), check=True)
                subprocess.run(["git", "commit", "-m", f"chore(ha-failover): switch to local tunnel ({tunnel_url})"], cwd=str(BASE_DIR), check=True)
                subprocess.run(["git", "push", "origin", "main"], cwd=str(BASE_DIR), check=True)
                logger.info("✅ Vercel yo'nalishi GitHub'ga push qilindi!")

                # Telegram alert
                token = get_bot_token()
                if token:
                    try:
                        msg = (
                            "⚠️ <b>EduHujjat Zaxira Tizimi Ishga Tushirildi!</b>\n\n"
                            "Render oylik limiti tugagani (HTTP 503) sababli, loyiha kompyuterdagi zaxira serveriga o'tkazildi.\n"
                            f"🌐 Zaxira Tunnel URL: <code>{tunnel_url}</code>\n"
                            "✅ Sayt va Telegram bot to'liq faol!"
                        )
                        httpx.post(
                            f"https://api.telegram.org/bot{token}/sendMessage",
                            json={"chat_id": OWNER_TELEGRAM_ID, "text": msg, "parse_mode": "HTML"},
                            timeout=8.0
                        )
                    except Exception:
                        pass
            else:
                logger.info("vercel.json allaqachon tunnel manziliga sozlangan.")
        except Exception as e:
            logger.error(f"vercel.json yangilashda xato: {e}")


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


async def main_unified():
    logger.info("=" * 65)
    logger.info("🚀 EduHujjat Unified Server (Local Node Bot + Cloudflare HA Tunnel)")
    logger.info("=" * 65)

    # 1. Start Cloudflare Tunnel
    cf_proc, tunnel_url = start_cloudflared_tunnel()
    if not tunnel_url:
        logger.error("Tunnel ishga tushmadi. To'xtatilmoqda.")
        sys.exit(1)

    # 2. Sync Vercel if Render is down
    update_vercel_json_if_needed(tunnel_url)

    # 3. Start Node.js Bot & Local API Server on port 10000
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

    # Tasks for async stdout
    cf_task = asyncio.create_task(monitor_stream(cf_proc.stdout, "Cloudflare"))
    node_task = asyncio.create_task(monitor_stream(node_proc.stdout, "EduBot"))

    try:
        while True:
            await asyncio.sleep(2)
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

            if cf_proc.poll() is not None:
                logger.warning("Cloudflare tunnel uzildi! Qayta ulanmoqda...")
                cf_proc, tunnel_url = start_cloudflared_tunnel()
                if tunnel_url:
                    update_vercel_json_if_needed(tunnel_url)
                    cf_task.cancel()
                    cf_task = asyncio.create_task(monitor_stream(cf_proc.stdout, "Cloudflare"))

    except (KeyboardInterrupt, SystemExit):
        logger.info("Server to'xtatilmoqda...")
    finally:
        if node_proc and node_proc.poll() is None:
            node_proc.terminate()
        if cf_proc and cf_proc.poll() is None:
            cf_proc.terminate()
        cf_task.cancel()
        node_task.cancel()
        logger.info("Unified server to'liq to'xtatildi.")


if __name__ == "__main__":
    try:
        asyncio.run(main_unified())
    except KeyboardInterrupt:
        logger.info("Foydalanuvchi tomonidan to'xtatildi.")
