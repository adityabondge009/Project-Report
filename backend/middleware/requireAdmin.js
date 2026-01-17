module.exports = function requireAdmin(req, res, next) {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const token = auth.split(" ")[1];

    // SIMPLE ADMIN TOKEN CHECK (for now)
    // This matches how you already use adminToken in frontend
    if (token !== "admin-secret") {
        return res.status(403).json({ error: "Forbidden" });
    }

    next();
};

