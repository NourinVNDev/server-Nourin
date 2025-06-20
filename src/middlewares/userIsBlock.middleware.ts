import { Request, Response, NextFunction } from "express";
import USERDB from "../models/userModels/userSchema";
import jwt from "jsonwebtoken";

// Function to check if a user is blocked
async function isUserBlocked(email: string): Promise<boolean> {
  const user = await USERDB.findOne({ email });
  return user?.isBlock === true;

}

export const checkIfUserBlocked = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("Maaaad");
  
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];
    console.log("testing the token",token);
    
    if (!token) {
      res.status(401).json({ message: "Access Denied: No token provided" });
      return;
    }



    // Verify and decode the token

    console.log("I am from userBlock middleware");
    
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
    const blocked = await isUserBlocked(email);

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
