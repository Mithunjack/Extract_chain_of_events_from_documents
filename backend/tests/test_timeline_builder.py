from app.services.timeline_builder import build_timeline


def test_build_timeline_orders_birth_to_death() -> None:
    chunks = [
        {"page_number": 1, "text": "Karna was born to Kunti."},
        {"page_number": 2, "text": "Karna trained with fierce discipline."},
        {"page_number": 3, "text": "Karna died in battle."},
    ]

    timeline = build_timeline("Karna", chunks)

    assert [event.title for event in timeline] == ["Birth", "Training", "Death"]
    assert timeline[0].sequence_index == 0
    assert timeline[-1].sequence_index == 2
