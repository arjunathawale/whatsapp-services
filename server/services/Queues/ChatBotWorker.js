const { Worker } = require("bullmq");
const { handleMessageSend } = require("../webhookRes");
const { connection } = require("./connection");

exports.chatBotWorker = async () => {
    console.log("Starting Worker...");
    const worker = new Worker('chatBotQueue', async job => {
        console.log("Recieved Chatbot Job Id: ", job?.id)
        handleMessageSend(job?.data)
    }, {
        connection: connection,
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


