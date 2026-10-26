import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import { generateToken } from "../config/generateToken.js";
import { User, type IUser } from "../model/User.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import type {Response} from 'express'
export const loginUser = TryCatch(async (req, res) => {
    const { email } = req.body;
    const rateLimitKey = `otp:ratelimit:${email}`;
    const rateLimit = await redisClient.get(rateLimitKey);
    if (rateLimit) {
        return res.status(429).json({
            message:"Too many requests please wait before requesting new otp"
        })
    }
    const otp = Math.floor(Math.random() * 1e6).toString().padStart(0,'6');
    const otpKey = `otp:${email}`;
    await redisClient.set(otpKey, otp, {
        EX: 300
    })
    await redisClient.set(rateLimitKey, 'true', {
        EX:60
    })
    const message = {
        to: email,
        subject: "Your otp code",
        body: `Your otp is ${otp} , it is valid for 5 minutes`
    };
    await publishToQueue("send-otp", message);
    return res.status(200).json({
        message:"OTP send to your mail"
    })

})
export const verifyUser = TryCatch(async (req, res) => {
    const { email, otp: enteredOtp }= req.body;
    if (!email || !enteredOtp) {
        return res.status(400).json({
            message:"Email and OTP required"
        })
    }
    const otpKey = `otp:${email}`;
    const storedOtp = await redisClient.get(otpKey);
    if (!storedOtp || storedOtp !== enteredOtp) {
       return res.status(400).json({
            message:"Invalid or expired otp"
        })
    }
    await redisClient.del(otpKey);
    let user = await User.findOne({ email });
    if (!user) {
        const name = email.slice(0, 8);
        user = await User.create({
            name,email
        })
    }
    const token = generateToken(user);
    return res.json({
        message:"User verified",
        user,
        token
    })
})

export const myProfile = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const user = req.user;

        if (!user) {
            res.status(401).json({
                message: "Please login"
            });
            return;
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
export const UpdateName = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const user = await User.findById(req.user?._id);
    if (!user) {
    res.status(400).json({
            message:"Please Login"
    })
        return;
    }
    user.name = req.body.name;
    await user.save();
    const token = generateToken(user);
    res.json({
        message: "User Updated",
        user,
        token
    })
})
export const getAllUsers = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    const users = await User.find();

    res.json(users);
})
export const getAUser = TryCatch(async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json(user);
    return;
})