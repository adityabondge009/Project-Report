const express = require("express");
const crypto = require("crypto");
const path = require("path");
const { readJSON, writeJSON } = require("../utils/storage");

const router = express.Router();
const usersFile = path.join(__dirname, "../data/users.json");

router.post("/register", (req, res) => {
    const usersData = readJSON(usersFile);
    usersData.users ??= [];

    const userId = crypto.randomUUID();

    usersData.users.push({
        id: userId,
        createdAt: new Date().toISOString()
    });

    writeJSON(usersFile, usersData);

    res.json({ userId });
});

module.exports = router;

