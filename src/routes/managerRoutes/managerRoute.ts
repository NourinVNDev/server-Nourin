import { Router } from "express";
import { checkIfManagerBlocked } from "../../middlewares/managerIsBlock.middleware";
import verifyToken from "../../middlewares/verifyToken.middleware";
import container from "../../inversify/container";
import { ManagerLoginController } from "../../controllers/managerControllers/loginController";
import { ManagerEventController } from "../../controllers/managerControllers/eventController";
import multer from 'multer';
import { ManagerOfferController } from "../../controllers/managerControllers/offerController";
import { BookingDetailsController } from "../../controllers/managerControllers/bookingDetailsController";
import { Request,Response } from "express";
import { VerifierDetailsController } from "../../controllers/managerControllers/verifierDetailsController";
const upload = multer({ storage: multer.memoryStorage() });
const managerRoute=Router();



const managerLoginController=container.get<ManagerLoginController>(ManagerLoginController);
const managerEventController=container.get<ManagerEventController>(ManagerEventController);
const managerOfferController=container.get<ManagerOfferController>(ManagerOfferController);
const bookingDetailsController=container.get<BookingDetailsController>(BookingDetailsController);
const verifeirDetailsController=container.get<VerifierDetailsController>(VerifierDetailsController);

managerRoute.post('/mSubmit',(req,res)=>managerLoginController.managerRegister(req,res));
managerRoute.post('/MverifyOtp',(req,res)=>managerLoginController.managerVerifyOtp(req,res));
managerRoute.post('/Mlogin',(req,res)=>managerLoginController.managerLogin(req,res));
managerRoute.post('/forgotM',(req,res)=>managerLoginController.managerForgotPassword(req,res));
managerRoute.post('/verifyForgotOtpM',(req,res)=>managerLoginController.managerVerifyOtpForForgot(req,res));
managerRoute.post('/resetPasswordM',(req,res)=>managerLoginController.managerResetPassword(req,res));
managerRoute.get('/manager/getEventType',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>managerLoginController.getEventTypeData(req,res));
managerRoute.get('/managerProfile/:companyName',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>managerLoginController.getManagerProfileDetails(req,res));
managerRoute.post('/updateManagerData',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>managerLoginController.updateManagerProfile(req,res));
managerRoute.post('/changeManagerPassword',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>managerLoginController.updateManagerPassword(req,res));
managerRoute.post('/refresh-token',(req,res)=>managerLoginController.reGenerateManagerAccessToken(req,res));
managerRoute.post('/createEvent',checkIfManagerBlocked,verifyToken(['manager']), upload.single('images'),(req,res)=> managerEventController.createEventPost(req,res));
managerRoute.post('/createEventSeatDetails/:eventId',checkIfManagerBlocked,verifyToken(['manager']), (req,res)=>managerEventController.createEventSeatDetails(req,res));
managerRoute.get('/Manager/getAllEventData/:managerId',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=> managerEventController.getAllEventDetails(req,res));
managerRoute.get('/getPreviousEventDetails/:id',checkIfManagerBlocked,verifyToken(['manager']), (req,res)=>managerEventController.getSelectedEventDetails(req,res));
managerRoute.get(`/getPreviousTicketDetails/:id`,checkIfManagerBlocked,verifyToken(['manager']),(req,res)=> managerEventController.fetchEventTicketDetails(req,res));
managerRoute.post('/updateEvent',checkIfManagerBlocked,verifyToken(['manager']),upload.array("images",10),(req,res)=> managerEventController.updateEventPost(req,res));

managerRoute.get('/getOffers/:managerId',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>managerOfferController.getAllOffers(req,res));
managerRoute.post('/addNewOffer',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>managerOfferController.createNewOffer(req,res));
managerRoute.get('/getSelectedOffer/:offerId/:managerId',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>managerOfferController.getSelectedOfferDetails(req,res));
managerRoute.post('/updateOffer',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>managerOfferController.updateOfferDetails(req,res));
managerRoute.get('/searchOfferInput/:inputSearch',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>managerOfferController.getSearchOfferUserInput(req,res));
managerRoute.get('/fetchManagerWallet/:managerId',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>managerOfferController.fetchManagerWallet(req,res));

managerRoute.get('/fetchManagerNotification/:managerId',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>managerLoginController.fetchManagerNotification(req,res));
managerRoute.get(`/fetchEventsName/:companyName`,checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>managerLoginController.fetchAllCompanyEvents(req,res));
managerRoute.get('/fetchUserCount/:managerId',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>managerLoginController.fetchManagerDashboardData(req,res));
managerRoute.get('/fetchDashboardGraphData/:managerId/:selectedType/:selectedTime',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>managerLoginController.fetchDashboardGraph(req,res));
managerRoute.get('/fetchDashboardPieChart/:managerId',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>managerLoginController.fetchDashboardPieChart(req,res));
managerRoute.get(`/fetchDashboardBarChart/:selectedEvent`,checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>managerLoginController.fetchDashboardBarChart(req,res));
managerRoute.get('/fetchNotificationCount/:managerId',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>managerLoginController.fetchNotificationCount(req,res));
managerRoute.get('/checkIfDateValid',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>managerLoginController.checkDateValidation(req,res));
managerRoute.get('/fetchEventNames/:managerId',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>managerLoginController.fetchEventNames(req,res));
managerRoute.post('/updateSeatInfo',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>managerEventController.updateSeatInformation(req,res));



managerRoute.get('/fetchTodayBooking/:managerId',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>bookingDetailsController.getTodaysBookingDetails(req,res));
managerRoute.get('/fetchTotalBooking/:managerId',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>bookingDetailsController.getTotalBookingDetails(req,res));
managerRoute.get('/getUserNames',(req: Request, res: Response) => bookingDetailsController.getBookedUserDetails(req, res));
managerRoute.post('/create-chatSchema2',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>bookingDetailsController.createChatSchema(req,res));
managerRoute.get('/fetchAllVerifier/:managerName',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>verifeirDetailsController.getAllVerifiers(req,res));
managerRoute.get('/updateVerifierStatus/:verifierId',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>verifeirDetailsController.updateVerifierStatus(req,res));

managerRoute.post('/addNewVerifier',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>verifeirDetailsController.postNewVerifier(req,res));
managerRoute.get(`/fetchVerifierDetails/:verifierId`,checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>verifeirDetailsController.getSelectedVerifierData(req,res));
managerRoute.post('/updateVerifier',checkIfManagerBlocked,verifyToken(['manager']),(req,res)=>verifeirDetailsController.updateVerifierData(req,res))



export default managerRoute;



