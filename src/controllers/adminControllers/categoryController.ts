import { injectable,inject } from "inversify";
import TYPES from "../../inversify/types";
import { IAdminCategoryService } from "../../interfaces/adminInterfaces/serviceInterfaces/IAdminCategoryService";
import { Request,Response } from "express";
import HTTP_statusCode from "../../contants/enums";
import response_message from "../../contants/response_message";
@injectable()
export class AdminCategoryController{
    constructor(
        @inject(TYPES.IAdminCategoryService) private _categoryService:IAdminCategoryService
    ){}
      async getCategoryDetails(req: Request, res: Response): Promise<void> {
    try {
      console.log("Hello from Category");
      const result = await this._categoryService.getCategoryService(req, res);
      console.log('Category', result?.result);
      res.status(HTTP_statusCode.OK).json({
        message:response_message.GETCATEGORYDETAILS_SUCCESS,
        data: result?.result,
      });

    } catch (error) {
      console.error("Error in getCategoryDetails:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
    }

  }
    async addEventCategoryDetails(req: Request, res: Response): Promise<void> {
    try {
      const formData = req.body;
      console.log('add Category', formData);

      const result = await this._categoryService.addCategoryService(formData, req, res);
      console.log("Full Result Structure:", JSON.stringify(result, null, 2));

      const actualResult = result?.result?.result?.result; // Extract actual data

      if (actualResult?.success === true) {
        res.status(HTTP_statusCode.OK).json({
          message: response_message.ADDEVENTCATEGORYDETAILS_SUCCESS,
          data: actualResult.data,
        });
      } else {
        res.status(HTTP_statusCode.BadRequest).json({
          message: actualResult?.message || "Duplicate Category Name",
          data: null,
        });
      }
    } catch (error) {
      console.error("Error in getCategoryDetails:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message:response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
    }
  }
    async fetchSelectedCategory(req: Request, res: Response): Promise<void> {
    try {
 

      const { id } = req.params;
      const categoryId = id;

      const result = await this._categoryService.fetchSelectedCategoryService(categoryId, req, res);
      console.log('Category', result?.result);
      res.status(HTTP_statusCode.OK).json({
        message:response_message.FETCHSELECTEDCATEGORY_SUCCESS,
        data: result?.result,
      });

    } catch (error) {
      console.error("Error in getCategoryDetails:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
    }
  }
    async editSelectedCategory(req: Request, res: Response): Promise<void | any> {
    try {
      console.log("Hello from  editing selected Category");
      console.log("Checking", req.params);
      const category = req.body.category;

      const { categoryId } = req.params;

      console.log("chill", categoryId, category);

      const result = await this._categoryService.editSelectedCategoryService(category, categoryId, req, res);
      console.log('Category', result?.result);
      res.status(HTTP_statusCode.OK).json({
        message: response_message.EDITSELECTEDCATEGORY_SUCCESS,
        data: result?.result,
      });

    } catch (error) {
      console.error("Error in getCategoryDetails:", error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: response_message.FETCHADMINDASHBOARDDATA_ERROR, error });
    }
  }




}