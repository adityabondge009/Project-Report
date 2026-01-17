const express = require("express");
const path = require("path");
const router = express.Router();
const { readJSON, writeJSON } = require("../utils/storage");

const coursesFile = path.join(__dirname, "../data/courses.json");

/* ===== GET COURSES (PUBLIC) ===== */
router.get("/", (req, res) => {
    const data = readJSON(coursesFile);

    // HARD NORMALIZATION
    let courses = [];

    if (Array.isArray(data)) {
        courses = data;
    } else if (Array.isArray(data.courses)) {
        courses = data.courses;
    }

    // Heal every course
    courses = courses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description || "",
        videos: Array.isArray(course.videos) ? course.videos : []
    }));

    res.json(courses);
});

/* ===== TRACK COURSE VIEW ===== */
router.post("/view/:id", (req, res) => {
    const visitsFile = path.join(__dirname, "../data/visits.json");
    const visitData = readJSON(visitsFile);

    const userId = req.userId || "anonymous";
    const courseId = req.params.id;

    visitData.contentViews ??= {};
    visitData.contentViews.courses ??= { total: 0, byId: {} };

    visitData.userContent ??= {};
    visitData.userContent[userId] ??= {
        courses: [],
        works: [],
        slides: []
    };

    visitData.contentViews.courses.total++;
    visitData.contentViews.courses.byId[courseId] =
        (visitData.contentViews.courses.byId[courseId] || 0) + 1;

    if (!visitData.userContent[userId].courses.includes(courseId)) {
        visitData.userContent[userId].courses.push(courseId);
    }

    writeJSON(visitsFile, visitData);
    res.json({ success: true });
});

module.exports = router;

