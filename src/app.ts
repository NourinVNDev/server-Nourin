import express from "express";
import cors from "cors";
import morgan from 'morgan';
import verifierRoute from "./routes/verifierRoutes/verifierRoute";
import userRoute from "./routes/userRoutes/userRoute";
import managerRoute from './routes/managerRoutes/managerRoute';
import adminRoute from './routes/adminRoutes/adminRoute';
import session  from 'express-session';
import Database from "./config/database";
import { errorMiddleware } from "./middlewares/errorMiddleware";
import cookieParser from 'cookie-parser';
import path from "path";

const PORT=process.env.PORT||3001
console.log("Socket",PORT);



const app=express();
app.use(cors({
  origin:['http://localhost:5175','http://localhost:5173'],
  credentials:true
}));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, "uploads");
app.use("/Manager/createEvent", express.static(uploadsDir));

Database();


app.use(
  session({
      secret: 'your_secret_key', // Encrypts session data
      resave: false, // Avoids resaving session if not modified
      saveUninitialized: false, // Only save sessions that are initialized
      cookie: {
        maxAge: 3600000, // Set a longer session expiration (1 hour for example)
        httpOnly: true, // Ensures cookies can't be accessed by JavaScript
        secure: process.env.NODE_ENV === 'production', // Ensure cookie is sent only over HTTPS in production
      },
  })
);

//for Socket io
app.use('/api/user' ,userRoute);
app.use('/api/manager/',managerRoute);
app.use('/api/admin/',adminRoute);
app.use('/api/verifier/',verifierRoute);
app.use(errorMiddleware);




  



export default app;