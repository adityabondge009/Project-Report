const express = require("express");
const path = require("path");
const router = express.Router();
const { readJSON, writeJSON } = require("../utils/storage");
const slides = require("../data/slides");

router.get("/", (req, res) => {
    const visitsFile = path.join(__dirname, "../data/visits.json");
    const visitData = readJSON(visitsFile);

    const userId = req.userId || "anonymous";

    /* ===== SAFE INIT ===== */
    visitData.userContent ??= {};
    visitData.userContent[userId] ??= { slides: [], courses: [], works: [] };

    visitData.contentViews ??= {};
    visitData.contentViews.slides ??= { total: 0 };

    /* ===== TRACK SLIDE VIEWS (ONCE PER SESSION LOAD) ===== */
    slides.forEach((_, idx) => {
        const key = `slide-${idx}`;
        if (!visitData.userContent[userId].slides.includes(key)) {
            visitData.userContent[userId].slides.push(key);
            visitData.contentViews.slides.total++;
        }
    });

    writeJSON(visitsFile, visitData);

    /* ===== SERVE REAL SLIDES ===== */
    res.json(slides);
});

module.exports = router;

