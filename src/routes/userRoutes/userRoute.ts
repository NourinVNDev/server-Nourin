import express from "express";
import { UserLoginController } from "../../controllers/userControllers/loginController";
import container from '../../inversify/container';
import { EventBookingController } from "../../controllers/userControllers/eventBookingController";
import { UserProfileController } from "../../controllers/userControllers/userProfileController";
import multer from 'multer';
import { RetryEventPaymentController } from "../../controllers/userControllers/retryPendingEventController";
import { NotificationVideoCallController } from "../../controllers/userControllers/notificationVideoCallController";
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
import verifyToken from "../../middlewares/verifyToken.middleware";
import { checkIfUserBlocked } from "../../middlewares/userIsBlock.middleware";

//const userLoginController = container.get<UserLoginController>(Symbol.for("UserLoginController"));
const userLoginController=container.get<UserLoginController>(UserLoginController)
const eventBookingController=container.get<EventBookingController>(EventBookingController);
const userProfileController=container.get<UserProfileController>(UserProfileController);
const retryEventPaymentController=container.get<RetryEventPaymentController>(RetryEventPaymentController);
const notificationVideoCallController=container.get<NotificationVideoCallController>(NotificationVideoCallController);

router.get('/fetchEventData',(req,res)=>userLoginController.getAllEventData(req,res));
router.post('/login',userLoginController.loginDetails.bind(UserLoginController));
router.post('/submit',(req,res)=>userLoginController.postUserDetails(req,res));
router.post('/verifyOtp',(req,res)=>userLoginController.verifyOTP(req,res));
router.post('/resendOtp',(req,res)=>userLoginController.resendOtp(req,res));
router.post('/googleAuth',(req,res)=>userLoginController.googleAuth(req,res));
router.post('/forgotEmail',(req,res)=>userLoginController.forgotPassword(req,res));
router.post('/verifyForgotOtp',(req,res)=>userLoginController.verifyForgotOtp(req,res));
router.post('/resetPassword',(req,res)=>userLoginController.resetPassword(req,res))

router.get('/getAllCategoryDetails',checkIfUserBlocked,verifyToken(['user']),(req,res)=>userLoginController.getAllCategoryDetails(req,res))
router.get('/profile/:userId',checkIfUserBlocked,verifyToken(['user']),(req,res)=>userLoginController.setProfileDetails(req,res));
router.post('/changeUserProfile',checkIfUserBlocked,verifyToken(['user']),(req,res)=>userLoginController.changeUserProfileDetails(req,res));
router.post('/refresh-token',checkIfUserBlocked,verifyToken(['user']),(req,res)=>userLoginController.reGenerateAccessToken(req,res));
router.get('/user/events/:category',checkIfUserBlocked,verifyToken(['user']),(req,res)=>userLoginController.getCategoryTypeDetails(req,res));
router.get('/post/getAllEventData',checkIfUserBlocked,verifyToken(['user']),(req,res)=>userLoginController.getAllEventDetails(req,res));
router.get('/generateOtpForResetPassword/:userId',checkIfUserBlocked,verifyToken(['user']),(req,res)=>userLoginController.generateOtpForPassword(req,res));
router.post('/verifyOtpForPassword',checkIfUserBlocked,verifyToken(['user']),(req,res)=>userLoginController.verifyOtpForPassword(req,res));
router.post('/handleResetPassword',checkIfUserBlocked,verifyToken(['user']),(req,res)=>userLoginController.handleResetPassword(req,res));
router.get(`/post/checkOfferAvailable/:category`,checkIfUserBlocked,verifyToken(['user']),(req,res)=>userLoginController.checkOfferAvailable(req,res))

router.post('/post/handleLike',checkIfUserBlocked,verifyToken(['user']),(req,res)=> eventBookingController.handleLikeForPost(req,res));
router.get('/post/handleDetails/:postId',checkIfUserBlocked,verifyToken(['user']),(req,res)=>eventBookingController.getPostDetails(req,res));
router.get('/post/getSelectEvent/:id',checkIfUserBlocked,verifyToken(['user']),(req,res)=>eventBookingController.getSelectedEventDetails(req,res));
router.post('/post/create-checkout-session',checkIfUserBlocked,verifyToken(['user']),(req,res)=>eventBookingController.makePaymentStripe(req,res));
router.post('/retryPayment-checkout-session',checkIfUserBlocked,verifyToken(['user']),(req,res)=>eventBookingController.makerRetryPayment(req,res));
router.get('/post/getSelectedEventData/:postId',checkIfUserBlocked,verifyToken(['user']),(req,res)=>eventBookingController.getAnEventDetails(req,res));
router.post(`/saveBillingDetails`,checkIfUserBlocked,verifyToken(['user']),(req,res)=>eventBookingController.saveBillingDetails(req,res));
router.post('/saveRetryBillingDetails',checkIfUserBlocked,verifyToken(['user']),(req,res)=>eventBookingController.saveRetryBillingDetails(req,res));
router.post(`/updatePaymentStatus/:bookedId`,checkIfUserBlocked,verifyToken(['user']),(req,res)=>eventBookingController.updateBookedEventPaymentStatus(req,res));
router.get('/getSelectedBookingData/:bookingId',checkIfUserBlocked,verifyToken(['user']),(req,res)=>eventBookingController.fetchSavedBookingdata(req,res));
router.get('/checkIfUserValid/:email/:eventName/:bookedId',checkIfUserBlocked,verifyToken(['user']),(req,res)=>eventBookingController.checkIfUserValid(req,res));



router.get(`/getExistingReview/:eventId/:userId`,checkIfUserBlocked,verifyToken(['user']),(req,res)=>userProfileController.getExistingReviews(req,res));
router.post('/review-rating',checkIfUserBlocked,verifyToken(['user']),(req,res)=>userProfileController.postReviewAndRating(req,res));
router.get('/getEventHistory/:userId',checkIfUserBlocked,verifyToken(['user']),(req,res)=>userProfileController.getEventHistoryDetails(req,res));
router.get('/getManagerName',checkIfUserBlocked,verifyToken(['user']),(req,res)=>userProfileController.getBookedManagerDetails(req,res));
router.get('/getBookedEvent/:userId',checkIfUserBlocked,verifyToken(['user']),(req,res)=>userProfileController.getEventBookedDetails(req,res));
router.post('/create-chatSchema',checkIfUserBlocked,verifyToken(['user']),(req,res)=>userProfileController.createChatSchema(req,res));
router.post(`/uploadUserProfile/:userId`,checkIfUserBlocked,verifyToken(['user']),upload.single('profilePicture'),(req,res)=>userProfileController.uploadUserProfilePicture(req,res));


router.get('/cancelEventBooking/:bookingId/:userId',checkIfUserBlocked,verifyToken(['user']),(req,res)=>retryEventPaymentController.cancelBookingEvent(req,res));
router.get('/fetchUserWallet/:userId',checkIfUserBlocked,verifyToken(['user']),(req,res)=>retryEventPaymentController.fetchUserWallet(req,res));

router.get('/fetchUserNotification/:userId',checkIfUserBlocked,verifyToken(['user']),(req,res)=>notificationVideoCallController.fetchUserNotification(req,res));
router.get('/fetchNotificationCount/:userId',checkIfUserBlocked,verifyToken(['user']),(req,res)=>notificationVideoCallController.fetchNotificationCount(req,res));


export default router;
