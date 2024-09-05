import mongoose from "mongoose";
import { ENV_VARS } from "./envVars.js";

export const connectDB= async ()=>{
    try {
        const conn = await mongoose.connect(ENV_VARS.MONGO_URI);
        console.log("MongoDb is connected"+conn.connection.host)
    } catch (error) {
        console.log("error conntecting to mongodb"+ error.message)
        process.exit(1)
    }
}