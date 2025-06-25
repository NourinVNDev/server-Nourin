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

const userLoginController = container.get<UserLoginController>(Symbol.for("UserLoginController"));
const eventBookingController=container.get<EventBookingController>(EventBookingController);
const userProfileController=container.get<UserProfileController>(UserProfileController);
const retryEventPaymentController=container.get<RetryEventPaymentController>(RetryEventPaymentController);
const notificationVideoCallController=container.get<NotificationVideoCallController>(NotificationVideoCallController);

router.get('/fetchEventData',(req,res)=>userLoginController.getAllEventData(req,res));
router.post('/login',userLoginController.loginDetails);
router.post('/submit',userLoginController.postUserDetails);
router.post('/verifyOtp',userLoginController.verifyOTP);
router.post('/resendOtp',userLoginController.resendOtp);
router.post('/googleAuth',userLoginController.googleAuth);
router.post('/forgotEmail',userLoginController.forgotPassword);
router.post('/verifyForgotOtp',userLoginController.verifyForgotOtp);
router.post('/resetPassword',userLoginController.resetPassword)

router.get('/getAllCategoryDetails',checkIfUserBlocked,verifyToken(['user']),userLoginController.getAllCategoryDetails)
router.get('/profile/:userId',checkIfUserBlocked,verifyToken(['user']),userLoginController.setProfileDetails);
router.post('/changeUserProfile',checkIfUserBlocked,verifyToken(['user']),userLoginController.changeUserProfileDetails);
router.post('/refresh-token',checkIfUserBlocked,verifyToken(['user']),userLoginController.reGenerateAccessToken);
router.get('/user/events/:category',checkIfUserBlocked,verifyToken(['user']),userLoginController.getCategoryTypeDetails);
router.get('/post/getAllEventData',checkIfUserBlocked,verifyToken(['user']),userLoginController.getAllEventDetails);
router.get('/generateOtpForResetPassword/:userId',checkIfUserBlocked,verifyToken(['user']),userLoginController.generateOtpForPassword);
router.post('/verifyOtpForPassword',checkIfUserBlocked,verifyToken(['user']),userLoginController.verifyOtpForPassword);
router.post('/handleResetPassword',checkIfUserBlocked,verifyToken(['user']),userLoginController.handleResetPassword);
router.get(`/post/checkOfferAvailable/:category`,checkIfUserBlocked,verifyToken(['user']),userLoginController.checkOfferAvailable)

router.post('/post/handleLike',checkIfUserBlocked,verifyToken(['user']), eventBookingController.handleLikeForPost);
router.get('/post/handleDetails/:postId',checkIfUserBlocked,verifyToken(['user']),eventBookingController.getPostDetails);
router.get('/post/getSelectEvent/:id',checkIfUserBlocked,verifyToken(['user']),eventBookingController.getSelectedEventDetails);
router.post('/post/create-checkout-session',checkIfUserBlocked,verifyToken(['user']),eventBookingController.makePaymentStripe);
router.post('/retryPayment-checkout-session',checkIfUserBlocked,verifyToken(['user']),eventBookingController.makerRetryPayment);
router.get('/post/getSelectedEventData/:postId',checkIfUserBlocked,verifyToken(['user']),eventBookingController.getAnEventDetails);
router.post(`/saveBillingDetails`,checkIfUserBlocked,verifyToken(['user']),eventBookingController.saveBillingDetails);
router.post('/saveRetryBillingDetails',checkIfUserBlocked,verifyToken(['user']),eventBookingController.saveRetryBillingDetails);
router.post(`/updatePaymentStatus/:bookedId`,checkIfUserBlocked,verifyToken(['user']),eventBookingController.updateBookedEventPaymentStatus);
router.get('/getSelectedBookingData/:bookingId',checkIfUserBlocked,verifyToken(['user']),eventBookingController.fetchSavedBookingdata);
router.get('/checkIfUserValid/:email/:eventName/:bookedId',checkIfUserBlocked,verifyToken(['user']),eventBookingController.checkIfUserValid);



router.get(`/getExistingReview/:eventId/:userId`,checkIfUserBlocked,verifyToken(['user']),userProfileController.getExistingReviews);
router.post('/review-rating',checkIfUserBlocked,verifyToken(['user']),userProfileController.postReviewAndRating);
router.get('/getEventHistory/:userId',checkIfUserBlocked,verifyToken(['user']),userProfileController.getEventHistoryDetails);
router.get('/getManagerName',checkIfUserBlocked,verifyToken(['user']),userProfileController.getBookedManagerDetails);
router.get('/getBookedEvent/:userId',checkIfUserBlocked,verifyToken(['user']),userProfileController.getEventBookedDetails);
router.post('/create-chatSchema',checkIfUserBlocked,verifyToken(['user']),userProfileController.createChatSchema);
router.post(`/uploadUserProfile/:userId`,checkIfUserBlocked,verifyToken(['user']),upload.single('profilePicture'),userProfileController.uploadUserProfilePicture);


router.get('/cancelEventBooking/:bookingId/:userId',checkIfUserBlocked,verifyToken(['user']),retryEventPaymentController.cancelBookingEvent);
router.get('/fetchUserWallet/:userId',checkIfUserBlocked,verifyToken(['user']),retryEventPaymentController.fetchUserWallet);

router.get('/fetchUserNotification/:userId',checkIfUserBlocked,verifyToken(['user']),notificationVideoCallController.fetchUserNotification);
router.get('/fetchNotificationCount/:userId',checkIfUserBlocked,verifyToken(['user']),notificationVideoCallController.fetchNotificationCount);


export default router;
