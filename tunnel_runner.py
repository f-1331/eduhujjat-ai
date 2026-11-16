import asyncio
import logging
import os
import re
import subprocess
import sys
import time
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s : %(message)s"
)
logger = logging.getLogger("tunnel_runner")

BASE_DIR = Path(__file__).resolve().parent
LOCAL_TARGET = "http://127.0.0.1:10000"


def get_quick_tunnel():
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
        logger.error("35 soniya ichida Cloudflare tunnel URL olinmadi.")
        proc.terminate()
        return None, None

    logger.info(f"✅ ZAXIRA TUNNEL ISHGA TUSHDI: {tunnel_url}")
    with open(BASE_DIR / "tunnel_url.txt", "w", encoding="utf-8") as f:
        f.write(tunnel_url)

    return proc, tunnel_url


def run_standalone_tunnel():
    """Run tunnel continuously with auto-restart on exit."""
    while True:
        proc, url = get_quick_tunnel()
        if not proc:
            logger.warning("Tunnel ishga tushmadi. 5 soniyadan so'ng qayta uriniladi...")
            time.sleep(5)
            continue

        print(f"ACTIVE_URL={url}")
        try:
            while proc.poll() is None:
                line = proc.stdout.readline()
                if line:
                    logger.debug(line.strip())
                time.sleep(0.1)
        except KeyboardInterrupt:
            logger.info("Tunnel foydalanuvchi tomonidan to'xtatildi.")
            proc.terminate()
            break
        except Exception as e:
            logger.error(f"Tunnelda xatolik: {e}")
            if proc.poll() is None:
                proc.terminate()
        
        logger.warning("Tunnel uzildi. 3 soniyada qayta ulanmoqda...")
        time.sleep(3)


if __name__ == "__main__":
    run_standalone_tunnel()
