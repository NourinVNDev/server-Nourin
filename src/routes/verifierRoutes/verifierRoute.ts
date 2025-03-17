import { Router } from "express";
import { VerifierDetailsController } from "../../controllers/verifierControllers/verifierDetailsController";
import { verifierDetailsService } from "../../service/verifierServices/verifierDetailsService";
import { verifierDetailsRepository } from "../../repository/verifierRepository/verifierDetailsRepository";
const verifierRoute=Router();
const verifierRepositoryInstance=new verifierDetailsRepository();
const verifierServiceInstance=new verifierDetailsService(verifierRepositoryInstance)
const verifierControllerInstance=new VerifierDetailsController(verifierServiceInstance);

verifierRoute.get('/checkManagerHaveEvent/:email',verifierControllerInstance.checkManagerHaveEvent.bind(verifierControllerInstance));
verifierRoute.get('/resendOTP/:email',verifierControllerInstance.sendResendOTP.bind(verifierControllerInstance));
verifierRoute.get('/verifyOtp/:enteredOtp',verifierControllerInstance.verifyOTP.bind(verifierControllerInstance));
verifierRoute.post('/verifierLogin',verifierControllerInstance.postVerifierLogin.bind(verifierControllerInstance));
verifierRoute.get('/fetchEvents/:companyName',verifierControllerInstance.getAllCompanyEvents.bind(verifierControllerInstance));
verifierRoute.get('/fetchBookedDetails/:eventId',verifierControllerInstance.getBookedDetails.bind(verifierControllerInstance));
verifierRoute.get('/markUserEntry/:bookingId',verifierControllerInstance.markUserEntry.bind(verifierControllerInstance));
export default verifierRoute