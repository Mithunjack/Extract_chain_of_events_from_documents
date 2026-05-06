from __future__ import annotations

from collections import defaultdict

from app.models import EntityCandidate


ALIASES = {
    "radheya": "Karna",
    "vasusena": "Karna",
    "partha": "Arjuna",
    "kaunteya": "Arjuna",
}

KNOWN_CHARACTERS = [
    "Karna",
    "Radheya",
    "Vasusena",
    "Kunti",
    "Arjuna",
    "Duryodhana",
    "Krishna",
    "Bhishma",
    "Draupadi",
]


def extract_entities(texts: list[str]) -> list[EntityCandidate]:
    entities: dict[str, EntityCandidate] = {}
    mention_totals: defaultdict[str, int] = defaultdict(int)
    alias_sets: defaultdict[str, set[str]] = defaultdict(set)

    for text in texts:
        lowered = text.lower()
        for name in KNOWN_CHARACTERS:
            occurrences = lowered.count(name.lower())
            if not occurrences:
                continue
            canonical = ALIASES.get(name.lower(), name)
            mention_totals[canonical] += occurrences
            if canonical != name:
                alias_sets[canonical].add(name)

    for canonical_name, mention_count in mention_totals.items():
        entities[canonical_name] = EntityCandidate(
            canonical_name=canonical_name,
            aliases=alias_sets[canonical_name],
            mention_count=mention_count,
            entity_type="character",
        )

    return sorted(
        entities.values(),
        key=lambda entity: (-entity.mention_count, entity.canonical_name),
    )
