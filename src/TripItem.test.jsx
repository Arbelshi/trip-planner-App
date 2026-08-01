import { fireEvent, render, screen } from "@testing-library/react";
import TripItem from "./TripItem";

test("selects the trip when clicked", () => {
  const onSelect = jest.fn();

  render(
    <TripItem
      trip={{
        id: 1,
        name: "Rome",
        country: "Italy",
        startDate: "2099-06-01",
        endDate: "2099-06-10",
        budget: 500,
        currency: "€",
      }}
      onSelect={onSelect}
      onDelete={jest.fn()}
      isActive={false}
    />
  );

  fireEvent.click(screen.getByText("Rome"));

  expect(onSelect).toHaveBeenCalledWith(1);
});