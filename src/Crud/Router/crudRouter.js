import express from "express";
import { addData, deleteProductByid, exportCSV, getProductData, getProductWithImgByid, getProductsByUserId, importProductByCSV, updateProductData } from "../Controller/crudController.js";
import { addProductsImages, deleteProductImages, updateProductImages } from "../Controller/productImagesController.js";
import { verifyUserToken } from "../../Middilwares/middileware.js";
import multer from "multer";
import path from "path";
const Router = express.Router();
const storage = multer.diskStorage(
    {
        destination:'./src/productImages',
        filename:(req,file,cb)=>{
            return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
        }
    }
)
Router.use(express.static('src/productImages'))
const upload = multer({storage:storage});
Router.post("/add-data", verifyUserToken, addData);
Router.get("/get-by-user-id", verifyUserToken, getProductsByUserId)
Router.get("/", getProductData);
Router.post("/add-images/:id",upload.single("image"),verifyUserToken,addProductsImages);
Router.put("/update-product-image/:id",upload.single("image"),updateProductImages)
Router.get("/get-by-product-id/:id", getProductWithImgByid);
Router.put("/update-product/:id", updateProductData);
Router.delete("/delete-product/:id", deleteProductByid);
Router.delete("/delete-product-image/:id",verifyUserToken,deleteProductImages);
Router.get("/export", exportCSV)
Router.post("/file-import", upload.single('file'), verifyUserToken,importProductByCSV)
// Router.post("/filterbyname",filterNameAndType);
// Router.get("/get-products-by-user-id",getProductsWithImgByUserId)
export default Router;