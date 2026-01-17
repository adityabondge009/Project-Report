const express = require("express");
const path = require("path");
const router = express.Router();
const { readJSON, writeJSON } = require("../utils/storage");

router.get("/", (req, res) => {
    const visitsFile = path.join(__dirname, "../data/visits.json");
    const visitData = readJSON(visitsFile);

    const userId = req.userId || "anonymous";

    /* ===== DEFENSIVE INITIALIZATION ===== */
    visitData.contentViews ??= {};
    visitData.contentViews.works ??= { total: 0 };

    visitData.userContent ??= {};
    visitData.userContent[userId] ??= {
        works: [],
        courses: [],
        slides: []
    };

    /* ===== GLOBAL VIEW COUNT ===== */
    visitData.contentViews.works.total++;

    /* ===== PER-USER TRACKING ===== */
    const workSection = "Professional Experience"; // example identifier

    if (!visitData.userContent[userId].works.includes(workSection)) {
        visitData.userContent[userId].works.push(workSection);
    }

    writeJSON(visitsFile, visitData);

    res.json({
        section: workSection,
        message: "Works content served"
    });
});

module.exports = router;

