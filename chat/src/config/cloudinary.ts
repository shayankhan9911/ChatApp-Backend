import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv';
dotenv.config();
const { CLOUD_NAME, API_SECRET, API_KEY } = process.env;
if (!CLOUD_NAME || !API_SECRET || !API_KEY) {
    throw Error("Missing cloudinary env variables");
}
cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret:API_SECRET
})
export default cloudinary