const express = require("express");
const path = require("path");
const router = express.Router();
const { readJSON, writeJSON } = require("../utils/storage");

router.post("/", (req, res) => {
    const { page } = req.body;
    if (!page) return res.sendStatus(400);

    const visitsFile = path.join(__dirname, "../data/visits.json");
    const data = readJSON(visitsFile);

    data.totalVisits = (data.totalVisits || 0) + 1;

    if (!data.perPage) data.perPage = {};
    data.perPage[page] = (data.perPage[page] || 0) + 1;

    writeJSON(visitsFile, data);

    res.json({ tracked: page });
});

module.exports = router;

