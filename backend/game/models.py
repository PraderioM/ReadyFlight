from typing import Optional, List
import asyncio

from datetime import date


class EndGame:
    def __init__(self, end: bool, won: Optional[bool],
                 error: Optional[bool], message: Optional[str]):
        self._end = end
        self._won = won
        self._error = error
        self._message = message

    def to_json(self):
        return {'end': self._end,
                'won': self._won,
                'error': self._error,
                'message': self._message}


class GameResponse:
    def __init__(self, position: float, new_plays_to_receive: List[str],
                 new_plays_afflicted: List[str], end_game: EndGame):
        self._position = position
        self._new_plays_to_receive = new_plays_to_receive
        self._new_plays_afflicted = new_plays_afflicted
        self._end_game = end_game

    def to_json(self):
        return {
            'position': self._position,
            'newPlaysToReceive': self._new_plays_to_receive,
            'newPlaysAfflicted': self._new_plays_afflicted,
            'endGame': self._end_game.to_json()
        }


class Player:
    def __init__(self, last_update_time: date, position: float,
                 name: str):
        self.last_update_time = last_update_time
        self.position = position
        self.plays_to_send: asyncio.Queue = asyncio.Queue()
        self.plays_suffered: asyncio.Queue = asyncio.Queue()
        self.name = name


class Game:
    def __init__(self, game_start_time: Optional[date] = None, player_1: Optional[Player] = None,
                 player_2: Optional[Player] = None):
        self.game_start_time = game_start_time
        self.player_1 = player_1
        self.player_2 = player_2

        pass
