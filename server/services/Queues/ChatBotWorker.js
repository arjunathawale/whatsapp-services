const { Worker } = require("bullmq");
const { handleMessageSend } = require("../webhookRes");

exports.chatBotWorker = async () => {
    console.log("Starting Worker...");
    const worker = new Worker('chatBotQueue', async job => {
        console.log("Recieved Chatbot Job Id: ", job?.id)
        handleMessageSend(job?.data)
    }, {
        connection: {
            host: '127.0.0.1',
            port: 6379,
        },
        removeOnComplete: {
            age: 3600,
            count: 1000
        },
        removeOnFail: {
            age: 3600,
            count: 1000
        },
       limiter: {
           max: 100,
           duration: 5000
       }
    });
}


