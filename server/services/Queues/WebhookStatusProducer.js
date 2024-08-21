const { Queue } = require("bullmq");
const { connection } = require("./connection");

const statusQueues = new Queue('messageOrTemplateStatus', {
    connection: connection
});

exports.addToStatusQueue = async (queueName, data, priority) => {
    try {
        const res = await statusQueues.add(queueName, data, {
            priority: priority,
            delay: 5000
        });
        console.log("Webhook Status added to queue : ", res.id);
    } catch (error) {
        console.log("Error adding to queue : ", error);
    }
}
