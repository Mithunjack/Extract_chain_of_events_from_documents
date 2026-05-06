from __future__ import annotations

import math
from collections import Counter


def embed_text(text: str) -> Counter[str]:
    return Counter(token.lower() for token in text.split())


def cosine_similarity(left: Counter[str], right: Counter[str]) -> float:
    intersection = set(left) & set(right)
    numerator = sum(left[token] * right[token] for token in intersection)
    if numerator == 0:
        return 0.0
    left_norm = math.sqrt(sum(value * value for value in left.values()))
    right_norm = math.sqrt(sum(value * value for value in right.values()))
    if not left_norm or not right_norm:
        return 0.0
    return numerator / (left_norm * right_norm)
