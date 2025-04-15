import { Router } from "express";
import { VerifierDetailsController } from "../../controllers/verifierControllers/verifierDetailsController";
import { verifierDetailsService } from "../../service/verifierServices/verifierDetailsService";
import { verifierDetailsRepository } from "../../repository/verifierRepository/verifierDetailsRepository";
import { verifyToken } from "../../middlewares/userMiddle";
const verifierRoute=Router();
const verifierRepositoryInstance=new verifierDetailsRepository();
const verifierServiceInstance=new verifierDetailsService(verifierRepositoryInstance)
const verifierControllerInstance=new VerifierDetailsController(verifierServiceInstance);

verifierRoute.get('/checkVerifierHaveAccount/:email',verifierControllerInstance.checkVerifierHaveAccount.bind(verifierControllerInstance));
verifierRoute.get('/resendOTP/:email',verifierControllerInstance.sendResendOTP.bind(verifierControllerInstance));
verifierRoute.get('/verifyOtp/:enteredOtp/:email',verifierControllerInstance.verifyOTP.bind(verifierControllerInstance));
verifierRoute.post('/verifierLogin',verifierControllerInstance.postVerifierLogin.bind(verifierControllerInstance));
verifierRoute.post('/refresh-token',verifierControllerInstance.reGenerateVerifierAccessToken.bind(verifierControllerInstance));
verifierRoute.get('/fetchEvents/:email',verifyToken(['verifier']),verifierControllerInstance.getAllCompanyEvents.bind(verifierControllerInstance));
verifierRoute.get('/fetchBookedDetails/:eventId',verifyToken(['verifier']),verifierControllerInstance.getBookedDetails.bind(verifierControllerInstance));
verifierRoute.get('/markUserEntry/:bookingId/:userName',verifyToken(['verifier']),verifierControllerInstance.markUserEntry.bind(verifierControllerInstance));
export default verifierRoute