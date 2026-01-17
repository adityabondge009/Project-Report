const fs = require("fs");

function readJSON(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            return {};
        }

        const raw = fs.readFileSync(filePath, "utf-8").trim();

        if (!raw) {
            return {};
        }

        return JSON.parse(raw);
    } catch (err) {
        console.error("readJSON error:", err);

        // 🔥 Auto-heal corrupted file
        try {
            fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
        } catch (_) {}

        return {};
    }
}

function writeJSON(filePath, data) {
    try {
        fs.writeFileSync(
            filePath,
            JSON.stringify(data, null, 2),
            "utf-8"
        );
    } catch (err) {
        console.error("writeJSON error:", err);
    }
}

module.exports = { readJSON, writeJSON };

