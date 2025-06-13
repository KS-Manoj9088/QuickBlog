import jwt from "jsonwebtoken";
import "dotenv/config";

const auth = (req, res, next) => {
    // ✅ Fix: header name must be lowercase
    const token = req.headers.authorization?.split(" ")[1];  

    if (!token) {
        return res.status(401).json({ success: false, message: "Token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);
        
        // 🛠 Attach user info to request
        req.user = decoded;

        next();
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid Token" });
    }
};

export default auth;
