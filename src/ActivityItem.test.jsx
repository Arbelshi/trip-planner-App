import { fireEvent, render, screen } from "@testing-library/react";
import ActivityItem from "./ActivityItem";

const futureActivity = {
  id: "activity-1",
  description: "Visit museum",
  city: "Rome",
  date: "2099-08-01",
  startTime: "10:00",
  endTime: "12:00",
  status: "planned",
  priority: "Must do",
  place: "Vatican Museum",
  category: "Museum",
  cost: 25,
  reservationType: "required",
  isReserved: true,
  notes: "Buy tickets in advance",
};

test("displays the main activity information", () => {
  render(
    <ActivityItem
      activity={futureActivity}
      onDelete={jest.fn()}
      currencySymbol="€"
    />,
  );

  expect(screen.getByText("Visit museum")).toBeInTheDocument();
  expect(screen.getByText(/Rome/)).toBeInTheDocument();
  expect(screen.getByText(/2099-08-01/)).toBeInTheDocument();
  expect(screen.getByText("planned")).toBeInTheDocument();
  expect(screen.getByText("Must do")).toBeInTheDocument();
});

test("shows the activity details when the activity is clicked", () => {
  render(
    <ActivityItem
      activity={futureActivity}
      onDelete={jest.fn()}
      currencySymbol="€"
    />,
  );

  expect(screen.queryByText("Vatican Museum")).not.toBeInTheDocument();

  fireEvent.click(screen.getByText("Visit museum"));

  expect(screen.getByText("Vatican Museum")).toBeInTheDocument();
  expect(screen.getByText("Museum")).toBeInTheDocument();
  expect(screen.getByText("€25")).toBeInTheDocument();
  expect(screen.getByText("required")).toBeInTheDocument();
  expect(screen.getByText("Yes")).toBeInTheDocument();
  expect(screen.getByText("Buy tickets in advance")).toBeInTheDocument();
});

test("hides the activity details when clicked again", () => {
  render(
    <ActivityItem
      activity={futureActivity}
      onDelete={jest.fn()}
      currencySymbol="€"
    />,
  );

  fireEvent.click(screen.getByText("Visit museum"));

  expect(screen.getByText("Vatican Museum")).toBeInTheDocument();

  fireEvent.click(screen.getByText("Visit museum"));

  expect(screen.queryByText("Vatican Museum")).not.toBeInTheDocument();
});

test("deletes the activity when the delete button is clicked", () => {
  const onDelete = jest.fn();

  render(
    <ActivityItem
      activity={futureActivity}
      onDelete={onDelete}
      currencySymbol="€"
    />,
  );

  fireEvent.click(
    screen.getByRole("button", {
      name: "✕",
    }),
  );

  expect(onDelete).toHaveBeenCalledTimes(1);
  expect(onDelete).toHaveBeenCalledWith("activity-1");
});

test("does not open the details when the delete button is clicked", () => {
  render(
    <ActivityItem
      activity={futureActivity}
      onDelete={jest.fn()}
      currencySymbol="€"
    />,
  );

  fireEvent.click(
    screen.getByRole("button", {
      name: "✕",
    }),
  );

  expect(screen.queryByText("Vatican Museum")).not.toBeInTheDocument();
});

test("shows overdue label for an activity in the past", () => {
  const pastActivity = {
    ...futureActivity,
    id: "past-activity",
    date: "2020-01-01",
  };

  const { container } = render(
    <ActivityItem
      activity={pastActivity}
      onDelete={jest.fn()}
      currencySymbol="€"
    />,
  );

  expect(screen.getByText("Overdue")).toBeInTheDocument();
  expect(container.firstChild).toHaveClass("overdue");
});

test("does not show overdue label for a future activity", () => {
  const { container } = render(
    <ActivityItem
      activity={futureActivity}
      onDelete={jest.fn()}
      currencySymbol="€"
    />,
  );

  expect(screen.queryByText("Overdue")).not.toBeInTheDocument();
  expect(container.firstChild).not.toHaveClass("overdue");
});

test("shows No notes when the activity has no notes", () => {
  const activityWithoutNotes = {
    ...futureActivity,
    notes: "",
  };

  render(
    <ActivityItem
      activity={activityWithoutNotes}
      onDelete={jest.fn()}
      currencySymbol="€"
    />,
  );

  fireEvent.click(screen.getByText("Visit museum"));

  expect(screen.getByText("No notes")).toBeInTheDocument();
});

test("does not show reserved status when no reservation is needed", () => {
  const activityWithoutReservation = {
    ...futureActivity,
    reservationType: "none",
    isReserved: false,
  };

  render(
    <ActivityItem
      activity={activityWithoutReservation}
      onDelete={jest.fn()}
      currencySymbol="€"
    />,
  );

  fireEvent.click(screen.getByText("Visit museum"));

  expect(screen.getByText("none")).toBeInTheDocument();
  expect(screen.queryByText("Yes")).not.toBeInTheDocument();
  expect(screen.queryByText("No")).not.toBeInTheDocument();
});

test("uses zero when the activity cost is missing", () => {
  const activityWithoutCost = {
    ...futureActivity,
    cost: undefined,
  };

  render(
    <ActivityItem
      activity={activityWithoutCost}
      onDelete={jest.fn()}
      currencySymbol="$"
    />,
  );

  fireEvent.click(screen.getByText("Visit museum"));

  expect(screen.getByText("$0")).toBeInTheDocument();
});