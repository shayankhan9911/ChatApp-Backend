import amqp from 'amqplib'

let channel: amqp.Channel;
export const connectRabbitMQ = async () => {
    try {
        let hostname:any = '';
        let username:any = '';
        let password:any = '';
        hostname = process.env.Rabbitmq_Host;
        username = process.env.Rabbitmq_Username;
        password = process.env.Rabbitmq_Password;
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: hostname,
            port: 5672,
            username: username,
            password:password
        })
        channel = await connection.createChannel();
        console.log("Connected to RabbitMq");
    } catch (error:any) {
        console.log("failed to connect to rabbitMQ", error.message);
    }    
}
export const publishToQueue = async (queueName: string, message: any) => {
    if (!channel) {
        console.log("RabbitMq Channel is not initialized");
        return;
    }
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        persistent:true
    })
}


