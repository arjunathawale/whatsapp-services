const { Worker } = require("bullmq");
const request = require('request');
const bulkSenderDetails = require('../../models/bulkSenderDetails');
const messageHistory = require('../../models/messageHistory');
const clientUserContacts = require("../../models/clientUserContacts");

exports.BulkWorker = async () => {
    console.log("Starting Worker...");
    const worker = new Worker('bulkMessages', async job => {
        console.log("Recieved Message Id: ", job?.id)
        await sendMessage(job?.data);
        console.log("Message Sent ....!")
    }, {
        connection: {
            host: '127.0.0.1',
            port: 6379,
        },
        removeOnComplete: {
            age: 360,
            count: 10
        },
        removeOnFail: {
            age: 360,
            count: 10
        }
    });
}

const sendMessage = async (data) => {
    try {
        let messageOptions = {
            url: `https://graph.facebook.com/${data.clientConfigDetails.wpApiVersion}/${data.clientConfigDetails.wpPhoneNoId}/messages`,
            method: 'POST',
            json: true,
            headers: {
                'Authorization': 'Bearer ' + data.clientConfigDetails.wpPermanentToken,
            },
            body: data.messageDetails
        };



        request(messageOptions, async (error, response, body) => {
            if (error) {
                console.log("Error in Request :-", error);
            } else {
                const message = data.messageHistory
                const findUser = await clientUserContacts.findOneAndUpdate(
                    { wpClientId: data.BulkDetailsInsert.wpClientId, mobileNo: data.BulkDetailsInsert.mobileNumber },
                    {
                        wpClientId: data.BulkDetailsInsert.wpClientId,
                        mobileNo: data.BulkDetailsInsert.mobileNumber,
                        name: "",
                        isSubscribed: 'subscribed'
                    },
                    { upsert: true }, { new: true }
                )

                if (response.statusCode == 200) {
                    message.wpMessageId = body.messages[0].id
                    message.messageStatus = "pending"
                    message.mobileNumber = data.BulkDetailsInsert.mobileNumber
                    message.templateName = data?.messageDetails?.template?.name
                    message.messageDateTime = new Date()
                    message.userId = findUser._id
                    const savedMessageData = await messageHistory.create(message);


                    let element = data.BulkDetailsInsert
                    element.wpMessageId = body.messages[0].id
                    element.messageStatus = "pending"
                    element.messageId = savedMessageData._id
                    const savedBulkDetailsData = await bulkSenderDetails.insertMany([element]);
                } else {
                    message.wpMessageId = null
                    message.messageStatus = "failed"
                    message.mobileNumber = data.BulkDetailsInsert.mobileNumber
                    message.templateName = data?.messageDetails?.template?.name
                    message.messageDateTime = new Date()
                    message.userId = findUser._id
                    const savedMessageData = await messageHistory.create(message);



                    let element = data.BulkDetailsInsert
                    element.wpMessageId = null
                    element.messageStatus = "failed"
                    const savedBulkDetailsData = await bulkSenderDetails.insertMany([element]);
                }
            }
        })
    } catch (error) {
        console.log("Error sending message : ", error);
    }
}