from typing import Optional, List, Tuple

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
        pass


class Player:
    def __init__(self, last_update_time: date, position: float,
                 new_plays_sent: List[str],
                 new_plays_suffered: List[str]):
        self._last_update_time = last_update_time
        self._position = position
        self._new_play_sent = new_plays_sent
        self._new_play_suffered = new_plays_suffered

        pass


class Game:
    def __init__(self, game_start_time: date, player_1: Player, player_2: Player):
        self._game_start_time = game_start_time
        self._player_1 = player_1
        self._player_2 = player_2

        pass
