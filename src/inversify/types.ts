const TYPES = {
  //user
  IUserLoginRepo1: Symbol.for("IUserLoginRepo"),
  IUserLoginService1: Symbol.for("IUserLoginService"),

  IEventBookingService:Symbol.for('IEventBookingService'),
  IEventBookingRepo:Symbol.for('IEventBookingRepo'),

  IStripeService:Symbol.for('IStripeService'),
  IStripeRepo:Symbol.for('IStripeRepo'),

  IUserProfileService:Symbol.for('IUserProfileService'),
  IUserProfileRepo:Symbol.for('IUserProfileRepo'),

  IRetryEventService:Symbol.for('IRetryEventService'),
  IRetryEventRepo:Symbol.for('IRetryEventRepo'),

  INotificationVideoCallService:Symbol.for('INotificationVideoCallService'),
  INotificationVideoCallRepo:Symbol.for('INotificationVideoCallRepo'),

  //verifier
  IMultiVerifierService:Symbol.for('IMultiVerifierService'),
  IMultiVerifierRepo:Symbol.for('IMultiVerifierRepo'),

  //admin
  IAdminLoginService:Symbol.for('IAdminLoginService'),
  IAdminLoginRepo:Symbol.for('IAdminLoginRepo'),

  IAdminCategoryService:Symbol.for('IAdminCategoryService'),
  IAdminCategoryRepo:Symbol.for('IAdminCategoryRepo'),

  IAdminOfferService:Symbol.for('IAdminOfferService'),
  IAdminOfferRepo:Symbol.for('IAdminOfferRepo'),

  //manager
  IManagerLoginService:Symbol.for('IManagerLoginService'),
  IManagerLoginRepo:Symbol.for('IManagerLoginRepo'),

  IManagerEventService:Symbol.for('IManagerEventService'),
  IManagerEventRepo:Symbol.for('IManagerEventRepo'),

  IManagerOfferService:Symbol.for('IManagerOfferService'),
  IManagerOfferRepo:Symbol.for('IManagerOfferRepo'),

  IBookingDetailsService:Symbol.for('IBookingDetailsService'),
  IBookingDetailsRepo:Symbol.for('IBookingDetailsRepo'),

  IVerifierDetailsService:Symbol.for('IVerifierDetailsService'),
  IVerifierDetailsRepo:Symbol.for('IVerifierDetailsRepo'),

  





};

export default TYPES;
