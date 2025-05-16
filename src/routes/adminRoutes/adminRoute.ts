import { Router } from "express";
import verifyToken from "../../middlewares/userMiddle";

import adminLogin from "../../controllers/adminControllers/AdminLoginDetails";
import { AdminLoginRepo } from "../../repository/AdminRepository/AloginRepo";
import { AdminLoginServices } from "../../service/adminServices/adminloginService";
import multer from "multer";
const upload=multer();
const adminRoute=Router();
const  adminRepositoryInstance=new AdminLoginRepo();
const adminServiceInstance=new  AdminLoginServices(adminRepositoryInstance);
const adminLoginRouter=new adminLogin(adminServiceInstance);
adminRoute.post('/adminlogin',adminLoginRouter.createAdminData.bind(adminLoginRouter));
adminRoute.post('/adminlogin1',adminLoginRouter.adminLogin.bind(adminLoginRouter));
adminRoute.get('/admin/users',verifyToken(['admin']),adminLoginRouter.getUserDetails.bind(adminLoginRouter));
adminRoute.get('/admin/managers',verifyToken(['admin']),adminLoginRouter.getManagerDetails.bind(adminLoginRouter));
adminRoute.get('/admin/managerEvents/:managerId',verifyToken(['admin']),adminLoginRouter.getEventAndBookedDetails.bind(adminLoginRouter));
adminRoute.get('/admin/category',verifyToken(['admin']),adminLoginRouter.getCategoryDetails.bind(adminLoginRouter));
adminRoute.post('/admin/addCategory',verifyToken(['admin']),adminLoginRouter.addEventCategoryDetails.bind(adminLoginRouter));
adminRoute.get('/admin/fetchSelectedCategory/:id',verifyToken(['admin']),adminLoginRouter.fetchSelectedCategory.bind(adminLoginRouter));
adminRoute.post('/admin/editSingleCategory/:categoryId',verifyToken(['admin']),adminLoginRouter.editSelectedCategory.bind(adminLoginRouter));
adminRoute.post('/admin/toggleIsBlock',verifyToken(['admin']),adminLoginRouter.postToggleIsBlock.bind(adminLoginRouter));
adminRoute.post('/admin/categoryIsBlock',verifyToken(['admin']),adminLoginRouter.postCategoryIsBlock.bind(adminLoginRouter));
adminRoute.post('/admin/managerIsBlock',verifyToken(['admin']),adminLoginRouter.postManagerIsBlock.bind(adminLoginRouter));
adminRoute.get('/admin/fetchAdminWallet',verifyToken(['admin']),adminLoginRouter.getAdminWalletDetails.bind(adminLoginRouter));
adminRoute.post('/refresh-token',adminLoginRouter.reGenerateAdminAccessToken.bind(adminLoginRouter));
adminRoute.get('/admin/fetchUserManagerCount',verifyToken(['admin']),adminLoginRouter.fetchAdminDashboardData.bind(adminLoginRouter));
adminRoute.get(`/fetchDashboardGraphData/:selectedType/:selectedTime`,verifyToken(['admin']),adminLoginRouter.fetchDashboardGraph.bind(adminLoginRouter));
adminRoute.get(`/fetchDashboardPieChart`,verifyToken(['admin']),adminLoginRouter.fetchDashboardPieChart.bind(adminLoginRouter))


export default adminRoute;