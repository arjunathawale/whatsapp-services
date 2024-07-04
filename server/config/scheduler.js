var scheduler = require('node-schedule');
const bulkSenderDetails = require('../models/bulkSenderDetails');
const webHookResponses = require('../models/webHookResponses');

exports.schedulerJob = () => {
    try {
        console.log("scheduler started");
        var j = scheduler.scheduleJob("*/30 * * * * *", updateStatus);
    } catch (error) {
        console.log(error);
    }
}

function getUtcTime(unixTimestamp) {
    return new Date(unixTimestamp * 1000).toISOString()
}


async function updateStatus() {
    try {
        const webhookData = await webHookResponses.aggregate([
            {
                $match: {
                    statusType: { $in: ['MESSAGE_STATUS', 'TEMPLATE_STATUS'] },
                    $or: [
                        { isProcessed: false },
                    ]
                }
            },
            {
                $addFields: {
                    sortType: {
                        $cond: {
                            if: { $eq: ['$statusType', 'MESSAGE_STATUS'] },
                            then: 1,
                            else: 2
                        }
                    },
                    sortStatus: {
                        $switch: {
                            branches: [
                                { case: { $eq: ['$messageStatus', 'failed'] }, then: 1 },
                                { case: { $eq: ['$messageStatus', 'sent'] }, then: 2 },
                                { case: { $eq: ['$messageStatus', 'delivered'] }, then: 3 },
                                { case: { $eq: ['$messageStatus', 'read'] }, then: 4 }
                            ],
                            default: 5
                        }
                    }
                }
            },
            {
                $sort: {
                    sortType: 1,
                    sortStatus: 1
                }
            },
            {
                $limit: 30
            }
        ]);
        // console.log("webhookData", webhookData);
        if (webhookData.length > 0) {
            console.log("webhookData", webhookData);
            webhookData.forEach(async (data) => {
                const findBulkDetails = await bulkSenderDetails.findOne({ wpMessageId: data.wpMessageId })
                if (!findBulkDetails) {
                    console.log("Bulk Details Not Found");
                    const updateWebhook = await webHookResponses.updateOne({ _id: data._id }, { $set: { isProcessed: true } })
                } else {
                    let updateObject = {}
                    let updateTrue = false
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
                        const updateWebhook = await webHookResponses.updateOne({ _id: data._id }, { $set: { isProcessed: true } })
                        console.log("Status Updated Successfully");
                    } else {
                        const updateWebhook = await webHookResponses.updateOne({ _id: data._id }, { $set: { isProcessed: true } })
                        console.log("Status Not Found");
                    }
                }
            });

        } else {
            console.log("No Data Found");
        }
    } catch (error) {
        console.log("Error in status update", error);
    }
}