require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const session = require("express-session");

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

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",

      // השארנו את המספר הזה לצורך Code Review
      maxAge: 1000 * 60 * 60,
    },
  }),
);

/*
 * לוג לכל בקשה שנכנסת לשרת
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
 * בדיקה שהמשתמש מחובר
 */
function requireAuthentication(req, res, next) {
  if (req.session?.authenticated) {
    return next();
  }

  writeLog(`[UNAUTHORIZED] ${req.method} ${req.originalUrl}`);

  return res.status(401).json({
    error: "Authentication required",
  });
}

/*
 * בדיקה שהשרת עובד
 */
app.get("/api/hello-world", (req, res) => {
  res.json({
    message: "Hello World",
  });
});

/*
 * התחברות
 */
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    writeLog("[LOGIN FAILED] Missing username or password");

    return res.status(400).json({
      error: "Username and password are required",
    });
  }

  const isValidUsername = username === process.env.APP_USERNAME;
  const isValidPassword = password === process.env.APP_PASSWORD;

  if (!isValidUsername || !isValidPassword) {
    writeLog(`[LOGIN FAILED] Invalid credentials for username=${username}`);

    return res.status(401).json({
      error: "Invalid username or password",
    });
  }

  req.session.authenticated = true;
  req.session.username = username;

  writeLog(`[LOGIN SUCCESS] username=${username}`);

  return res.json({
    message: "Login successful",
    username,
  });
});

/*
 * בדיקה האם המשתמש כבר מחובר
 */
app.get("/api/auth-status", (req, res) => {
  return res.json({
    authenticated: Boolean(req.session?.authenticated),
    username: req.session?.username ?? null,
  });
});

/*
 * התנתקות
 */
app.post("/api/logout", (req, res) => {
  const username = req.session?.username;

  req.session.destroy((error) => {
    if (error) {
      writeLog(`[LOGOUT ERROR] ${error.message}`);

      return res.status(500).json({
        error: "Failed to log out",
      });
    }

    writeLog(`[LOGOUT SUCCESS] username=${username ?? "unknown"}`);

    res.clearCookie("connect.sid");

    return res.json({
      message: "Logout successful",
    });
  });
});

/*
 * קבלת רשימת המדינות דרך השרת
 * הנתיב מוגן ודורש התחברות
 */
app.get(
  "/api/countries",
  requireAuthentication,
  async (req, res) => {
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
      writeLog(`[ERROR] GET /api/countries: ${error.message}`);

      return res.status(500).json({
        error: "Failed to load countries",
      });
    }
  },
);

/*
 * קבלת רשימת הערים דרך השרת
 * הנתיב מוגן ודורש התחברות
 */
app.post(
  "/api/cities",
  requireAuthentication,
  async (req, res) => {
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
        body: JSON.stringify({
          country,
        }),
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
      writeLog(`[ERROR] POST /api/cities: ${error.message}`);

      return res.status(500).json({
        error: "Failed to load cities",
      });
    }
  },
);


app.use((req, res) => {
  return res.status(404).json({
    error: "Route not found",
  });
});

app.listen(PORT, () => {
  writeLog(`Server started on http://localhost:${PORT}`);
});