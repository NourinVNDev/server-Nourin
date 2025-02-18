import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";

dotenv.config();

interface AuthenticatedRequest extends Request {
  user?: string | jwt.JwtPayload;
}

// Helper function to validate the environment variable
const getAccessTokenSecret = (): string => {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined in environment variables");
  }
  return secret;
};

// Middleware to verify token and roles
export const verifyToken = (allowedRoles: string[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("hai");
      
      res.status(401).json({ message: "Access Denied: No Header provided" });
      return; // Ensure function execution stops here
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("hello");
      
      res.status(401).json({ message: "Access Denied: No token provided" });
      return; // Ensure function execution stops here
    }

    try {
      const secret = getAccessTokenSecret();
      const decoded = jwt.verify(token, secret);
      console.log(decoded,"decoded")
      // Validate token payload
      if (typeof decoded !== "object" || !("role" in decoded)) {
        console.log('mahn');
        
        res.status(401).json({ message: "Invalid token payload" });
        return;
      }

      // Check user role
      const userRole = (decoded as { role: string }).role;
      if (!allowedRoles.includes(userRole)) {
        console.log('task');
        
        res.status(401).json({ message: "Insufficient permissions" });
        return;
      }

      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        console.log('issue');
        
        res.status(401).json({ message: "Invalid or Expired Token" });
      } else {
        console.error("Token verification error:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
      return;
    }
  };
};
