import "./TripItem.css";

export default function TripItem({ trip, onDelete, onSelect, isActive }) {
  function isTripOverdue(trip) {
    if (!trip?.endDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tripEnd = new Date(trip.endDate);
    tripEnd.setHours(0, 0, 0, 0);

    return tripEnd < today;
  }
  return (
    <div
      className={`tripCardWeb ${isActive ? "activeTrip" : ""} ${
        isTripOverdue(trip) ? "trip-overdue" : ""
      }`}
      onClick={() => onSelect(trip.id)}
      style={{ cursor: "pointer" }}
    >
      <div className="tripTop">
        <strong className="tripName">{trip.name}</strong>

        <div className="tripActions">
          <span className="tripBudget">
            {trip.currency || "€"}
            {trip.budget}
          </span>{" "}
          <button
            className="deleteBtn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(trip.id);
            }}
            title="Delete"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="tripMeta">
        {trip.country} ·{" "}
        <span dir="ltr">
          {trip.startDate} → {trip.endDate}
        </span>
      </div>

      {isTripOverdue(trip) && (
        <div className="tripOverdueLabel">Trip ended</div>
      )}
    </div>
  );
}
