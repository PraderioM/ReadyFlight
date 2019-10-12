from typing import Optional, List


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
