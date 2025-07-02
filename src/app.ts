import express from "express";
import cors from "cors";
import morgan from 'morgan';
import verifierRoute from './routes/verifierRoutes/verifierRoute'
import userRoute from "./routes/userRoutes/userRoute";
import managerRoute from './routes/managerRoutes/managerRoute';
import adminRoute from './routes/adminRoutes/adminRoute';
import session  from 'express-session';
import Database from "./config/db.config";
import { errorMiddleware } from "./middlewares/errorMiddleware";
import cookieParser from 'cookie-parser';
import path from "path";
import stripeRoute from "./routes/stripe";

const PORT=process.env.PORT||3001
console.log("Socket",PORT);



const app=express();

app.use(cors({
  origin:['https://client-nourin-9ey7.vercel.app','http://localhost:5173'],
  credentials:true
}));

app.use('/webhook',stripeRoute);
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, "uploads");
app.use("/Manager/createEvent", express.static(uploadsDir));

Database();


app.use(
  session({
      secret: 'your_secret_key', 
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000,
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
      },
  })
);

//for Socket io
app.use('/api/user' ,userRoute);
app.use('/api/manager',managerRoute);
app.use('/api/admin',adminRoute);
app.use('/api/verifier',verifierRoute);
app.use(errorMiddleware);




  



export default app;