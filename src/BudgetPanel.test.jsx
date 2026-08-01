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
    />
  );

  expect(screen.getByText("Budget")).toBeInTheDocument();
  expect(screen.getByText("$100.00")).toBeInTheDocument();
  expect(screen.getByText("Food")).toBeInTheDocument();
  expect(screen.getByText("$50.00")).toBeInTheDocument();
});