import { render, screen } from "@testing-library/react";

import { CinematicTimeline } from "../CinematicTimeline";

test("renders ordered narrative cards", () => {
  render(
    <CinematicTimeline
      entity="Karna"
      overview="A concise overview."
      events={[
        {
          id: "1",
          title: "Birth",
          summary: "Born to Kunti",
          sequenceIndex: 0,
          eventPhase: "origin",
          sourcePage: 12,
          confidence: 0.9
        },
        {
          id: "2",
          title: "Death",
          summary: "Falls in battle",
          sequenceIndex: 5,
          eventPhase: "end",
          sourcePage: 440,
          confidence: 0.91
        }
      ]}
    />
  );

  expect(screen.getByText("Karna")).toBeInTheDocument();
  expect(screen.getByText("Born to Kunti")).toBeInTheDocument();
  expect(screen.getByText("Falls in battle")).toBeInTheDocument();
});
