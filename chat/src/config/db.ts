import mongoose from 'mongoose';
const connectDb = async () => {
    const url = process.env.MONGO_URI;
    if (!url) {
        throw new Error('MONGO_URI is not defined in .env variables');
    }
    try {
        await mongoose.connect(url, {
            dbName: "chatApp"
        });
        console.log("Connected to MongoDb");
    } catch (error: any) {
        console.error("Failed to connect to MongoDb ", error.message);
        process.exit(1);
    }
}
export default connectDb;