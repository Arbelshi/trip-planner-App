export default function TripActivitiesPanel({
  activities,
  filteredCount,
  categoryFilter,
  setCategoryFilter,
  reservedFilter,
  setReservedFilter,
  statusFilter,
  setStatusFilter,
  reservationNeedFilter,
  setReservationNeedFilter,
  sortBy,
  setSortBy,
}) {
  function clearFilters() {
    setCategoryFilter("all");
    setReservedFilter("all");
    setStatusFilter("all");
    setReservationNeedFilter("all");
    setSortBy("date");
  }

  return (
    <div className="tripActivitiesPanel">
      <div className="filtersRow">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All categories</option>
          <option value="Museum">Museum</option>
          <option value="Food tour">Food tour</option>
          <option value="Beach">Beach</option>
          <option value="Restaurant">Restaurant</option>
          <option value="Shopping">Shopping</option>
          <option value="Lookout">Lookout</option>
          <option value="Other">Other</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All status</option>
          <option value="planned">planned</option>
          <option value="pending">pending</option>
          <option value="booked">booked</option>
          <option value="done">done</option>
          <option value="cancelled">cancelled</option>
        </select>

        <select
          value={reservationNeedFilter}
          onChange={(e) => setReservationNeedFilter(e.target.value)}
        >
          <option value="all">Reservation need</option>
          <option value="none">No reservation needed</option>
          <option value="required">Reservation required</option>
          <option value="recommended">Reservation recommended</option>
        </select>

        <select
          value={reservedFilter}
          onChange={(e) => setReservedFilter(e.target.value)}
        >
          <option value="all">Reserved status</option>
          <option value="reserved">Reserved</option>
          <option value="not_reserved">Not reserved</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="date">Sort: Date</option>
          <option value="cost">Sort: Cost</option>
          <option value="status">Sort: Status</option>
        </select>

        <button type="button" onClick={clearFilters}>
          Clear filters
        </button>
      </div>

      <div className="muted" style={{ marginBottom: 8 }}>
        {filteredCount} shown out of {activities.length}
      </div>
    </div>
  );
}