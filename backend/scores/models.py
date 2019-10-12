class Score:
    def __index__(self,  name: str, score: float):
        self._name = name
        self._score = score

    def to_json(self):
        return {
            'name': self._name,
            'score': self._score
        }
