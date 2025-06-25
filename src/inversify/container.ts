import { Container} from "inversify";
import { UserLoginService } from "../services/userServices/loginService";
import { IUserLoginService } from "../interfaces/userInterfaces/serviceInterfaces/IUserLoginService";
import { UserLoginController } from "../controllers/userControllers/loginController";
const container=new Container();
import TYPES from "./types";
import { IUserLoginRepo } from "../interfaces/userInterfaces/repositoryInterfaces/IUserLoginRepo";
import { UserLoginRepository } from "../repositories/userRepository/loginRepository";
import { IEventBookingService } from "../interfaces/userInterfaces/serviceInterfaces/IEventBookingService";
import { EventBookingService } from "../services/userServices/eventBookingService";
import { IEventBookingRepo } from "../interfaces/userInterfaces/repositoryInterfaces/IEventBookingRepo";
import { EventBookingRepository } from "../repositories/userRepository/eventBookingRepository";
import { EventBookingController } from "../controllers/userControllers/eventBookingController";
import { IStripeService } from "../interfaces/userInterfaces/serviceInterfaces/IStripeService";
import { StripePaymentService } from "../services/userServices/stripePaymentService";
import { IStripeRepo } from "../interfaces/userInterfaces/repositoryInterfaces/IStripeRepo";
import { StripePaymentRepository } from "../repositories/userRepository/stripePaymentRepository";
import { StripePaymentController } from "../controllers/userControllers/stripePaymentController";
import { UserProfileService } from "../services/userServices/userProfileService";
import { IUserProfileService } from "../interfaces/userInterfaces/serviceInterfaces/IUserProfileService";
import { IUserProfileRepo } from "../interfaces/userInterfaces/repositoryInterfaces/IUserProfileRepo";
import { UserProfileRepository } from "../repositories/userRepository/userProfileRepository";
import { UserProfileController } from "../controllers/userControllers/userProfileController";
import { IRetryEventService } from "../interfaces/userInterfaces/serviceInterfaces/IRetryEventPaymentService";
import { RetryEventPaymentService } from "../services/userServices/retryPendingEventService";
import { IRetryEventRepo } from "../interfaces/userInterfaces/repositoryInterfaces/IRetryEventPaymentRepo";
import { RetryEventPaymentRepo } from "../repositories/userRepository/retryPendingEventRepository";
import { RetryEventPaymentController } from "../controllers/userControllers/retryPendingEventController";
import { INotificationVideoCallService } from "../interfaces/userInterfaces/serviceInterfaces/INotificationVideoCallService";
import { NotificationVideoCallService } from "../services/userServices/notificationVideoCallService";
import { INotificationVideoCallRepo } from "../interfaces/userInterfaces/repositoryInterfaces/INotificationVideoCallRepo";
import { NOtificationVideoCallRepository } from "../repositories/userRepository/notificationVideoCallRepository";
import { NotificationVideoCallController } from "../controllers/userControllers/notificationVideoCallController";
import { IMultiVerifierService } from "../interfaces/verifierInterfaces/serviceInterfaces/IMultiVerifierService";
import { MultiVerifierService } from "../services/verifierServices/multiVerifierService";
import { IMultiVerifierRepo } from "../interfaces/verifierInterfaces/repositoryInterfaces/IMultiVerifierRepo";
import { MultiVerifierRepo } from "../repositories/verifierRepository/multiVerifierRepository";
import { MultiVerifierController } from "../controllers/verifierControllers/multiVerifierController";
import { IAdminLoginService } from "../interfaces/adminInterfaces/serviceInterfaces/IAdminLoginService";
import { AdminLoginService } from "../services/adminServices/adminLoginService";
import { IAdminLoginRepo } from "../interfaces/adminInterfaces/repositoryInterfaces/IAdminLoginRepo";
import { AdminLoginRepository } from "../repositories/adminRepository/adminLoginRepository";
import { AdminLoginController } from "../controllers/adminControllers/loginController";
import { IAdminCategoryService } from "../interfaces/adminInterfaces/serviceInterfaces/IAdminCategoryService";
import { AdminCategoryService } from "../services/adminServices/adminCategoryService";
import { IAdminCategoryRepo } from "../interfaces/adminInterfaces/repositoryInterfaces/IAdminCategoryRepo";
import { AdminCategoryRepository } from "../repositories/adminRepository/adminCategoryRepository";
import { AdminCategoryController } from "../controllers/adminControllers/categoryController";
import { IAdminOfferService } from "../interfaces/adminInterfaces/serviceInterfaces/IAdminOfferService";
import { AdminOfferService } from "../services/adminServices/adminOfferService";
import { IAdminOfferRepo } from "../interfaces/adminInterfaces/repositoryInterfaces/IAdminOfferRepo";
import { AdminOfferRepository } from "../repositories/adminRepository/adminOfferRepository";
import { AdminOfferController } from "../controllers/adminControllers/offerController";
import { IManagerLoginService } from "../interfaces/managerInterfaces/serviceInterfaces/IManagerLoginService";
import { ManagerLoginService } from "../services/managerServices/managerloginService";
import { IManagerLoginRepo } from "../interfaces/managerInterfaces/repositoryInterfaces/IManagerLoginRepo";
import { ManagerLoginRepository } from "../repositories/managerRepository/managerLoginRepository";
import { ManagerLoginController } from "../controllers/managerControllers/loginController";
import { IManagerEventService } from "../interfaces/managerInterfaces/serviceInterfaces/IManagerEventService";
import { ManagerEventService } from "../services/managerServices/managerEventService";
import { IManagerEventRepo } from "../interfaces/managerInterfaces/repositoryInterfaces/IManagerEventRepo";
import { ManagerEventRepository } from "../repositories/managerRepository/managerEventRepository";
import { ManagerEventController } from "../controllers/managerControllers/eventController";
import { IManagerOfferService } from "../interfaces/managerInterfaces/serviceInterfaces/IManagerOfferService";
import { ManagerOfferService } from "../services/managerServices/managerOfferService";
import { IManagerOfferRepo } from "../interfaces/managerInterfaces/repositoryInterfaces/IManagerOfferRepo";
import { ManagerOfferRepository } from "../repositories/managerRepository/managerOfferRepository";
import { ManagerOfferController } from "../controllers/managerControllers/offerController";
import { IBookingDetailsService } from "../interfaces/managerInterfaces/serviceInterfaces/IBookingDetailsService";
import { BookingDetailsService } from "../services/managerServices/bookingDetailsService";
import { IBookingDetailsRepo } from "../interfaces/managerInterfaces/repositoryInterfaces/IBookingDetailsRepo";
import { BookingDetailsRepository } from "../repositories/managerRepository/bookingDetailsRepository";
import { BookingDetailsController } from "../controllers/managerControllers/bookingDetailsController";
import { IVerifierDetailsService } from "../interfaces/managerInterfaces/serviceInterfaces/IVerifierDetailsService";
import { VerifierDetailsService } from "../services/managerServices/verifierDetailsService";
import { IVerifierDetailsRepo } from "../interfaces/managerInterfaces/repositoryInterfaces/IVerifierDetailsRepo";
import { VerifierDetailsRepository } from "../repositories/managerRepository/verifierDetailsRepository";
import { VerifierDetailsController } from "../controllers/managerControllers/verifierDetailsController";
//user
//container.bind<IUserLoginService>(TYPES.IUserLoginService1).to(UserLoginService);
container.bind<IUserLoginService>(TYPES.IUserLoginService).to(UserLoginService);
container.bind<IUserLoginRepo>(TYPES.IUserLoginRepo).to(UserLoginRepository);
//container.bind<UserLoginController>(Symbol.for("UserLoginController")).to(UserLoginController);
container.bind<UserLoginController>(UserLoginController).toSelf()

