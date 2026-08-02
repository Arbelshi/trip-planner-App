const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

const logsDirectory = path.join(__dirname, "..", "logs");
const logFilePath = path.join(logsDirectory, "app.log");

fs.mkdirSync(logsDirectory, { recursive: true });

function writeLog(message) {
  const logLine = `[${new Date().toISOString()}] ${message}`;

  console.log(logLine);

  fs.appendFileSync(logFilePath, `${logLine}\n`, {
    encoding: "utf8",
  });
}

app.use(express.json());

/*
 * הלוג הזה יופעל עבור כל בקשה שמגיעה לשרת.
 */
app.use((req, res, next) => {
  const startedAt = Date.now();

  writeLog(`[INCOMING] ${req.method} ${req.originalUrl}`);

  res.on("finish", () => {
    const duration = Date.now() - startedAt;

    writeLog(
      `[RESPONSE] ${req.method} ${req.originalUrl} ` +
        `${res.statusCode} ${duration}ms`,
    );
  });

  next();
});

/*
 * נתיב פשוט כדי לבדוק שהשרת עובד.
 */
app.get("/api/hello-world", (req, res) => {
  res.json({
    message: "Hello World",
  });
});

/*
 * קבלת רשימת המדינות דרך השרת.
 */
app.get("/api/countries", async (req, res) => {
  const externalUrl =
    "https://countriesnow.space/api/v0.1/countries/positions";

  try {
    writeLog(`[OUTGOING] GET ${externalUrl}`);

    const response = await fetch(externalUrl);

    writeLog(
      `[EXTERNAL RESPONSE] GET ${externalUrl} ${response.status}`,
    );

    if (!response.ok) {
      return res.status(502).json({
        error: "Failed to load countries from external API",
      });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    writeLog(
      `[ERROR] GET /api/countries: ${error.message}`,
    );

    return res.status(500).json({
      error: "Failed to load countries",
    });
  }
});

/*
 * קבלת רשימת ערים במדינה דרך השרת.
 */
app.post("/api/cities", async (req, res) => {
  const { country } = req.body;

  if (!country || typeof country !== "string") {
    writeLog("[VALIDATION ERROR] Country is required");

    return res.status(400).json({
      error: "Country is required",
    });
  }

  const externalUrl =
    "https://countriesnow.space/api/v0.1/countries/cities";

  try {
    writeLog(
      `[OUTGOING] POST ${externalUrl} country=${country}`,
    );

    const response = await fetch(externalUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ country }),
    });

    writeLog(
      `[EXTERNAL RESPONSE] POST ${externalUrl} ${response.status}`,
    );

    if (!response.ok) {
      return res.status(502).json({
        error: "Failed to load cities from external API",
      });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    writeLog(
      `[ERROR] POST /api/cities: ${error.message}`,
    );

    return res.status(500).json({
      error: "Failed to load cities",
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

app.listen(PORT, () => {
  writeLog(`Server started on http://localhost:${PORT}`);
});