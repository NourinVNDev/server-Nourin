enum response_message {
    //admin
    CREATEADMINDATA_SUCCESS='Login Success',
    CREATEADMINDATA_FAILED='Invalid login credentials' ,
    CREATEADMINDATA_ERROR='Something went wrong' ,
    ADMINLOGIN_SUCCESS='Login Success',
    ADMINLOGIN_FAILED='Invalid login credentials',
    ADMINLOGIN_ERROR='Something went wrong' ,
    REGENERATEADMINACCESSTOKEN_SUCCESS= "Manager Access token regenerated successfully",
    REGENERATEADMINACCESSTOKEN_FAILED="Admin Refresh token not provided",
    REGENERATEADMINACCESSTOKEN_ERROR='Admin Refresh token secret not defined in environment variables',
    GETUSERDETAILS_ERROR='Failed to fetch user details',
    FETCHADMINDASHBOARDDATA_ERROR='Internal server error',
    POSTTOGGLEISBLOCK_FAILED='Invalid request data',
    POSTTOGGLEISBLOCK_ERROR='Failed to toggle block status',
    GETCATEGORYDETAILS_SUCCESS='Event data saved successfully',
    FETCHSELECTEDCATEGORY_SUCCESS="Selected Category fetched successfully",
    EDITSELECTEDCATEGORY_SUCCESS='Category edited successfully',
    ADDEVENTCATEGORYDETAILS_SUCCESS='Category data saved successfully',

    //manager
    MANAGERREGISTER_FAILED='Failed to generate OTP.',
    MANAGERREGISTER_SUCCESS='OTP sent',
    MANAGERREGISTER_ERROR='Failed to save user data in session',
    MANAGERVERIFYOTP_SUCCESS='Otp is Matched',
    MANAGERVERIFYOTP_FAILED='Otp  is not Matched',
    MANAGERVERIFYOTP_ERROR='Failed to save user data in session',
    MANAGERVERIFYOTPFORFORGOT_SUCCESS= 'OTP Matched',
    MANAGERRESETPASSWORD_SUCCESS='password Reset Success',
    REGENERATEMANAGERACCESSTOKEN_FAILED='Manager Refresh token not provided',
    REGENERATEMANAGERACCESSTOKEN_ERROR='Manager Refresh token secret not defined in environment variables',
    REGENERATEMANAGERACCESSTOKEN_SUCCESS='Manager Access token regenerated successfully',
    CREATEEVENTPOSTIMAGE_FAILED='No file uploaded. Please upload an image.',
    CREATEEVENTPOST_SUCCESS='Event data saved successfully',
    CREATEEVENTPOST_FAILED="Duplicate Event Name",
    CREATEEVENTPOST_ERROR="Failed to create event. Please try again." ,
    UPDATEEVENTPOST_SUCCESS='Event data updated saved successfully',
    GETMANAGERPROFILEDETAILS_SUCCESS='Event data fetched successfully',
    UPDATEMANAGERPASSWORD_SUCCESS="Manager Password updated successfully",
    GETALLOFFERS_SUCCESS='Offers fetched successfully',
    GETALLOFFERS_FAILED='Failed to fetch offers',
    UPDATEOFFERDETAILS_SUCCESS='Offers Updated successfully',
    GETALLEVENTDETAILS_SUCCESS= "Event fetched successfully",


    //user
    GETALLEVENTDATA_ERROR="An error occurred while fetching events",
    LOGINDETAILS_SUCCESS='Login Successful',
    LOGINDETAILS_FAILED= 'Invalid credentials',
    POSTUSERDETAILS_FAILED='Email is Already Registered',
    VERIFYOTPFORPASSWORD_SUCCESS='Otp are matched',
    VERIFYOTPFORPASSWORD_FAILED='Otp are not matched',
    FORGOTPASSWORD_SUCCESS='OTP Success',
    VERIFYFORGOTOTP_SUCCESS='Forgot otp is matched Perfectly',
    REGENERATEACCESSTOKEN_FAILED='Refresh token not provided',
    REGENERATEACCESSTOKEN_SUCCESS='Access token regenerated successfully',
    REGENERATEACCESSTOKEN_ERROR='Access token secret not defined in environment variables',
    POSTHANDLELIKE_SUCCESS='User likes successfully',
    GETPOSTDETAILS_SUCCESS='Retrive Post Data successfully',
    UPLOADUSERPROFILEPICTURE_ERROR='Failed to upload profile picture.',
    UPLOADUSERPROFILEPICTURE_FAILED="No file uploaded. Please upload an image.",


    //verifier
    VERIFYOTP_SUCCESS='Your OTP is Correct',
    VERIFYOTP_FAILED='Your OTP is not correct',
    REGENERATEVERIFIERACCESSTOKEN_FAILED='Verifier Refresh token not provided',
    REGENERATEVERIFIERACCESSTOKEN_ERROR='Manager Refresh token secret not defined in environment variables',
    REGENERATEVERIFIERACCESSTOKEN_SUCCESS='Verifier Access token regenerated successfully'


























  
};

export default response_message