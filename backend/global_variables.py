from typing import Dict
import asyncio

from backend.game.models import Game

ACTIVE_GAMES: Dict[str, Game] = {}
queue1 = asyncio.Queue()
queue2 = asyncio.Queue()
