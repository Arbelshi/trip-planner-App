export default function BudgetPanel({
  activeTrip,
  activities,
  currencySymbol,
  totalBudget,
  filteredBudget,
  budgetByCategory,
}) {
  return (
    <div className="card">
      <div className="cardHeader">
        <h2 className="cardTitle">Budget</h2>
      </div>

      {activeTrip ? (
        activities.length > 0 ? (
          <>
            <p>
              <strong>Total trip activities:</strong> {currencySymbol}
              {totalBudget.toFixed(2)}
            </p>
            <p>
              <strong>Filtered activities:</strong> {currencySymbol}
              {filteredBudget.toFixed(2)}
            </p>

            <div className="budgetBreakdown">
              {Object.entries(budgetByCategory).map(([cat, value]) => (
                <div key={cat} className="budgetRow">
                  <span>{cat}</span>
                  <span>
                    {currencySymbol}
                    {value.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="muted">No activities yet.</p>
        )
      ) : (
        <p className="muted">Select a trip to see budget.</p>
      )}
    </div>
  );
}