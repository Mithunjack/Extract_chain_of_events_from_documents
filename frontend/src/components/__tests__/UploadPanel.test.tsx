import { render, screen } from "@testing-library/react";

import App from "../../App";

test("renders the narrative timeline headline", () => {
  render(<App />);

  expect(screen.getByText(/Narrative Atlas/i)).toBeInTheDocument();
  expect(
    screen.getByText(/Cinematic timelines for long-form documents/i)
  ).toBeInTheDocument();
});
