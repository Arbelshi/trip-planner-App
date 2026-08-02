import { fireEvent, render, screen } from "@testing-library/react";
import TripActivitiesPanel from "./TripActivitiesPanel";

function renderPanel(overrides = {}) {
  const props = {
    activities: [{ id: "1" }, { id: "2" }, { id: "3" }],
    filteredCount: 2,

    categoryFilter: "all",
    setCategoryFilter: jest.fn(),

    reservedFilter: "all",
    setReservedFilter: jest.fn(),

    statusFilter: "all",
    setStatusFilter: jest.fn(),

    reservationNeedFilter: "all",
    setReservationNeedFilter: jest.fn(),

    sortBy: "date",
    setSortBy: jest.fn(),

    ...overrides,
  };

  render(<TripActivitiesPanel {...props} />);

  return props;
}

test("displays the filtered and total activity counts", () => {
  renderPanel();

  expect(
    screen.getByText("2 shown out of 3"),
  ).toBeInTheDocument();
});

test("updates the category filter", () => {
  const props = renderPanel();

  const selects = screen.getAllByRole("combobox");

  fireEvent.change(selects[0], {
    target: { value: "Museum" },
  });

  expect(props.setCategoryFilter).toHaveBeenCalledWith("Museum");
});

test("updates the status filter", () => {
  const props = renderPanel();

  const selects = screen.getAllByRole("combobox");

  fireEvent.change(selects[1], {
    target: { value: "booked" },
  });

  expect(props.setStatusFilter).toHaveBeenCalledWith("booked");
});

test("updates the reservation need filter", () => {
  const props = renderPanel();

  const selects = screen.getAllByRole("combobox");

  fireEvent.change(selects[2], {
    target: { value: "required" },
  });

  expect(
    props.setReservationNeedFilter,
  ).toHaveBeenCalledWith("required");
});

test("updates the reserved status filter", () => {
  const props = renderPanel();

  const selects = screen.getAllByRole("combobox");

  fireEvent.change(selects[3], {
    target: { value: "reserved" },
  });

  expect(props.setReservedFilter).toHaveBeenCalledWith("reserved");
});

test("updates the sort order", () => {
  const props = renderPanel();

  const selects = screen.getAllByRole("combobox");

  fireEvent.change(selects[4], {
    target: { value: "cost" },
  });

  expect(props.setSortBy).toHaveBeenCalledWith("cost");
});

test("clears all filters", () => {
  const props = renderPanel({
    categoryFilter: "Museum",
    reservedFilter: "reserved",
    statusFilter: "booked",
    reservationNeedFilter: "required",
    sortBy: "cost",
  });

  fireEvent.click(
    screen.getByRole("button", {
      name: "Clear filters",
    }),
  );

  expect(props.setCategoryFilter).toHaveBeenCalledWith("all");
  expect(props.setReservedFilter).toHaveBeenCalledWith("all");
  expect(props.setStatusFilter).toHaveBeenCalledWith("all");
  expect(
    props.setReservationNeedFilter,
  ).toHaveBeenCalledWith("all");
  expect(props.setSortBy).toHaveBeenCalledWith("date");
});

test("shows zero results when no activities match the filters", () => {
  renderPanel({
    activities: [{ id: "1" }, { id: "2" }],
    filteredCount: 0,
  });

  expect(
    screen.getByText("0 shown out of 2"),
  ).toBeInTheDocument();
});

test("shows zero total when there are no activities", () => {
  renderPanel({
    activities: [],
    filteredCount: 0,
  });

  expect(
    screen.getByText("0 shown out of 0"),
  ).toBeInTheDocument();
});