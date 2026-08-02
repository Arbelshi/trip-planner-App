import { fireEvent, render, screen } from "@testing-library/react";
import MyTripApp from "./MyTripApp";
import { toast } from "react-hot-toast";

jest.mock("react-hot-toast", () => ({
  Toaster: () => <div data-testid="toaster" />,
  toast: {
    success: jest.fn(),
  },
}));

jest.mock("./AddTrip", () => {
  return function MockAddTrip({ onAddTrip }) {
    return (
      <button
        type="button"
        onClick={() =>
          onAddTrip({
            id: "trip-1",
            name: "Rome",
            country: "Italy",
            startDate: "2026-09-01",
            endDate: "2026-09-05",
            budget: 500,
            currency: "€",
            selectedCities: [],
            activitiesByCity: {},
          })
        }
      >
        Mock add trip
      </button>
    );
  };
});

jest.mock("./AddActivity", () => {
  return function MockAddActivity({ onAddActivity, tripCountry }) {
    return (
      <div>
        <span>Country: {tripCountry}</span>

        <button
          type="button"
          onClick={() =>
            onAddActivity({
              id: "activity-1",
              city: "Rome",
              date: "2026-09-02",
              startTime: "10:00",
              endTime: "12:00",
              description: "Museum visit",
              category: "Museum",
              place: "Vatican Museum",
              cost: 25,
              notes: "",
              status: "planned",
              reservationType: "none",
              isReserved: false,
              priority: "Must do",
            })
          }
        >
          Mock add activity
        </button>
      </div>
    );
  };
});

jest.mock("./TripItem", () => {
  return function MockTripItem({
    trip,
    onDelete,
    onSelect,
    isActive,
  }) {
    return (
      <div>
        <span>
          {trip.name}
          {isActive ? " - active" : ""}
        </span>

        <button
          type="button"
          onClick={() => onSelect(trip.id)}
        >
          Select {trip.name}
        </button>

        <button
          type="button"
          onClick={() => onDelete(trip.id)}
        >
          Delete {trip.name}
        </button>
      </div>
    );
  };
});

jest.mock("./ActivityItem", () => {
  return function MockActivityItem({ activity, onDelete }) {
    return (
      <div>
        <span>{activity.description}</span>

        <button
          type="button"
          onClick={() => onDelete(activity.id)}
        >
          Delete activity
        </button>
      </div>
    );
  };
});

jest.mock("./TripActivitiesPanel", () => {
  return function MockTripActivitiesPanel({
    filteredCount,
    activities,
    setCategoryFilter,
  }) {
    return (
      <div>
        <span>
          {filteredCount} shown out of {activities.length}
        </span>

        <button
          type="button"
          onClick={() => setCategoryFilter("Restaurant")}
        >
          Filter restaurants
        </button>
      </div>
    );
  };
});

jest.mock("./BudgetPanel", () => {
  return function MockBudgetPanel({
    activeTrip,
    totalBudget,
    filteredBudget,
  }) {
    return (
      <div>
        <span>
          Budget trip: {activeTrip ? activeTrip.name : "none"}
        </span>
        <span>Total budget: {totalBudget}</span>
        <span>Filtered budget: {filteredBudget}</span>
      </div>
    );
  };
});

const savedTrip = {
  id: "saved-trip",
  name: "Milan",
  country: "Italy",
  startDate: "2026-10-01",
  endDate: "2026-10-05",
  budget: 300,
  currency: "€",
  selectedCities: [],
  activitiesByCity: {
    Milan: {
      "2026-10-02": [
        {
          id: "saved-activity",
          city: "Milan",
          date: "2026-10-02",
          startTime: "09:00",
          endTime: "11:00",
          description: "Shopping",
          category: "Shopping",
          place: "City center",
          cost: 40,
          notes: "",
          status: "planned",
          reservationType: "none",
          isReserved: false,
          priority: "Optional",
        },
      ],
    },
  },
};

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();

  window.confirm = jest.fn(() => true);
});

test("shows the empty state when there are no trips", () => {
  render(<MyTripApp />);

  expect(
    screen.getByText("No trips yet. Create your first one."),
  ).toBeInTheDocument();

  expect(
    screen.getByText("Select a trip to see its planner."),
  ).toBeInTheDocument();

  expect(
    screen.getByText("Select a trip to add activities."),
  ).toBeInTheDocument();

  expect(
    screen.getByText("Budget trip: none"),
  ).toBeInTheDocument();
});

test("loads saved trips from localStorage", () => {
  localStorage.setItem(
    "mytrip_v1",
    JSON.stringify([savedTrip]),
  );

  render(<MyTripApp />);

  expect(screen.getByText("Milan")).toBeInTheDocument();

  expect(
    screen.getByRole("button", {
      name: "Select Milan",
    }),
  ).toBeInTheDocument();
});

