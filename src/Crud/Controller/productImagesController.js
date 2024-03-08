import { StatusCodes } from "http-status-codes";
import { ProductsimgModel } from "../Model/productImgaesModel.js";
export async function addProductsImages(req, res) {
    try {
        const image = `${process.env.URL}/api/product/${req.file.filename}`;
        req.body['image'] = image;
        req.body['productId'] = req.params.id;
        req.body['userId'] = req.headers.id;
        const data = new ProductsimgModel(req.body);
        const response = await data.save();
        res.status(StatusCodes.CREATED).json(response);
    }
    catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json();
    }
}
export async function updateProductImages(req, res) {
    try {
        const image = `${process.env.URL}/api/product/${req.file.filename}`;
        req.body['image'] = image;
        const updateData = req.body;
        const response = await ProductsimgModel.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.status(StatusCodes.OK).json(response);
    }
    catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json();

    }
}
export async function deleteProductImages(req, res) {
    try {
        if (req.headers.id) {
            await ProductsimgModel.findByIdAndDelete({ _id: req.params.id });
            res.status(StatusCodes.OK).json("Product Images Deleted");
        }
        else {
            res.status(StatusCodes.BAD_REQUEST).json("User Not Found");
        }
    }
    catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json();
    }
}