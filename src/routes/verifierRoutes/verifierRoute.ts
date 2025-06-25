import { Router } from "express";
import { MultiVerifierController } from "../../controllers/verifierControllers/multiVerifierController";
import container from "../../inversify/container";
import verifyToken from "../../middlewares/verifyToken.middleware";
const verifierRoute=Router();
const verifierController=container.get<MultiVerifierController>(MultiVerifierController)



verifierRoute.get('/checkVerifierHaveAccount/:email',(req,res)=>verifierController.checkVerifierHaveAccount(req,res));
verifierRoute.get('/resendOTP/:email',(req,res)=>verifierController.sendResendOTP(req,res));
verifierRoute.get('/verifyOtp/:enteredOtp/:email',(req,res)=>verifierController.verifyOTP(req,res));
verifierRoute.post('/verifierLogin',(req,res)=>verifierController.postVerifierLogin(req,res));
verifierRoute.post('/refresh-token',(req,res)=>verifierController.reGenerateVerifierAccessToken(req,res));
verifierRoute.get('/fetchEvents/:email',verifyToken(['verifier']),(req,res)=>verifierController.getAllCompanyEvents(req,res));
verifierRoute.get('/fetchBookedDetails/:eventId',verifyToken(['verifier']),(req,res)=>verifierController.getBookedDetails(req,res));
verifierRoute.get('/fetchSingleUser/:bookedId/:userName',verifyToken(['verifier']),(req,res)=>verifierController.getSingleUserData(req,res));
verifierRoute.get('/markUserEntry/:bookedId/:userName',verifyToken(['verifier']),(req,res)=>verifierController.markUserEntry(req,res));

export default verifierRoute;



