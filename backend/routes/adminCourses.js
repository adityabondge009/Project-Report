const express = require("express");
const path = require("path");
const router = express.Router();
const { readJSON, writeJSON } = require("../utils/storage");
const requireAdmin = require("../middleware/requireAdmin");

const coursesFile = path.join(__dirname, "../data/courses.json");

/* ===== GET ALL COURSES (ADMIN) ===== */
router.get("/", requireAdmin, (req, res) => {
    const data = readJSON(coursesFile);
    res.json(data.courses || []);
});

/* ===== ADD NEW COURSE ===== */
router.post("/", requireAdmin, (req, res) => {
const { title, description } = req.body;

    if (!title || !category) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const data = readJSON(coursesFile);

    if (!Array.isArray(data.courses)) {
        data.courses = [];
    }

    // ✅ SAFE ID GENERATION
    const nextId =
        data.courses.length === 0
            ? 1
            : Math.max(...data.courses.map(c => c.id)) + 1;

const newCourse = {
    id: nextId,
    title,
    description: description || "",
    videos: [],
    createdAt: new Date().toISOString()
};

    data.courses.push(newCourse);
    writeJSON(coursesFile, data);

    res.status(201).json(newCourse);
});

module.exports = router;

