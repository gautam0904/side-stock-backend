import mongoose from "mongoose";
import { ERROR_MSG } from "../constants/message.js";

const productsSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Product name")]
    },
    size: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Product Size")]
    },
    stock:{
        type: Number,
        required: [true, ERROR_MSG.REQUIRED("Product stock")]
    },
    rented:{
        type: Number,
        required: [true, ERROR_MSG.REQUIRED("Product rented")]
    },
    rate:{
        type: Number,
        required: [true, ERROR_MSG.REQUIRED("Product rate")]
    },
    loss:{
        type: Number,
        required: [true, ERROR_MSG.REQUIRED("Product loss")]
    },
    totalStock:{
        type: Number,
        required: [true, ERROR_MSG.REQUIRED("Product TOtal")]
    }
}, { timestamps: true });

const Products = mongoose.model("Products", productsSchema);

export default Products;
