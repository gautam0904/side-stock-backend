import mongoose from "mongoose";
import { ERROR_MSG } from "../constants/message.js";

const siteSchema = new mongoose.Schema({
    siteName: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Site name")]
    },
    siteAddress: {
        type: String,
        required: [true, ERROR_MSG.REQUIRED("Site address")]
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: false
    },
    customerGSTId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CustomerGST",
        required: false
    }
}, { timestamps: true });

const Site = mongoose.model("Site", siteSchema);

export default Site;
