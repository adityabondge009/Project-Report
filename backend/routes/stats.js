const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        totalVisitors: global.usersCount(),
        pageViews: global.pageViewsCount()
    });
});

module.exports = router;

