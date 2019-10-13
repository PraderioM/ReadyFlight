class Score:
    def __init__(self,  name: str, score: float, max_time: str):
        self._name = name
        self._score = score
        self._max_time = max_time

    def to_json(self):
        return {
            'name': self._name,
            'score': self._score,
            'singlePlayerScore': self._max_time,
        }
