require("dotenv").config();
const jwt = require("jsonwebtoken");

function routeGuard(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).send("Access denied. No token provided.");

    const tokenFromHeader = authHeader && authHeader.split(" ")[1];
    const tokenFromQuery = req.query.token;

    const token = tokenFromHeader || tokenFromQuery;

    if (!token) return res.status(401).send("Access denied. No token provided.");
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).send("Invalid token.");
    }   

}

module.exports = routeGuard;

