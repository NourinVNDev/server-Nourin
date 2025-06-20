const jwt = require("jsonwebtoken");
require('dotenv').config();
interface User {
    email: string;
    role:string
  }


export const generateAccessToken = (user:User) => {
  const payload = {
   
    email: user.email,
    role: user.role,
  };
  console.log("Hello from access function",process.env.ACCESS_TOKEN_SECRET,process.env.ACCESS_TOKEN_EXPIRATION);
  
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
  });
};


export const generateRefreshToken = (user:User) => {
  console.log('User',user.email)
  const payload = {

    email: user.email,
    role: user.role, 
  };
  console.log("Payload",payload);
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
  });
};


