const express = require("express");
const path = require("path");
const router = express.Router();
const { readJSON } = require("../utils/storage");

router.get("/", (req, res) => {
    const visitsFile = path.join(__dirname, "../data/visits.json");
    const usersFile = path.join(__dirname, "../data/users.json");
    const coursesFile = path.join(__dirname, "../data/courses.json");

    const visitData = readJSON(visitsFile);
    const usersData = readJSON(usersFile);
    const coursesData = readJSON(coursesFile);

    const courses = Array.isArray(coursesData)
        ? coursesData
        : coursesData?.courses || [];

    const userId = req.userId || "anonymous";

    const seenCourses =
        visitData.userContent?.[userId]?.courses || [];

    const viewsById =
        visitData.contentViews?.courses?.byId || {};

    /* ================= STEP B: NEW FOR YOU ================= */
    const newForYouCourses = courses.filter(course => {
        const notSeen = !seenCourses.includes(course.id);

        const createdAt = new Date(course.createdAt || Date.now());
        const ageDays =
            (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

        const fresh = ageDays <= 7;
        const lowViews = (viewsById[course.id] || 0) < 3;

        return notSeen || fresh || lowViews;
    });

    /* ================= STEP B: POPULAR COURSES ================= */
    const popularCourses = courses
        .filter(c => (viewsById[c.id] || 0) >= 3)
        .sort(
            (a, b) =>
                (viewsById[b.id] || 0) -
                (viewsById[a.id] || 0)
        );

    /* ================= STEP C: SLIDES INTELLIGENCE ================= */
    const slideViews =
        visitData.contentViews?.slides?.byTitle || {};

    const recentSlides = Object.entries(slideViews)
        .sort(
            (a, b) =>
                new Date(b[1].lastViewed || 0) -
                new Date(a[1].lastViewed || 0)
        )
        .slice(0, 3)
        .map(([title]) => title);

    /* ================= FINAL RESPONSE ================= */
    res.json({
        totalUsers: usersData.users?.length || 0,

        newForYou: [
            ...new Set([
                ...newForYouCourses.slice(0, 3).map(c => c.title),
                ...recentSlides
            ])
        ],

        popularCourses: popularCourses
            .slice(0, 5)
            .map(c => c.title)
    });
});

module.exports = router;