container.bind<IEventBookingService>(TYPES.IEventBookingService).to(EventBookingService);
container.bind<IEventBookingRepo>(TYPES.IEventBookingRepo).to(EventBookingRepository);
container.bind<EventBookingController>(EventBookingController).toSelf();

container.bind<IStripeService>(TYPES.IStripeService).to(StripePaymentService);
container.bind<IStripeRepo>(TYPES.IStripeRepo).to(StripePaymentRepository);
container.bind<StripePaymentController>(StripePaymentController).toSelf();

container.bind<IUserProfileService>(TYPES.IUserProfileService).to(UserProfileService);
container.bind<IUserProfileRepo>(TYPES.IUserProfileRepo).to(UserProfileRepository);
container.bind<UserProfileController>(UserProfileController).toSelf();

container.bind<IRetryEventService>(TYPES.IRetryEventService).to(RetryEventPaymentService);
container.bind<IRetryEventRepo>(TYPES.IRetryEventRepo).to(RetryEventPaymentRepo);
container.bind<RetryEventPaymentController>(RetryEventPaymentController).toSelf();

container.bind<INotificationVideoCallService>(TYPES.INotificationVideoCallService).to(NotificationVideoCallService);
container.bind<INotificationVideoCallRepo>(TYPES.INotificationVideoCallRepo).to(NOtificationVideoCallRepository);
container.bind<NotificationVideoCallController>(NotificationVideoCallController).toSelf();

