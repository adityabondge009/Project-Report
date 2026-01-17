const express = require("express");
const path = require("path");
const router = express.Router();
const { readJSON } = require("../utils/storage");

router.get("/stats", (req, res) => {
    const usersFile = path.join(__dirname, "../data/users.json");
    const visitsFile = path.join(__dirname, "../data/visits.json");

    const usersData = readJSON(usersFile);
    const visitData = readJSON(visitsFile);

    // 🔐 Defensive defaults
    const totalUsers = usersData.users ? usersData.users.length : 0;

    res.json({
        totalUsers,
        totalVisits: visitData.totalVisits || 0,
        perDay: visitData.perDay || {},
        contentViews: visitData.contentViews || {}
    });
});

module.exports = router;

