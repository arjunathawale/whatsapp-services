const { Queue } = require("bullmq")

const statusQueues = new Queue('messageOrTemplateStatus', {
    connection: {
        host: '127.0.0.1',
        port: 6379
    }
});

exports.addToStatusQueue = async (queueName, data, priority) => {
    try {
        const res = await statusQueues.add(queueName, data, {
            priority: priority,
        });
        console.log("Webhook Status added to queue : ", res.id);
    } catch (error) {
        console.log("Error adding to queue : ", error);
    }
}
