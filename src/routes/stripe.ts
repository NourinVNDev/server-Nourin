import express, { NextFunction, Request, Response } from "express";
import userlogin from "../controllers/userControllers/loginDetails";
import { loginServices } from "../service/userService/loginService";
import { loginRepo } from "../repository/userRepository/loginRepo";
import bodyParser from 'body-parser';

const router = express.Router();
const userRepositoryInstance=new loginRepo();
const userServiceInstance=new loginServices(userRepositoryInstance);
const userController=new userlogin(userServiceInstance);


router.post('/',express.raw({type:'application/json'}), (req:Request,res:Response,next:NextFunction)=>userController.handleWebhook(req,res));

export default router;