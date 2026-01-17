const path = require("path");
const { readJSON } = require("../utils/storage");

const usersFile = path.join(__dirname, "../data/users.json");

module.exports = function attachUser(req, res, next) {
    const userId = req.headers["x-user-id"];

    // ❗ Do NOT create users here
    if (!userId) {
        req.userId = null;
        return next();
    }

    const usersData = readJSON(usersFile);
    usersData.users ??= [];

    const exists = usersData.users.some(u => u.id === userId);

    // Unknown ID → ignore (do NOT create)
    req.userId = exists ? userId : null;
    next();
};

