import mongoose from "mongoose";
const imageSchema = new mongoose.Schema({
    image: {
      type: String,
      required: true
    },
    productId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'productModel',
      
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"registersModel"
    }
  });
  export const ProductsimgModel = mongoose.model("ProductsimgModel",imageSchema)