import {Router}  from 'express';
const ManagerRoute=Router();
import {managerLogin} from '../../controllers/managerControllers/MLoginDetails';
import { mLoginService } from '../../service/managerService/MloginService';
import { mLoginRepo } from '../../repository/managerRepository/MloginRepo';


const managerRepositoryInstance=new mLoginRepo();
const managerServiceInstance=new mLoginService(managerRepositoryInstance);
const managerLoginRouter=new managerLogin(managerServiceInstance);
// const managerLoginRouter=new managerLogin();

import { verifyToken } from '../../middlewares/userMiddle';


import { checkIfManagerBlocked } from '../../middlewares/managerBlock';
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

ManagerRoute.post('/mSubmit',managerLoginRouter.managerRegister.bind(managerLoginRouter));
ManagerRoute.post('/MverifyOtp',managerLoginRouter.managerVerifyOtp.bind(managerLoginRouter));
ManagerRoute.post('/Mlogin',managerLoginRouter.managerLogin.bind(managerLoginRouter));
ManagerRoute.post('/forgotM',managerLoginRouter.managerForgotPassword.bind(managerLoginRouter));
ManagerRoute.post('/verifyForgotOtpM',managerLoginRouter.managerVerifyOtpForForgot.bind(managerLoginRouter));
ManagerRoute.post('/resetPasswordM',managerLoginRouter.managerResetPassword.bind(managerLoginRouter));
ManagerRoute.post('/createEvent',checkIfManagerBlocked,verifyToken(['manager']), upload.single('images'),managerLoginRouter.createEventPost.bind(managerLoginRouter));
ManagerRoute.post('/createEventSeatDetails/:eventId',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.createEventSeatDetails.bind(managerLoginRouter));
ManagerRoute.get('/manager/getEventType',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.getEventTypeData.bind(managerLoginRouter));
ManagerRoute.get('/getOffers/:managerId',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.getAllOffers.bind(managerLoginRouter));
ManagerRoute.post('/addNewOffer',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.createNewOffer.bind(managerLoginRouter));
ManagerRoute.get('/getSelectedOffer/:offerId',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.getSelectedOfferDetails.bind(managerLoginRouter));
ManagerRoute.post('/updateOffer',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.updateOfferDetails.bind(managerLoginRouter));
ManagerRoute.get('/Manager/getAllEventData/:managerId',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.getAllEventDetails.bind(managerLoginRouter));
ManagerRoute.post('/refresh-token',managerLoginRouter.reGenerateManagerAccessToken.bind(managerLoginRouter));
ManagerRoute.get('/getPreviousEventDetails/:id',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.getSelectedEventDetails.bind(managerLoginRouter));
ManagerRoute.get(`/getPreviousTicketDetails/:id`,checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.fetchEventTicketDetails.bind(managerLoginRouter));
ManagerRoute.post('/updateEvent',checkIfManagerBlocked,verifyToken(['manager']),upload.array("images",10),managerLoginRouter.updateEventPost.bind(managerLoginRouter))
ManagerRoute.get('/managerProfile/:companyName',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.getManagerProfileDetails.bind(managerLoginRouter));
ManagerRoute.post('/updateManagerData',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.updateManagerProfile.bind(managerLoginRouter));
ManagerRoute.post('/changeManagerPassword',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.updateManagerPassword.bind(managerLoginRouter));
ManagerRoute.get('/searchOfferInput/:inputSearch',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.getSearchOfferUserInput.bind(managerLoginRouter));
ManagerRoute.get('/fetchTodayBooking/:managerId',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.getTodaysBookingDetails.bind(managerLoginRouter));
ManagerRoute.get('/fetchTotalBooking/:managerId',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.getTotalBookingDetails.bind(managerLoginRouter));
ManagerRoute.get('/getUserNames/:managerName',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.getBookedUserDetails.bind(managerLoginRouter));
ManagerRoute.post('/create-chatSchema2',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.createChatSchema.bind(managerLoginRouter));
ManagerRoute.get('/fetchAllVerifier/:managerName',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.getAllVerifiers.bind(managerLoginRouter));
ManagerRoute.get('/updateVerifierStatus/:verifierId',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.updateVerifierStatus.bind(managerLoginRouter));
ManagerRoute.get('/fetchManagerWallet/:managerId',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.fetchManagerWallet.bind(managerLoginRouter));
ManagerRoute.get(`/fetchEventsName/:companyName`,checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.fetchAllCompanyEvents.bind(managerLoginRouter));
ManagerRoute.post('/addNewVerifier',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.postNewVerifier.bind(managerLoginRouter));
ManagerRoute.get(`/fetchVerifierDetails/:verifierId`,checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.getSelectedVerifierData.bind(managerLoginRouter));
ManagerRoute.post('/updateVerifier',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.updateVerifierData.bind(managerLoginRouter))
ManagerRoute.post('/updateSeatInfo',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.updateSeatInformation.bind(managerLoginRouter));
ManagerRoute.get('/fetchManagerNotification/:managerId',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.fetchManagerNotification.bind(managerLoginRouter));
ManagerRoute.get('/fetchUserCount/:managerId',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.fetchManagerDashboardData.bind(managerLoginRouter));
ManagerRoute.get('/fetchDashboardGraphData/:managerId/:selectedType/:selectedTime',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.fetchDashboardGraph.bind(managerLoginRouter));
ManagerRoute.get('/fetchDashboardPieChart/:managerId',checkIfManagerBlocked,verifyToken(['manager']),managerLoginRouter.fetchDashboardPieChart.bind(managerLoginRouter));
export default ManagerRoute;    