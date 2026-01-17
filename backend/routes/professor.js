const express = require("express");
const router = express.Router();
const professor = require("../data/professor");

router.get("/", (req, res) => {
    res.json(professor);
});

module.exports = router;

