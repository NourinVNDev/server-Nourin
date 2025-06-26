import { Request, Response, NextFunction } from "express";
import MANAGERDB from "../models/managerModels/managerSchema";
import jwt from "jsonwebtoken";


async function isManagerBlocked(email: string): Promise<boolean> {
  const user = await MANAGERDB.findOne({ email });
  return user?.isBlock === true;

}

export const checkIfManagerBlocked = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("isBlockManager");
  
  try {
    // Extract the token from the Authorization header
    const token = req.cookies.accessToken;
    console.log("testing the token", token);
    
    if (!token) {
      res.status(401).json({ message: "Access Denied: No token provided" });
      return;
    }



    // Verify and decode the token

    console.log("I am from managerBlock middleware");
    
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as { email: string };

    const email = decoded.email; // Extract the email from the token payload

    if (!email) {
      res.status(401).json({ message: "Access Denied: No email found in token" });
      return;
    }

    // Check if the user is blocked
    const blocked = await isManagerBlocked(email);

    if (blocked) {
      res.status(403).json({ message: "Access Denied: User is blocked" });
      return;
    }

 

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error verifying token or checking block status:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token" });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};