//verifier
container.bind<IMultiVerifierService>(TYPES.IMultiVerifierService).to((MultiVerifierService));
container.bind<IMultiVerifierRepo>(TYPES.IMultiVerifierRepo).to(MultiVerifierRepo);
container.bind<MultiVerifierController>(MultiVerifierController).toSelf();

//admin
container.bind<IAdminLoginService>(TYPES.IAdminLoginService).to(AdminLoginService);
container.bind<IAdminLoginRepo>(TYPES.IAdminLoginRepo).to(AdminLoginRepository);
container.bind<AdminLoginController>(AdminLoginController).toSelf();

container.bind<IAdminCategoryService>(TYPES.IAdminCategoryService).to(AdminCategoryService);
container.bind<IAdminCategoryRepo>(TYPES.IAdminCategoryRepo).to(AdminCategoryRepository);
container.bind<AdminCategoryController>(AdminCategoryController).toSelf();

container.bind<IAdminOfferService>(TYPES.IAdminOfferService).to(AdminOfferService);
container.bind<IAdminOfferRepo>(TYPES.IAdminOfferRepo).to(AdminOfferRepository);
container.bind<AdminOfferController>(AdminOfferController).toSelf();

//manager
container.bind<IManagerLoginService>(TYPES.IManagerLoginService).to(ManagerLoginService);
container.bind<IManagerLoginRepo>(TYPES.IManagerLoginRepo).to(ManagerLoginRepository);
container.bind<ManagerLoginController>(ManagerLoginController).toSelf();

container.bind<IManagerEventService>(TYPES.IManagerEventService).to(ManagerEventService);
container.bind<IManagerEventRepo>(TYPES.IManagerEventRepo).to(ManagerEventRepository);
container.bind<ManagerEventController>(ManagerEventController).toSelf();

container.bind<IManagerOfferService>(TYPES.IManagerOfferService).to(ManagerOfferService);
container.bind<IManagerOfferRepo>(TYPES.IManagerOfferRepo).to(ManagerOfferRepository);
container.bind<ManagerOfferController>(ManagerOfferController).toSelf();

container.bind<IBookingDetailsService>(TYPES.IBookingDetailsService).to(BookingDetailsService);
container.bind<IBookingDetailsRepo>(TYPES.IBookingDetailsRepo).to(BookingDetailsRepository);
container.bind<BookingDetailsController>(BookingDetailsController).toSelf();

container.bind<IVerifierDetailsService>(TYPES.IVerifierDetailsService).to(VerifierDetailsService);
container.bind<IVerifierDetailsRepo>(TYPES.IVerifierDetailsRepo).to(VerifierDetailsRepository);
container.bind<VerifierDetailsController>(VerifierDetailsController).toSelf();








export default container;