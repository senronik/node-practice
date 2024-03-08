import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    created_date: {
        type: Date,
        required: true,
        default: Date.now
    },
    updatedDate: {
        type: Date
    },
    userId: {

        type: mongoose.Schema.Types.ObjectId,
        ref: 'registersModel',
    }

})
export const productsModel = mongoose.model("productsModel", productSchema);
