import mongoose from "mongoose";
import { ERROR_MSG } from "../constants/message.js";
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: ERROR_MSG.REQUIRED("User's Name")
    },
    password : {
        type : String,
        required : [true , ERROR_MSG.REQUIRED("Password")]
    },
    type : {
        type : String,
        required : false
    }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model('User', userSchema);

export default User;