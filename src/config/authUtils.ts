const jwt = require("jsonwebtoken");
require('dotenv').config();
interface User {
    email: string;
    role:string
  }

// Generate Access Token
export const generateAccessToken = (user:User) => {
  const payload = {
   
    email: user.email,
    role: user.role, // Include role in the payload
  };
  console.log("Hello from access function",process.env.ACCESS_TOKEN_SECRET,process.env.ACCESS_TOKEN_EXPIRATION);
  
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
  });
};

// Generate Refresh Token
export const generateRefreshToken = (user:User) => {
  console.log('User',user.email)
  const payload = {

    email: user.email,
    role: user.role, // Include role in the payload
  };
  console.log("Payload",payload);
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
  });
};


