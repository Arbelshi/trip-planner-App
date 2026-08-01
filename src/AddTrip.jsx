import { useEffect, useState } from "react";

export default function AddTrip({ onAddTrip }) {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState("€");

  function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) return setError("Please enter trip name");
    if (!country.trim()) return setError("Please choose country");
    if (!startDate || !endDate) return setError("Please choose dates");
    if (startDate > endDate)
      return setError("Start date must be before end date");
    if (budget === "" || Number(budget) < 0)
      return setError("Budget must be 0 or more");

    setError("");

    const trip = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name: name.trim(),
      country: country.trim(),
      startDate,
      endDate,
      budget: Number(budget),
      currency,
      selectedCities: [],
      activitiesByCity: {},
    };

    onAddTrip?.(trip);

    setName("");
    setCountry("");
    setStartDate("");
    setEndDate("");
    setBudget("");
    setCurrency("€");
  }

  useEffect(() => {
    let cancelled = false;

    async function loadCountries() {
      try {
        setLoadingCountries(true);
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/positions",
        );
        const json = await res.json();
        if (cancelled) return;

        const list = (json?.data || [])
          .map((x) => x?.name)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));

        setCountries(list);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Failed to load countries");
      } finally {
        if (!cancelled) setLoadingCountries(false);
      }
    }

    loadCountries();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <form className="formGrid" onSubmit={handleSubmit}>
      <input
        id="tripNameInput"
        className="field"
        type="text"
        placeholder="Trip name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />

      <select
        className="field"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        disabled={loadingCountries}
      >
        <option value="" disabled>
          {loadingCountries ? "Loading countries..." : "Select country"}
        </option>
        {countries.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <input
        className="field dateField"
        dir="ltr"
        lang="en-GB"
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />

      <input
        className="field dateField"
        dir="ltr"
        lang="en-GB"
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

      <select
        className="field"
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
      >
        <option value="€">Euro (€)</option>
        <option value="$">Dollar ($)</option>
        <option value="₪">Shekel (₪)</option>
        <option value="£">Pound (£)</option>
      </select>

      <input
        className="field"
        type="number"
        placeholder="Budget"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
        min="0"
      />

      {error && <div className="error">{error}</div>}

      <button className="primaryBtn" type="submit">
        Create Trip
      </button>
    </form>
  );
}
