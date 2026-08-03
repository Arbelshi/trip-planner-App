import { useEffect, useState } from "react";
import AddTrip from "./AddTrip";
import TripItem from "./TripItem";
import AddActivity from "./AddActivity";
import ActivityItem from "./ActivityItem";
import TripActivitiesPanel from "./TripActivitiesPanel";
import BudgetPanel from "./BudgetPanel";
import { Toaster, toast } from "react-hot-toast";
import "./App.css";
import {
  flattenActivities,
  getFilteredActivities,
  getBudgetData,
  deleteActivityFromTrip,
  addActivityToTrip,
} from "./tripHelpers";

const LS_KEY = "mytrip_v1";

export default function MyTripApp() {
  const [trips, setTrips] = useState(() => {
    const saved = localStorage.getItem(LS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTripId, setActiveTripId] = useState(null);

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [reservedFilter, setReservedFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reservationNeedFilter, setReservationNeedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(trips));
  }, [trips]);

  const activeTrip = trips.find((t) => t.id === activeTripId) || null;
  const currencySymbol = activeTrip?.currency || "€";

  const activities = flattenActivities(activeTrip);

  const filteredActivities = getFilteredActivities(activities, {
    categoryFilter,
    reservedFilter,
    statusFilter,
    reservationNeedFilter,
    sortBy,
  });

  const { totalBudget, filteredBudget, budgetByCategory } = getBudgetData(
    activities,
    filteredActivities,
  );

  function handleAddTrip(trip) {
    setTrips((prev) => [trip, ...prev]);
    setActiveTripId(trip.id);
    toast.success("Trip created successfully");
  }

  function handleDeleteTrip(tripId) {
    if (!window.confirm("Delete this trip?")) return;

    setTrips((prev) => prev.filter((t) => t.id !== tripId));

    if (activeTripId === tripId) {
      setActiveTripId(null);
    }
  }

  function handleAddActivity(activity) {
    if (!activeTripId) return;

    setTrips((prev) =>
      prev.map((trip) =>
        trip.id === activeTripId ? addActivityToTrip(trip, activity) : trip,
      ),
    );

    toast.success("Activity added to your trip");
  }

  function handleDeleteActivity(activityId) {
    if (!window.confirm("Delete this activity?")) return;
    if (!activeTripId) return;

    setTrips((prev) =>
      prev.map((trip) =>
        trip.id === activeTripId
          ? deleteActivityFromTrip(trip, activityId)
          : trip,
      ),
    );

    toast.success("Activity deleted");
  }

  return (
    <div className="webPage">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: {
            borderRadius: "14px",
            background: "#f8fffe",
            color: "#0f172a",
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
            padding: "12px 16px",
            fontSize: "14px",
            border: "1px solid #dbeafe",
          },
        }}
      />

      <header className="webHeader">
        <div className="pageContainer headerInner">
          <div className="brand">
            <div className="brandTitle">MyTrip Planner</div>
            <div className="brandSub">Plan your trips in one place</div>
          </div>
        </div>
      </header>

      <main className="appShell">
        <section className="card colLeft">
          <div className="cardHeader">
            <h2 className="cardTitle">My Trips</h2>
          </div>

          {trips.length === 0 ? (
            <p className="muted">No trips yet. Create your first one.</p>
          ) : (
            <ul className="tripGrid">
              {trips.map((t) => (
                <li key={t.id} className="tripWithDetails">
                  <TripItem
                    trip={t}
                    onDelete={handleDeleteTrip}
                    onSelect={setActiveTripId}
                    isActive={t.id === activeTripId}
                  />
                </li>
              ))}
            </ul>
          )}

          <BudgetPanel
            activeTrip={activeTrip}
            activities={activities}
            currencySymbol={currencySymbol}
            totalBudget={totalBudget}
            filteredBudget={filteredBudget}
            budgetByCategory={budgetByCategory}
          />
        </section>

        <section className="card colCenter">
          <div className="cardHeader">
            <h2 className="cardTitle">
              Planner{activeTrip ? ` · ${activeTrip.name}` : ""}
            </h2>
            <span className="muted small">
              {activeTrip ? "Activities & filters" : "Select a trip"}
            </span>
          </div>

          {activeTrip && (
            <TripActivitiesPanel
              activities={activities}
              filteredCount={filteredActivities.length}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              reservedFilter={reservedFilter}
              setReservedFilter={setReservedFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              reservationNeedFilter={reservationNeedFilter}
              setReservationNeedFilter={setReservationNeedFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          )}

          {activeTrip ? (
            activities.length === 0 ? (
              <p className="muted">No activities yet.</p>
            ) : filteredActivities.length === 0 ? (
              <p className="muted">No activities match the filters.</p>
            ) : (
              <ul className="activityList">
                {filteredActivities.map((a) => (
                  <li key={a.id}>
                    <ActivityItem
                      activity={a}
                      onDelete={handleDeleteActivity}
                      currencySymbol={currencySymbol}
                    />
                  </li>
                ))}
              </ul>
            )
          ) : (
            <p className="muted">Select a trip to see its planner.</p>
          )}
        </section>

        <aside className="colRight">
          <div className="card">
            <div className="cardHeader">
              <h2 className="cardTitle">Create Trip</h2>
            </div>
            <AddTrip onAddTrip={handleAddTrip} />
          </div>

          <div className="card">
            <div className="cardHeader">
              <h2 className="cardTitle">
                Add Activity{activeTrip ? ` · ${activeTrip.name}` : ""}
              </h2>
            </div>

            {activeTrip ? (
              <AddActivity
                onAddActivity={handleAddActivity}
                tripCountry={activeTrip?.country || ""}
              />
            ) : (
              <p className="muted">Select a trip to add activities.</p>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
