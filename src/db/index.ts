import mongoose from "mongoose";

export const connectDb = async () => {
    try {
        await mongoose.connect(`${process.env.DBURL}/${process.env.DBNAME}`);
        console.log('database is connected ');
    }
    catch (e: any) {
        console.log(e);
    }
}
