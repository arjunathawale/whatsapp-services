const { Queue } = require("bullmq");
const { connection } = require("./connection");

const statusQueues = new Queue('chatBotQueue', {
    connection: connection
});

exports.addToChatBotQueue = async (queueName, data) => {
    try {
        const res = await statusQueues.add(queueName, data);
        console.log("Webhook Chatbot Added to queue : ", res.id);
    } catch (error) {
        console.log("Error adding to queue : ", error);
    }
}
