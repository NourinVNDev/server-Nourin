import { Request,Response} from "express-serve-static-core";
import { FormData } from "../../../dtos/user.dto";
export interface IAdminCategoryRepo{
          getCategoryRepo(req:Request,res:Response):Promise<{result?:any}>
                addCategoryRepo(formData:FormData,req:Request,res:Response):Promise<{result:any,error?:string}>
                      fetchSelectedCategoryRepo(categoryId:string,req:Request,res:Response):Promise<{result?:any}>
                            editSelectedCategoryRepo(category:string,categoryId:string,req:Request,res:Response):Promise<{result?:any}>
}