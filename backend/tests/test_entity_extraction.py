from app.services.entity_extraction import extract_entities


def test_extract_entities_merges_aliases() -> None:
    chunks = [
        "Karna was born to Kunti.",
        "Radheya trained in warfare.",
        "Karna entered the tournament.",
    ]

    entities = extract_entities(chunks)

    karna = next(entity for entity in entities if entity.canonical_name == "Karna")
    assert "Radheya" in karna.aliases
    assert karna.mention_count == 3
