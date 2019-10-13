class Score:
    def __init__(self,  name: str, score: float, max_time: str):
        self._name = name
        self._score = score
        self._max_time = max_time

    def to_json(self):
        return {
            'name': self._name,
            'score': f'{self._score:.2f}',
            'singlePlayerScore': f'{int(self._max_time):d}',
        }

    @property
    def score(self) -> float:
        return self._score
