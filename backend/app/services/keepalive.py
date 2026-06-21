import asyncio
import os
import httpx
from app.utils.logger import logger

PING_INTERVAL_SECONDS = 600  # 10 minutes
SELF_URL = os.getenv("SELF_URL", "http://localhost:8000")


async def _ping_loop():
    await asyncio.sleep(PING_INTERVAL_SECONDS)
    async with httpx.AsyncClient(timeout=10) as client:
        while True:
            try:
                response = await client.get(f"{SELF_URL}/health")
                logger.info(f"Keepalive ping → {SELF_URL}/health | status={response.status_code}")
            except Exception as e:
                logger.warning(f"Keepalive ping failed: {e}")
            await asyncio.sleep(PING_INTERVAL_SECONDS)


def start_keepalive() -> asyncio.Task:
    return asyncio.create_task(_ping_loop())
