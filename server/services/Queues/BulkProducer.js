const { Queue } = require("bullmq");
const { connection } = require("./connection");

const BulkQueue = new Queue('bulkMessages', {
    connection: connection
});

exports.addToQueue = async (queueName, data) => {
    try {
        const res = await BulkQueue.addBulk(data)
    } catch (error) {
        console.log("Error adding to queue : ", error);
    }

}
