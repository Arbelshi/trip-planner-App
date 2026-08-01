import { fireEvent, render, screen } from "@testing-library/react";
import AddActivity from "./AddActivity";

test("AddActivity shows an error when no city is selected", () => {
  render(<AddActivity onAddActivity={jest.fn()} tripCountry="" />);
  fireEvent.click(screen.getByRole("button", { name: "Add activity" }));

  expect(screen.getByText("Please choose city")).toBeInTheDocument();
});