test("adds a trip and makes it active", () => {
  render(<MyTripApp />);

  fireEvent.click(
    screen.getByRole("button", {
      name: "Mock add trip",
    }),
  );

  expect(
    screen.getByText("Rome - active"),
  ).toBeInTheDocument();

  expect(
    screen.getByText("Planner · Rome"),
  ).toBeInTheDocument();

  expect(
    screen.getByText("Add Activity · Rome"),
  ).toBeInTheDocument();

  expect(
    screen.getByText("Country: Italy"),
  ).toBeInTheDocument();

  expect(toast.success).toHaveBeenCalledWith(
    "Trip created successfully",
  );
});

test("selects a saved trip", () => {
  localStorage.setItem(
    "mytrip_v1",
    JSON.stringify([savedTrip]),
  );

  render(<MyTripApp />);

  fireEvent.click(
    screen.getByRole("button", {
      name: "Select Milan",
    }),
  );

  expect(
    screen.getByText("Milan - active"),
  ).toBeInTheDocument();

  expect(
    screen.getByText("Planner · Milan"),
  ).toBeInTheDocument();

  expect(
    screen.getByText("Shopping"),
  ).toBeInTheDocument();
});

test("deletes a trip after confirmation", () => {
  localStorage.setItem(
    "mytrip_v1",
    JSON.stringify([savedTrip]),
  );

  render(<MyTripApp />);

  fireEvent.click(
    screen.getByRole("button", {
      name: "Delete Milan",
    }),
  );

  expect(window.confirm).toHaveBeenCalledWith(
    "Delete this trip?",
  );

  expect(screen.queryByText("Milan")).not.toBeInTheDocument();

  expect(
    screen.getByText("No trips yet. Create your first one."),
  ).toBeInTheDocument();
});

test("does not delete a trip when confirmation is cancelled", () => {
  window.confirm = jest.fn(() => false);

  localStorage.setItem(
    "mytrip_v1",
    JSON.stringify([savedTrip]),
  );

  render(<MyTripApp />);

  fireEvent.click(
    screen.getByRole("button", {
      name: "Delete Milan",
    }),
  );

  expect(screen.getByText("Milan")).toBeInTheDocument();
});

test("adds an activity to the active trip", () => {
  render(<MyTripApp />);

  fireEvent.click(
    screen.getByRole("button", {
      name: "Mock add trip",
    }),
  );

  expect(
    screen.getByText("No activities yet."),
  ).toBeInTheDocument();

  fireEvent.click(
    screen.getByRole("button", {
      name: "Mock add activity",
    }),
  );

  expect(
    screen.getByText("Museum visit"),
  ).toBeInTheDocument();

  expect(
    screen.getByText("Total budget: 25"),
  ).toBeInTheDocument();

  expect(toast.success).toHaveBeenCalledWith(
    "Activity added to your trip",
  );
});

test("deletes an activity after confirmation", () => {
  localStorage.setItem(
    "mytrip_v1",
    JSON.stringify([savedTrip]),
  );

  render(<MyTripApp />);

  fireEvent.click(
    screen.getByRole("button", {
      name: "Select Milan",
    }),
  );

  expect(screen.getByText("Shopping")).toBeInTheDocument();

  fireEvent.click(
    screen.getByRole("button", {
      name: "Delete activity",
    }),
  );

  expect(window.confirm).toHaveBeenCalledWith(
    "Delete this activity?",
  );

  expect(
    screen.queryByText("Shopping"),
  ).not.toBeInTheDocument();

  expect(
    screen.getByText("No activities yet."),
  ).toBeInTheDocument();

  expect(toast.success).toHaveBeenCalledWith(
    "Activity deleted",
  );
});

test("shows no matching activities after applying a filter", () => {
  localStorage.setItem(
    "mytrip_v1",
    JSON.stringify([savedTrip]),
  );

  render(<MyTripApp />);

  fireEvent.click(
    screen.getByRole("button", {
      name: "Select Milan",
    }),
  );

  fireEvent.click(
    screen.getByRole("button", {
      name: "Filter restaurants",
    }),
  );

  expect(
    screen.getByText("No activities match the filters."),
  ).toBeInTheDocument();
});

test("saves trips to localStorage", () => {
  const setItemSpy = jest.spyOn(
    Storage.prototype,
    "setItem",
  );

  render(<MyTripApp />);

  fireEvent.click(
    screen.getByRole("button", {
      name: "Mock add trip",
    }),
  );

  expect(setItemSpy).toHaveBeenCalledWith(
    "mytrip_v1",
    expect.stringContaining('"name":"Rome"'),
  );

  setItemSpy.mockRestore();
});