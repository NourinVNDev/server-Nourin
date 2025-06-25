import { Router } from "express";
import container from "../../inversify/container";
import { AdminLoginController } from "../../controllers/adminControllers/loginController";
import verifyToken from "../../middlewares/verifyToken.middleware";
import { AdminCategoryController } from "../../controllers/adminControllers/categoryController";
import { AdminOfferController } from "../../controllers/adminControllers/offerController";


const adminLoginController=container.get<AdminLoginController>(AdminLoginController);
const adminCategoryController=container.get<AdminCategoryController>(AdminCategoryController);
const adminOfferController=container.get<AdminOfferController>(AdminOfferController);

const adminRoute=Router();
adminRoute.post('/adminlogin',(req,res)=>adminLoginController.createAdminData(req,res));
adminRoute.post('/adminlogin1',(req,res)=>adminLoginController.adminLogin(req,res));
adminRoute.get('/admin/users',verifyToken(['admin']),(req,res)=>adminLoginController.getUserDetails(req,res));
adminRoute.get('/admin/managers',verifyToken(['admin']),(req,res)=>adminLoginController.getManagerDetails(req,res));

adminRoute.get('/admin/managerEvents/:managerId',verifyToken(['admin']),(req,res)=>adminLoginController.getEventAndBookedDetails(req,res));
adminRoute.post('/admin/toggleIsBlock',verifyToken(['admin']),(req,res)=>adminLoginController.postToggleIsBlock(req,res));
adminRoute.post('/admin/managerIsBlock',verifyToken(['admin']),(req,res)=>adminLoginController.postManagerIsBlock(req,res));
adminRoute.get('/admin/fetchAdminWallet',verifyToken(['admin']),(req,res)=>adminLoginController.getAdminWalletDetails(req,res));
adminRoute.post('/refresh-token',(req,res)=>adminLoginController.reGenerateAdminAccessToken(req,res));
adminRoute.post('/admin/categoryIsBlock',verifyToken(['admin']),(req,res)=>adminLoginController.postCategoryIsBlock(req,res));

adminRoute.get('/admin/fetchUserManagerCount',verifyToken(['admin']),(req,res)=>adminLoginController.fetchAdminDashboardData(req,res));
adminRoute.get(`/fetchDashboardGraphData/:selectedType/:selectedTime`,verifyToken(['admin']),(req,res)=>adminLoginController.fetchDashboardGraph(req,res));
adminRoute.get(`/fetchDashboardPieChart`,verifyToken(['admin']),(req,res)=>adminLoginController.fetchDashboardPieChart(req,res));
adminRoute.get(`/fetchDashboardBarChart/:selectedEvent`,verifyToken(['admin']),(req,res)=>adminLoginController.fetchDashboardBarChart(req,res));

adminRoute.get('/admin/category',verifyToken(['admin']),(req,res)=>adminCategoryController.getCategoryDetails(req,res));
adminRoute.post('/admin/addCategory',verifyToken(['admin']),(req,res)=>adminCategoryController.addEventCategoryDetails(req,res));
adminRoute.get('/admin/fetchSelectedCategory/:id',verifyToken(['admin']),(req,res)=>adminCategoryController.fetchSelectedCategory(req,res));
adminRoute.post('/admin/editSingleCategory/:categoryId',verifyToken(['admin']),(req,res)=>adminCategoryController.editSelectedCategory(req,res));

adminRoute.post('/addNewOffer',verifyToken(['admin']),(req,res)=>adminOfferController.createNewOffer(req,res));
adminRoute.get('/getOffers',verifyToken(['admin']),(req,res)=>adminOfferController.getAllOffers(req,res));
adminRoute.get('/getSelectedOffer/:offerId',verifyToken(['admin']),(req,res)=>adminOfferController.getSelectedOfferDetails(req,res));
adminRoute.post('/updateOffer',verifyToken(['admin']),(req,res)=>adminOfferController.updateOfferDetails(req,res));


export default adminRoute;
