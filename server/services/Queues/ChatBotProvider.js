const { Queue } = require("bullmq")

const statusQueues = new Queue('chatBotQueue', {
    connection: {
        host: '127.0.0.1',
        port: 6379
    }
});

exports.addToChatBotQueue = async (queueName, data) => {
    try {
        const res = await statusQueues.add(queueName, data);
        console.log("Webhook Chatbot Added to queue : ", res.id);
    } catch (error) {
        console.log("Error adding to queue : ", error);
    }
}
