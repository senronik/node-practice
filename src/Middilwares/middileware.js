import { StatusCodes } from "http-status-codes";
import  jwt  from "jsonwebtoken";
export function verifyUserToken(req, res, next) {
    const token = req.headers.authorization;
    const SECRET_KEY = process.env.SECRET_KEY;
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'No token provided' });
    }

    if (req.headers.role === 'user') {
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Failed to authenticate token' });
            }
            req.userId = decoded.userId;
            next();
        });
    }
    else {
        return res.status(StatusCodes.UNAUTHORIZED).json("User not found");
    }

}
export function verifyAdminToken(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'No token provided' });
    }
    if (req.headers.role === 'admin') {
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Failed to authenticate token' });
            }
            req.userId = decoded.userId;
            next();
        });
    }
    else {
        return res.status(StatusCodes.UNAUTHORIZED).json("Admin not found");
    }

}