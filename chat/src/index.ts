import express from 'express';
import dotenv from 'dotenv'
import connectDb from './config/db.js';
import chatRoutes from './routes/chat.js'
const app = express();
dotenv.config();

const PORT = process.env.PORT as string;
connectDb();
app.use(express.json());
app.use('/api/v1', chatRoutes);
app.listen(PORT, () => {
    console.log(`Server Started port ${PORT}`)
})