import { verifyToken } from "../utils/jwt.js";

export const protect = (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return res.status(401).json({ message: "No token" });

    try {
        const decoded = verifyToken(token); // { id, role }
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

// optional: role based access
export const authorize = (...roles) => (req, res, next) => {
    if (!req.user?.role) return res.status(401).json({ message: "Role missing" });
    if (!roles.includes(req.user.role))
        return res.status(403).json({ message: "Forbidden" });
    next();
};

// also allow default export if other routes import default
export default protect;
