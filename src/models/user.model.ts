import mongoose from "mongoose";
import { errMSG } from "../constants/message";
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: errMSG.required("User's Name")
    },
    email : {
        type : String,
        required : [true ,"email is required"]
    },
    password : {
        type : String,
        required : [true , "Password is required"]
    },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model('User', userSchema);

export default User;