import { useEffect, useState } from "react";

export default function AddActivity({ onAddActivity, tripCountry }) {
  const [city, setCity] = useState("");
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [place, setPlace] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("planned");
  const [error, setError] = useState("");
  const [reservationType, setReservationType] = useState("none");
  const [isReserved, setIsReserved] = useState(false);
  const [priority, setPriority] = useState("Optional");

    useEffect(() => {
    let cancelled = false;

    async function loadCities() {
      setError("");

      if (!tripCountry) {
        setCities([]);
        setCity("");
        setLoadingCities(false);
        return;
      }

      try {
        setLoadingCities(true);
        setCity("");

        const response = await fetch("/api/cities", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            country: tripCountry,
          }),
        });

        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error || "Failed to load cities");
        }

        if (cancelled) {
          return;
        }

        const list = (json?.data || [])
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));

        setCities(list);
      } catch (error) {
        console.error("Failed to load cities:", error);

        if (!cancelled) {
          setError(error.message || "Failed to load cities");
        }
      } finally {
        if (!cancelled) {
          setLoadingCities(false);
        }
      }
    }

    loadCities();

    return () => {
      cancelled = true;
    };
  }, [tripCountry]);


  function handleSubmit(event) {
    event.preventDefault();

    if (!city) return setError("Please choose city");
    if (!date) return setError("Please choose date");
    if (!startTime || !endTime) return setError("Please choose times");
    if (startTime >= endTime)
      return setError("Start time must be before end time");
    if (!description.trim()) return setError("Please enter description");
    if (!place.trim()) return setError("Please enter place");
    if (cost === "" || Number(cost) < 0)
      return setError("Cost must be 0 or more");

    setError("");

    const activity = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      city: city.trim(),
      date,
      startTime,
      endTime,
      description: description.trim(),
      category,
      place: place.trim(),
      cost: Number(cost),
      notes: notes.trim(),
      status,
      reservationType,
      isReserved,
      priority,
    };

    onAddActivity?.(activity);
    
    setCity("");
    setStartTime("");
    setEndTime("");
    setDate("");
    setDescription("");
    setPlace("");
    setCost("");
    setNotes("");
    setStatus("planned");
    setReservationType("none");
    setIsReserved(false);
    setPriority("Optional");
  }

  return (
    <form className="formGrid" onSubmit={handleSubmit}>
      <select
        className="field"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        disabled={!tripCountry || loadingCities}
      >
        <option value="" disabled>
          {!tripCountry
            ? "Select a trip first"
            : loadingCities
              ? "Loading cities..."
              : "Select city"}
        </option>

        {cities.map((ct) => (
          <option key={ct} value={ct}>
            {ct}
          </option>
        ))}
      </select>

      <input
        className="field dateField"
        dir="ltr"
        type="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
      />

      <div className="twoCols">
        <input
          className="field"
          type="time"
          value={startTime}
          onChange={(event) => setStartTime(event.target.value)}
        />
        <input
          className="field"
          type="time"
          value={endTime}
          onChange={(event) => setEndTime(event.target.value)}
        />
      </div>

      <input
        className="field"
        type="text"
        placeholder="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />

      <select
        className="field"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="Museum">Museum</option>
        <option value="Food tour">Food tour</option>
        <option value="Beach">Beach</option>
        <option value="Restaurant">Restaurant</option>
        <option value="Shopping">Shopping</option>
        <option value="Lookout">Lookout</option>
        <option value="Other">Other</option>
      </select>

      <input
        className="field"
        type="text"
        placeholder="Place"
        value={place}
        onChange={(event) => setPlace(event.target.value)}
      />

      <input
        className="field"
        type="number"
        min="0"
        placeholder="Cost (€)"
        value={cost}
        onChange={(event) => setCost(event.target.value)}
      />

      <textarea
        className="field"
        rows="3"
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <select
        className="field"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="planned">planned</option>
        <option value="pending">pending approval</option>
        <option value="booked">booked</option>
        <option value="cancelled">cancelled</option>
        <option value="done">done</option>
      </select>

      <select
        className="field"
        value={reservationType}
        onChange={(e) => {
          const v = e.target.value;
          setReservationType(v);
          if (v === "none") setIsReserved(false);
        }}
      >
        <option value="none">No reservation needed</option>
        <option value="required">Reservation required</option>
        <option value="recommended">Reservation recommended</option>
      </select>

      {reservationType !== "none" ? (
        <label>
          <input
            type="checkbox"
            checked={isReserved}
            onChange={(e) => setIsReserved(e.target.checked)}
          />
          <span>
            Reserved{" "}
            {isReserved && (
              <span style={{ color: "green", marginLeft: 6 }}>✓</span>
            )}
          </span>
        </label>
      ) : null}

      <select
        className="field"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        <option value="Optional">Optional</option>
        <option value="Nice to have">Nice to have</option>
        <option value="Must do">Must do</option>
      </select>

      {error && <div className="error">{error}</div>}

      <button className="primaryBtnFull" type="submit">
        Add activity
      </button>
    </form>
  );
}
