import amqp from 'amqplib';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();




export const startSentOtpConsumer = async () => {
    try {
        let hostname: any = '';
        let username: any = '';
        let password: any = '';
        hostname = process.env.Rabbitmq_Host;
        username = process.env.Rabbitmq_Username;
        password = process.env.Rabbitmq_Password;
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: hostname,
            port: 5672,
            username: username,
            password: password
        })
        const channel = await connection.createChannel();
        const queueName = "send-otp";
        await channel.assertQueue(queueName, { durable: true });
        console.log("Mail Service Consumer Started,listening for otp emails");
        channel.consume(queueName, async (msg) => {
            try {
                const temp:any = msg?.content .toString();
                const { to, subject, body } = JSON.parse(temp);
                const user: any = process.env.EMAIL_USER;
                const pass: any = process.env.PASSWORD;
                const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,
                    auth: {
                        user,
                        pass
                    }
                });
                await transporter.sendMail({
                    from: "ChatApp",
                    to,
                    subject,
                    text:body
                })
                console.log(`OTP mail sent to ${to}`);

            } catch (error:any) {
                console.log(`Failed to send OTP`, error.message);
            }
        })
    } catch (error: any) {
        console.log("Failed to start rabbitMq consumer", error.message);
    }
}