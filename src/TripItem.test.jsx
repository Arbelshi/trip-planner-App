import { fireEvent, render, screen } from "@testing-library/react";
import TripItem from "./TripItem";

const futureTrip = {
  id: 1,
  name: "Rome",
  country: "Italy",
  startDate: "2099-06-01",
  endDate: "2099-06-10",
  budget: 500,
  currency: "€",
};

test("selects the trip when clicked", () => {
  const onSelect = jest.fn();

  render(
    <TripItem
      trip={futureTrip}
      onSelect={onSelect}
      onDelete={jest.fn()}
      isActive={false}
    />,
  );

  fireEvent.click(screen.getByText("Rome"));

  expect(onSelect).toHaveBeenCalledTimes(1);
  expect(onSelect).toHaveBeenCalledWith(1);
});

test("displays the trip details", () => {
  render(
    <TripItem
      trip={futureTrip}
      onSelect={jest.fn()}
      onDelete={jest.fn()}
      isActive={false}
    />,
  );

  expect(screen.getByText("Rome")).toBeInTheDocument();
  expect(screen.getByText(/Italy/)).toBeInTheDocument();
  expect(screen.getByText(/2099-06-01/)).toBeInTheDocument();
  expect(screen.getByText(/2099-06-10/)).toBeInTheDocument();
  expect(screen.getByText("€500")).toBeInTheDocument();
});

test("deletes the trip when the delete button is clicked", () => {
  const onDelete = jest.fn();

  render(
    <TripItem
      trip={futureTrip}
      onSelect={jest.fn()}
      onDelete={onDelete}
      isActive={false}
    />,
  );

  fireEvent.click(
screen.getByRole("button", {
  name: "✕",
})
  );

  expect(onDelete).toHaveBeenCalledTimes(1);
  expect(onDelete).toHaveBeenCalledWith(1);
});

test("does not select the trip when the delete button is clicked", () => {
  const onSelect = jest.fn();
  const onDelete = jest.fn();

  render(
    <TripItem
      trip={futureTrip}
      onSelect={onSelect}
      onDelete={onDelete}
      isActive={false}
    />,
  );

  fireEvent.click(
screen.getByRole("button", {
  name: "✕",
})
  );

  expect(onDelete).toHaveBeenCalledWith(1);
  expect(onSelect).not.toHaveBeenCalled();
});

test("adds the activeTrip class when the trip is active", () => {
  const { container } = render(
    <TripItem
      trip={futureTrip}
      onSelect={jest.fn()}
      onDelete={jest.fn()}
      isActive={true}
    />,
  );

  expect(container.firstChild).toHaveClass("activeTrip");
});

test("does not add the activeTrip class when the trip is not active", () => {
  const { container } = render(
    <TripItem
      trip={futureTrip}
      onSelect={jest.fn()}
      onDelete={jest.fn()}
      isActive={false}
    />,
  );

  expect(container.firstChild).not.toHaveClass("activeTrip");
});

test("shows that the trip has ended when the end date is in the past", () => {
  const pastTrip = {
    ...futureTrip,
    id: 2,
    name: "Past trip",
    startDate: "2020-01-01",
    endDate: "2020-01-10",
  };

  const { container } = render(
    <TripItem
      trip={pastTrip}
      onSelect={jest.fn()}
      onDelete={jest.fn()}
      isActive={false}
    />,
  );

  expect(screen.getByText("Trip ended")).toBeInTheDocument();
  expect(container.firstChild).toHaveClass("trip-overdue");
});

test("does not show the overdue label for a future trip", () => {
  const { container } = render(
    <TripItem
      trip={futureTrip}
      onSelect={jest.fn()}
      onDelete={jest.fn()}
      isActive={false}
    />,
  );

  expect(screen.queryByText("Trip ended")).not.toBeInTheDocument();
  expect(container.firstChild).not.toHaveClass("trip-overdue");
});

test("uses euro as the default currency when currency is missing", () => {
  const tripWithoutCurrency = {
    ...futureTrip,
    currency: undefined,
  };

  render(
    <TripItem
      trip={tripWithoutCurrency}
      onSelect={jest.fn()}
      onDelete={jest.fn()}
      isActive={false}
    />,
  );

  expect(screen.getByText("€500")).toBeInTheDocument();
});