// backend/server.js
const express = require("express");
const path = require("path");
const { readJSON, writeJSON } = require("./utils/storage");
const adminCourses = require("./routes/adminCourses");
const app = express();
const PORT = 8080;

app.use(express.json());
const attachUser = require("./middleware/attachUser");
app.use(attachUser);
const trackPageRoutes = require("./routes/trackPage");

/* ===== USER IDENTIFICATION MIDDLEWARE ===== */
// Middleware to attach userId
function attachUserId(req, res, next) {
    let uid = req.headers['x-user-id'] || null;
    if (!uid) {
        uid = null;  // or generate new UID if you want
        // console.log("No UID sent, treating as anonymous");
    }
    req.userId = uid;
    next();
}

module.exports = attachUserId;

/* ===== ANALYTICS MIDDLEWARE ===== */
app.use((req, res, next) => {
    try {
        const pathname = req.path;

        const { readJSON, writeJSON } = require("./utils/storage");
        const usersFile = path.join(__dirname, "data/users.json");
        const visitsFile = path.join(__dirname, "data/visits.json");

        const visitData = readJSON(visitsFile);

        // 🔐 Defensive initialization
        if (typeof visitData.totalVisits !== "number") {
            visitData.totalVisits = 0;
        }

        if (!visitData.perPage) {
            visitData.perPage = {};
        }

        if (!visitData.perDay) {
            visitData.perDay = {};
        }

        if (!visitData.contentViews) {
            visitData.contentViews = {};
        }

        // ---- TOTAL VISITS ----
        visitData.totalVisits++;

        // ---- PER PAGE ----
        visitData.perPage[pathname] =
            (visitData.perPage[pathname] || 0) + 1;

        // ---- PER DAY ----
        const today = new Date().toISOString().split("T")[0];
        visitData.perDay[today] =
            (visitData.perDay[today] || 0) + 1;

        writeJSON(visitsFile, visitData);

        next();
    } catch (err) {
        console.error("Analytics middleware error:", err);
        next(); // 🔥 NEVER block the request
    }
});

/* ===== SERVE FRONTEND FILES ===== */
app.use(express.static(path.join(__dirname, "..")));

/* ===== API ROUTES ===== */
app.use("/api/slides", require("./routes/slides"));
app.use("/api/works", require("./routes/works"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/professor", require("./routes/professor"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/home", require("./routes/home"));
app.use("/api/admin/courses", adminCourses);
app.use("/api/track-page", trackPageRoutes);
app.use("/api/user", require("./routes/user"));
app.use("/api/contact", require("./routes/contact"));


/* ===== START SERVER ===== */
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

