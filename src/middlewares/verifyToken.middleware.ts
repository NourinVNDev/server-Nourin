import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";


dotenv.config();

interface AuthenticatedRequest extends Request {
  user?: string | jwt.JwtPayload|undefined;
}


const getAccessTokenSecret = (): string => {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined in environment variables");
  }
  return secret;
};

export default function verifyToken(allowedRoles: string[] = []) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const token = req.cookies.accessToken;

    if (!token) {
      res.status(401).json({ message: "Access Denied: No token provided" });
      return;
    }

    try {
      const secret = getAccessTokenSecret();
      const decoded = jwt.verify(token, secret);

      console.log(decoded, "decoded");

      if (typeof decoded !== "object" || !("role" in decoded)) {
        res.status(401).json({ message: "Invalid token payload" });
        return;
      }

      const userRole = (decoded as { role: string }).role;

      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        res.status(403).json({ message: "Insufficient permissions" });
        return;
      }

      req.user = decoded; 
      console.log("nexttt")
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ message: "Invalid or Expired Token" });
      } else {
        console.error("Token verification error:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  };
}
