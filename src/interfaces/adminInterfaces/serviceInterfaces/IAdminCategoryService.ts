import { Request,Response} from "express-serve-static-core";
import { FormData } from "../../../dtos/user.dto";
export interface IAdminCategoryService{
        getCategoryService(req:Request,res:Response):Promise<{result?:any}>
            addCategoryService(formData:FormData,req:Request,res:Response):Promise<{result?:any}>
                fetchSelectedCategoryService(id:string,req:Request,res:Response):Promise<{result?:any}>
                    editSelectedCategoryService(category:string,categoryId:string,req:Request,res:Response):Promise<{result?:any}>
                      

}