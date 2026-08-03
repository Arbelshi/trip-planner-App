import { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      onLogin(data.username);
    } catch (loginError) {
      setError(loginError.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="loginPage">
      <section className="loginCard">
        <h1 className="loginTitle">Trip Planner Login</h1>

        <p className="loginSubtitle">
          Sign in to continue planning your trips
        </p>

        <form className="loginForm" onSubmit={handleSubmit}>
          <label className="loginLabel" htmlFor="username">
            Username
          </label>

          <input
            id="username"
            className="loginInput"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />

          <label className="loginLabel" htmlFor="password">
            Password
          </label>

          <input
            id="password"
            className="loginInput"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          {error && (
            <p className="loginError" role="alert">
              {error}
            </p>
          )}

          <button
            className="loginButton"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}