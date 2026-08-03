import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

import Login from "./Login";
import AddTrip from "./AddTrip";
import TripItem from "./TripItem";
import AddActivity from "./AddActivity";
import ActivityItem from "./ActivityItem";
import TripActivitiesPanel from "./TripActivitiesPanel";
import BudgetPanel from "./BudgetPanel";

import {
  flattenActivities,
  getFilteredActivities,
  getBudgetData,
  deleteActivityFromTrip,
  addActivityToTrip,
} from "./tripHelpers";

import "./App.css";

const LS_KEY = "mytrip_v1";

export default function MyTripApp() {
  /*
   * הטיולים נשמרים ב-localStorage.
   * כאשר האפליקציה נטענת, אנחנו מנסים לקרוא אותם משם.
   */
  const [trips, setTrips] = useState(() => {
    const savedTrips = localStorage.getItem(LS_KEY);

    if (!savedTrips) {
      return [];
    }

    try {
      return JSON.parse(savedTrips);
    } catch (error) {
      console.error("Failed to read trips from localStorage:", error);
      return [];
    }
  });

  const [activeTripId, setActiveTripId] = useState(null);

  /*
   * פילטרים ומיון
   */
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [reservedFilter, setReservedFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reservationNeedFilter, setReservationNeedFilter] =
    useState("all");
  const [sortBy, setSortBy] = useState("date");

  /*
   * מצב ההתחברות
   */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [username, setUsername] = useState("");

  /*
   * כאשר האפליקציה עולה, בודקים מול השרת
   * אם כבר קיים session פעיל.
   */
  useEffect(() => {
    async function checkAuthentication() {
      try {
        const response = await fetch("/api/auth-status", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to check authentication status");
        }

        const data = await response.json();

        setIsAuthenticated(data.authenticated);
        setUsername(data.username || "");
      } catch (error) {
        console.error("Failed to check authentication:", error);

        setIsAuthenticated(false);
        setUsername("");
      } finally {
        setIsCheckingAuth(false);
      }
    }

    checkAuthentication();
  }, []);

  /*
   * בכל שינוי במערך הטיולים, שומרים אותו מחדש ב-localStorage.
   */
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(trips));
    } catch (error) {
      console.error("Failed to save trips to localStorage:", error);
    }
  }, [trips]);

  /*
   * מציאת הטיול שנבחר כרגע.
   */
  const activeTrip =
    trips.find((trip) => trip.id === activeTripId) || null;

  const currencySymbol = activeTrip?.currency || "€";

  /*
   * קבלת כל הפעילויות של הטיול הפעיל.
   */
  const activities = flattenActivities(activeTrip);

  /*
   * סינון ומיון הפעילויות.
   */
  const filteredActivities = getFilteredActivities(activities, {
    categoryFilter,
    reservedFilter,
    statusFilter,
    reservationNeedFilter,
    sortBy,
  });

  /*
   * חישובי תקציב.
   */
  const {
    totalBudget,
    filteredBudget,
    budgetByCategory,
  } = getBudgetData(activities, filteredActivities);

  /*
   * הוספת טיול חדש.
   */
  function handleAddTrip(trip) {
    setTrips((previousTrips) => [trip, ...previousTrips]);
    setActiveTripId(trip.id);

    toast.success("Trip created successfully");
  }

  /*
   * מחיקת טיול.
   */
  function handleDeleteTrip(tripId) {
    const shouldDelete = window.confirm("Delete this trip?");

    if (!shouldDelete) {
      return;
    }

    setTrips((previousTrips) =>
      previousTrips.filter((trip) => trip.id !== tripId),
    );

    if (activeTripId === tripId) {
      setActiveTripId(null);
    }

    toast.success("Trip deleted");
  }

  /*
   * הוספת פעילות לטיול הפעיל.
   */
  function handleAddActivity(activity) {
    if (!activeTripId) {
      return;
    }

    setTrips((previousTrips) =>
      previousTrips.map((trip) =>
        trip.id === activeTripId
          ? addActivityToTrip(trip, activity)
          : trip,
      ),
    );

    toast.success("Activity added to your trip");
  }

  /*
   * מחיקת פעילות מהטיול הפעיל.
   */
  function handleDeleteActivity(activityId) {
    const shouldDelete = window.confirm("Delete this activity?");

    if (!shouldDelete || !activeTripId) {
      return;
    }

    setTrips((previousTrips) =>
      previousTrips.map((trip) =>
        trip.id === activeTripId
          ? deleteActivityFromTrip(trip, activityId)
          : trip,
      ),
    );

    toast.success("Activity deleted");
  }

  /*
   * התנתקות מהמערכת.
   */
  async function handleLogout() {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setIsAuthenticated(false);
      setUsername("");
      setActiveTripId(null);
    } catch (error) {
      console.error("Failed to log out:", error);
      toast.error("Failed to log out");
    }
  }

  /*
   * בזמן שהאפליקציה בודקת האם קיים session.
   */
  if (isCheckingAuth) {
    return (
      <main className="loginPage">
        <p>Loading...</p>
      </main>
    );
  }

  /*
   * כאשר אין session פעיל, מציגים את מסך ההתחברות.
   */
  if (!isAuthenticated) {
    return (
      <>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 2500,
          }}
        />

        <Login
          onLogin={(loggedInUsername) => {
            setUsername(loggedInUsername);
            setIsAuthenticated(true);
          }}
        />
      </>
    );
  }

  /*
   * האפליקציה הראשית מוצגת רק למשתמש מחובר.
   */
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
            <div className="brandSub">
              Plan your trips in one place
            </div>
          </div>

          <div className="userArea">
            <span className="userGreeting">
              Welcome, {username}
            </span>

            <button
              type="button"
              className="logoutButton"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="appShell">
        <section className="card colLeft">
          <div className="cardHeader">
            <h2 className="cardTitle">My Trips</h2>
          </div>

          {trips.length === 0 ? (
            <p className="muted">
              No trips yet. Create your first one.
            </p>
          ) : (
            <ul className="tripGrid">
              {trips.map((trip) => (
                <li
                  key={trip.id}
                  className="tripWithDetails"
                >
                  <TripItem
                    trip={trip}
                    onDelete={handleDeleteTrip}
                    onSelect={setActiveTripId}
                    isActive={trip.id === activeTripId}
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
              Planner
              {activeTrip ? ` · ${activeTrip.name}` : ""}
            </h2>

            <span className="muted small">
              {activeTrip
                ? "Activities & filters"
                : "Select a trip"}
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
              setReservationNeedFilter={
                setReservationNeedFilter
              }
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          )}

          {activeTrip ? (
            activities.length === 0 ? (
              <p className="muted">
                No activities yet.
              </p>
            ) : filteredActivities.length === 0 ? (
              <p className="muted">
                No activities match the filters.
              </p>
            ) : (
              <ul className="activityList">
                {filteredActivities.map((activity) => (
                  <li key={activity.id}>
                    <ActivityItem
                      activity={activity}
                      onDelete={handleDeleteActivity}
                      currencySymbol={currencySymbol}
                    />
                  </li>
                ))}
              </ul>
            )
          ) : (
            <p className="muted">
              Select a trip to see its planner.
            </p>
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
                Add Activity
                {activeTrip ? ` · ${activeTrip.name}` : ""}
              </h2>
            </div>

            {activeTrip ? (
              <AddActivity
                onAddActivity={handleAddActivity}
                tripCountry={activeTrip.country || ""}
              />
            ) : (
              <p className="muted">
                Select a trip to add activities.
              </p>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}