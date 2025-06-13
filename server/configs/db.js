import mongoose from 'mongoose'
import 'dotenv/config'

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("Database Connected Successfully");
        });

        mongoose.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err);
        });

        mongoose.connection.on("disconnected", () => {
            console.log("MongoDB disconnected");
        });

        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        await mongoose.connect(`${process.env.MONGODB_URI}/quickblog`, options);
    } catch (error) {
        console.error("Database connection error:", error.message);
        process.exit(1);
    }
}

export default connectDB;