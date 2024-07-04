const { Queue } = require("bullmq")

const BulkQueue = new Queue('bulkMessages', {
    connection: {
        host: '127.0.0.1',
        port: 6379
    }
});

exports.addToQueue = async (queueName, data) => {
    try {
        const res = await BulkQueue.addBulk(data)


        // const res = await BulkQueue.add(queueName, data, {
        //     removeOnComplete: {
        //         age: 60
        //     },
        //     removeOnFail: {
        //         age: 60
        //     }
        // });
        // console.log("Message added to queue : ", res);
    } catch (error) {
        console.log("Error adding to queue : ", error);
    }

}
