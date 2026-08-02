import { render, screen } from "@testing-library/react";
import BudgetPanel from "./BudgetPanel";

test("displays the budget for an active trip", () => {
  render(
    <BudgetPanel
      activeTrip={{ id: 1, name: "Rome" }}
      activities={[{ id: 1, name: "Museum" }]}
      currencySymbol="$"
      totalBudget={100}
      filteredBudget={80}
      budgetByCategory={{ Food: 50 }}
    />,
  );

  expect(screen.getByText("Budget")).toBeInTheDocument();
  expect(screen.getByText("$100.00")).toBeInTheDocument();
  expect(screen.getByText("$80.00")).toBeInTheDocument();
  expect(screen.getByText("Food")).toBeInTheDocument();
  expect(screen.getByText("$50.00")).toBeInTheDocument();
});

test("shows a message when no trip is selected", () => {
  render(
    <BudgetPanel
      activeTrip={null}
      activities={[]}
      currencySymbol="$"
      totalBudget={0}
      filteredBudget={0}
      budgetByCategory={{}}
    />,
  );

  expect(
    screen.getByText("Select a trip to see budget."),
  ).toBeInTheDocument();

  expect(
    screen.queryByText("No activities yet."),
  ).not.toBeInTheDocument();
});

test("shows a message when the active trip has no activities", () => {
  render(
    <BudgetPanel
      activeTrip={{ id: 1, name: "Rome" }}
      activities={[]}
      currencySymbol="$"
      totalBudget={0}
      filteredBudget={0}
      budgetByCategory={{}}
    />,
  );

  expect(
    screen.getByText("No activities yet."),
  ).toBeInTheDocument();

  expect(
    screen.queryByText("Select a trip to see budget."),
  ).not.toBeInTheDocument();
});

test("displays the budget breakdown for multiple categories", () => {
  render(
    <BudgetPanel
      activeTrip={{ id: 1, name: "Rome" }}
      activities={[
        { id: 1, category: "Museum" },
        { id: 2, category: "Restaurant" },
      ]}
      currencySymbol="€"
      totalBudget={125.5}
      filteredBudget={105}
      budgetByCategory={{
        Museum: 25.5,
        Restaurant: 79.5,
      }}
    />,
  );

  expect(screen.getByText("€125.50")).toBeInTheDocument();
  expect(screen.getByText("€105.00")).toBeInTheDocument();

  expect(screen.getByText("Museum")).toBeInTheDocument();
  expect(screen.getByText("€25.50")).toBeInTheDocument();

  expect(screen.getByText("Restaurant")).toBeInTheDocument();
  expect(screen.getByText("€79.50")).toBeInTheDocument();
});

test("does not display category rows when the breakdown is empty", () => {
  render(
    <BudgetPanel
      activeTrip={{ id: 1, name: "Rome" }}
      activities={[{ id: 1, name: "Free walking tour" }]}
      currencySymbol="€"
      totalBudget={0}
      filteredBudget={0}
      budgetByCategory={{}}
    />,
  );

  expect(screen.getAllByText("€0.00")).toHaveLength(2);
  expect(screen.queryByText("Museum")).not.toBeInTheDocument();
  expect(screen.queryByText("Restaurant")).not.toBeInTheDocument();
});