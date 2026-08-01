import { useState } from "react";

export default function ActivityItem({ activity, onDelete, currencySymbol }) {
  const [open, setOpen] = useState(false);

  function isOverdue(activity) {
    if (!activity?.date) return false;

    const end = activity.endTime || activity.startTime || "23:59";
    const dueDateTime = new Date(`${activity.date}T${end}`);
    return dueDateTime < new Date();
  }

  return (
    <div
      className={`actCard status-${activity.status || "planned"} ${
        isOverdue(activity) ? "overdue" : ""
      }`}
    >
      <div
        className="actTop"
        onClick={() => setOpen((prev) => !prev)}
        style={{ cursor: "pointer" }}
      >
        <div>
          <div className="actTitle">{activity.description}</div>
          <div className="actMid">
            {activity.city} · {activity.date} · {activity.startTime} -{" "}
            {activity.endTime}
          </div>
          {isOverdue(activity) && <div className="overdueLabel">Overdue</div>}
        </div>

        <div className="actTopRight">
          <span className={`badge badge--${activity.status || "planned"}`}>
            {activity.status}
          </span>

          <span
            className={`badge priority-${(activity.priority || "Optional")
              .toLowerCase()
              .replace(/\s+/g, "-")}`}
          >
            {activity.priority}
          </span>

          <button
            className="deleteBtn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(activity.id);
            }}
            title="Delete"
          >
            ✕
          </button>
        </div>
      </div>

      {open && (
        <div className="activityDetails">
          <div>
            <strong>Place:</strong> {activity.place}
          </div>
          <div>
            <strong>Category:</strong> {activity.category}
          </div>
          <div>
            <strong>Cost:</strong> {currencySymbol}
            {Number(activity.cost) || 0}
          </div>
          <div>
            <strong>Reservation:</strong> {activity.reservationType}
          </div>

          {activity.reservationType !== "none" && (
            <div>
              <strong>Reserved:</strong> {activity.isReserved ? "Yes" : "No"}
            </div>
          )}

          <div>
            <strong>Notes:</strong> {activity.notes || "No notes"}
          </div>
          <div>
            <strong>Priority:</strong> {activity.priority}
          </div>
        </div>
      )}
    </div>
  );
}
