const express = require("express");
const path = require("path");
const router = express.Router();
const crypto = require("crypto");
const { readJSON, writeJSON } = require("../utils/storage");

const messagesFile = path.join(__dirname, "../data/messages.json");

/* ===== SUBMIT CONTACT MESSAGE ===== */
router.post("/", (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: "All fields required" });
    }

    const data = readJSON(messagesFile);
    data.messages ??= [];

    data.messages.push({
        id: crypto.randomUUID(),
        userId: req.userId || "anonymous",
        name,
        email,
        message,
        createdAt: new Date().toISOString()
    });

    writeJSON(messagesFile, data);

    res.json({ success: true });
});

module.exports = router;

