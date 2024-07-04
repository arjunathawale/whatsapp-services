const { Worker } = require("bullmq");
const request = require('request');
const bulkSenderDetails = require('../../models/bulkSenderDetails');
const webHookResponses = require('../../models/webHookResponses');
const messageHistory = require('../../models/messageHistory');
const Template = require('../../models/template');

exports.statusWorker = async () => {
    console.log("Starting Worker...");
    const worker = new Worker('messageOrTemplateStatus', async job => {
        console.log("Recieved Stutus Job Id: ", job?.id)
        updateStatus(job?.data);
        console.log("Recieved Stutus Done ....!")
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
        // drainDelay: 5000
       limiter: {
           max: 10,
           duration: 5000
       }
    });
}


function getUtcTime(unixTimestamp) {
    return new Date(unixTimestamp * 1000).toISOString()
}

const updateStatus = async (data) => {

    try {
        if (data.type === 'MESSAGE_STATUS') {
            let updateObject = {}
            let updateTrue = false
            const findBulkDetails = await bulkSenderDetails.findOne({ wpMessageId: data.wpMessageId })
            if (!findBulkDetails) {
                const findMessageHistory = await messageHistory.findOne({ wpMessageId: data.wpMessageId })
                if (!findMessageHistory) {
                    console.log("Message History Not Found");
                } else {
                    if (data.messageStatus === "sent") {
                        if (findMessageHistory?.messageStatus === 'pending') {
                            updateTrue = true;
                            updateObject = {
                                sentDateTime: getUtcTime(data?.specifiedRes?.timestamp),
                                messageStatus: "sent"
                            }
                        } else {
                            updateTrue = false
                        }
                    } else if (data.messageStatus === "delivered") {
                        if (findMessageHistory?.messageStatus === 'sent') {
                            updateTrue = true;
                            updateObject = {
                                deliveredDateTime: getUtcTime(data?.specifiedRes?.timestamp),
                                messageStatus: "delivered"
                            }
                        } else {
                            updateTrue = false;
                        }
                    } else if (data.messageStatus === "read") {
                        if (findMessageHistory?.messageStatus === 'delivered') {
                            updateTrue = true;
                            updateObject = {
                                seenDateTime: getUtcTime(data?.specifiedRes?.timestamp),
                                messageStatus: "read"
                            }
                        } else if (findMessageHistory?.messageStatus === 'sent') {
                            updateTrue = true;
                            updateObject = {
                                seenDateTime: getUtcTime(data?.specifiedRes?.timestamp),
                                deliveredDateTime: getUtcTime(data?.specifiedRes?.timestamp),
                                messageStatus: "read"
                            }
                        } else {
                            updateTrue = false;

                        }
                    } else if (data.messageStatus == "failed") {
                        if (findMessageHistory?.messageStatus === 'sent' || findMessageHistory?.messageStatus === 'pending') {
                            updateTrue = true;
                            updateObject = {
                                messageStatus: "failed"
                            }
                        } else {
                            updateTrue = false;
                        }
                    } else {
                        console.log("Status is not matched");
                    }



                    if (updateTrue) {
                        const filter = { wpMessageId: data?.wpMessageId }
                        const updateData = {
                            $set: updateObject
                        }
                        const updateBulkDetails = await messageHistory.updateOne(filter, updateData)
                        const saveStatusData = await webHookResponses.create({
                            statusType: "MESSAGE_STATUS",
                            wpMessageId: data?.wpMessageId,
                            messageStatus: data?.messageStatus,
                            specifiedRes: data.specifiedRes,
                            allRes: data.allRes,
                            isProcessed: true
                        })

                    } else {
                        const saveStatusData = await webHookResponses.create({
                            statusType: "MESSAGE_STATUS",
                            wpMessageId: data?.wpMessageId,
                            messageStatus: data?.messageStatus,
                            specifiedRes: data.specifiedRes,
                            allRes: data.allRes,
                            isProcessed: true

                        })
                    }


                }
            } else {
                if (data.messageStatus === "sent") {
                    if (findBulkDetails?.messageStatus === 'pending') {
                        updateTrue = true;
                        updateObject = {
                            sentDateTime: getUtcTime(data?.specifiedRes?.timestamp),
                            messageStatus: "sent"
                        }
                    } else {
                        updateTrue = false
                    }
                } else if (data.messageStatus === "delivered") {
                    if (findBulkDetails?.messageStatus === 'sent') {
                        updateTrue = true;
                        updateObject = {
                            deliveredDateTime: getUtcTime(data?.specifiedRes?.timestamp),
                            messageStatus: "delivered"
                        }
                    } else {
                        updateTrue = false;
                    }
                } else if (data.messageStatus === "read") {
                    if (findBulkDetails?.messageStatus === 'delivered') {
                        updateTrue = true;
                        updateObject = {
                            seenDateTime: getUtcTime(data?.specifiedRes?.timestamp),
                            messageStatus: "read"
                        }
                    } else if (findBulkDetails?.messageStatus === 'sent') {
                        updateTrue = true;
                        updateObject = {
                            seenDateTime: getUtcTime(data?.specifiedRes?.timestamp),
                            deliveredDateTime: getUtcTime(data?.specifiedRes?.timestamp),
                            messageStatus: "read"
                        }
                    } else {
                        updateTrue = false;

                    }
                } else if (data.messageStatus == "failed") {
                    if (findBulkDetails?.messageStatus === 'sent' || findBulkDetails?.messageStatus === 'pending') {
                        updateTrue = true;
                        updateObject = {
                            messageStatus: "failed"
                        }
                    } else {
                        updateTrue = false;
                    }
                } else {
                    console.log("Status is not matched");
                }

                if (updateTrue) {
                    const filter = { wpMessageId: data?.wpMessageId }
                    const updateData = {
                        $set: updateObject
                    }
                    const updateBulkDetails = await bulkSenderDetails.updateOne(filter, updateData)
                    const saveStatusData = await webHookResponses.create({
                        statusType: "MESSAGE_STATUS",
                        wpMessageId: data?.wpMessageId,
                        messageStatus: data?.messageStatus,
                        specifiedRes: data.specifiedRes,
                        allRes: data.allRes,
                        isProcessed: true
                    })

                    const findMessageHistory = await messageHistory.findOne({ wpMessageId: data.wpMessageId })
                    if (!findMessageHistory) {
                        console.log("Message History Not Found");
                    } else {
                        if (data.messageStatus === "sent") {
                            if (findMessageHistory?.messageStatus === 'pending') {
                                updateTrue = true;
                                updateObject = {
                                    sentDateTime: getUtcTime(data?.specifiedRes?.timestamp),
                                    messageStatus: "sent"
                                }
                            } else {
                                updateTrue = false
                            }
                        } else if (data.messageStatus === "delivered") {
                            if (findMessageHistory?.messageStatus === 'sent') {
                                updateTrue = true;
                                updateObject = {
                                    deliveredDateTime: getUtcTime(data?.specifiedRes?.timestamp),
                                    messageStatus: "delivered"
                                }
                            } else {
                                updateTrue = false;
                            }
                        } else if (data.messageStatus === "read") {
                            if (findMessageHistory?.messageStatus === 'delivered') {
                                updateTrue = true;
                                updateObject = {
                                    seenDateTime: getUtcTime(data?.specifiedRes?.timestamp),
                                    messageStatus: "read"
                                }
                            } else if (findMessageHistory?.messageStatus === 'sent') {
                                updateTrue = true;
                                updateObject = {
                                    seenDateTime: getUtcTime(data?.specifiedRes?.timestamp),
                                    deliveredDateTime: getUtcTime(data?.specifiedRes?.timestamp),
                                    messageStatus: "read"
                                }
                            } else {
                                updateTrue = false;

                            }
                        } else if (data.messageStatus == "failed") {
                            if (findMessageHistory?.messageStatus === 'sent' || findMessageHistory?.messageStatus === 'pending') {
                                updateTrue = true;
                                updateObject = {
                                    messageStatus: "failed"
                                }
                            } else {
                                updateTrue = false;
                            }
                        } else {
                            console.log("Status is not matched");
                        }



                        if (updateTrue) {
                            const filter = { wpMessageId: data?.wpMessageId }
                            const updateData = {
                                $set: updateObject
                            }
                            const updateBulkDetails = await messageHistory.updateOne(filter, updateData)
                            const saveStatusData = await webHookResponses.create({
                                statusType: "MESSAGE_STATUS",
                                wpMessageId: data?.wpMessageId,
                                messageStatus: data?.messageStatus,
                                specifiedRes: data.specifiedRes,
                                allRes: data.allRes,
                                isProcessed: true
                            })

                        } else {
                            const saveStatusData = await webHookResponses.create({
                                statusType: "MESSAGE_STATUS",
                                wpMessageId: data?.wpMessageId,
                                messageStatus: data?.messageStatus,
                                specifiedRes: data.specifiedRes,
                                allRes: data.allRes,
                                isProcessed: true

                            })
                        }


                    }

                } else {
                    const saveStatusData = await webHookResponses.create({
                        statusType: "MESSAGE_STATUS",
                        wpMessageId: data?.wpMessageId,
                        messageStatus: data?.messageStatus,
                        specifiedRes: data.specifiedRes,
                        allRes: data.allRes,
                        isProcessed: true

                    })
                }
            }
        } else if (data.type === 'TEMPLATE_STATUS') {
            switch (data?.specifiedRes?.field) {
                case "message_template_status_update":
                    const updateTemplate = await Template.findByIdAndUpdate({ fbTemplateId: data?.specifiedRes?.value.message_template_id }, { $set: { "fbTemplateStatus": data?.specifiedRes?.value.event } }, { new: true });
                    if (updateTemplate) {
                        console.log('Template updated successfully:', updateTemplate);
                    } else {
                        console.log('Template not found');
                    }
                    break;
                case "template_category_update":
                    const updateCategory = await Template.findByIdAndUpdate({ fbTemplateId: data?.specifiedRes?.value.message_template_id }, { $set: { "templateCategory": data?.specifiedRes?.value.event } }, { new: true });
                    if (updateCategory) {
                        console.log('Template updated successfully:', updateCategory);
                    } else {
                        console.log('Template not found');
                    }
                    break;
                default:
                    break;
            }
        } else {
            console.log("Status type is not matched");
        }
    } catch (error) {
        console.log("Error sending message : ", error);
    }
}