
const MessageHistory = require('../models/messageHistory');
const jwt = require('jsonwebtoken');
const mm = require("../services/global");
const { default: mongoose } = require('mongoose');
const template = require('../models/template');
const clientUserContacts = require('../models/clientUserContacts');

exports.get = async (req, res) => {
    const { isAdmin, mobileNumber, templateName, wpClientId, messageStatus, templateId, wpMessageId, sender, messageType, planId, botId, fromDate, toDate, id } = req.body
    const filterObject = {}
    if (wpClientId) filterObject.wpClientId = new mongoose.Types.ObjectId(wpClientId)
    if (templateId) filterObject.templateId = new mongoose.Types.ObjectId(templateId)
    if (planId) filterObject.planId = new mongoose.Types.ObjectId(planId)
    if (botId) filterObject.botId = new mongoose.Types.ObjectId(botId)
    if (isAdmin) filterObject.isAdmin = isAdmin
    if (id) filterObject._id = id



    let orConditions = [];
    if (sender) orConditions.push({ sender: { $regex: sender, $options: 'i' } });
    if (messageType) orConditions.push({ messageType: { $regex: messageType, $options: 'i' } });
    if (mobileNumber) orConditions.push({ mobileNumber: { $regex: mobileNumber, $options: 'i' } });
    if (messageStatus) orConditions.push({ messageStatus: { $regex: messageStatus, $options: 'i' } });
    if (wpMessageId) orConditions.push({ wpMessageId: { $regex: wpMessageId, $options: 'i' } });
    if (templateName) orConditions.push({ templateName: { $regex: templateName, $options: 'i' } });
    if (orConditions.length > 0) {
        filterObject.$or = orConditions;
    }

    // if (templateName) {
    //     filterObject['template.templateName'] = { $regex: templateName, $options: 'i' }; // Case-insensitive search
    // }

    if (fromDate && toDate) {
        filterObject.messageDateTime = {
            $gte: fromDate,
            $lte: toDate
        }
    }

    let page = Number(req.body.page) || 1
    let limit = Number(req.body.limit) || 10

    try {
        const getMessageHistoryCount = await MessageHistory.countDocuments(filterObject)

        const getMessageHistory = await MessageHistory.find(filterObject)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        res.status(200).send({ status: true, message: "success", count: getMessageHistoryCount, data: getMessageHistory });
    } catch (err) {
        console.log(err);
        res.status(400).send({ status: false, message: "Failed to get Info", error: err });
    }
}

exports.create = async (req, res) => {
    const MessageHistory = new MessageHistory({
        name: req.body.name,
        emailId: req.body.emailId,
        mobileNo: req.body.mobileNo,
        password: req.body.password
    });

    try {
        const savedMessageHistory = await MessageHistory.save();
        if (!savedMessageHistory) {
            res.status(400).send({ status: false, message: "Failed to Create" });
        } else {
            res.status(200).send({ insertId: savedMessageHistory._id, status: true, message: "MessageHistory created", data: savedMessageHistory });
        }
    } catch (err) {
        console.log(err);
        if (err.code == 11000) {
            res.status(400).send({ status: false, message: `${Object.entries(err.keyValue)[0][0]} already exists` });
        } else {
            res.status(400).send({ status: false, message: "Failed to save info", error: err });
        }
    }
}

exports.update = async (req, res) => {
    const id = req.query.id
    try {
        if (id == null || id == "" || id == undefined) {
            res.status(400).send({ status: false, message: "Please enter MessageHistory id to update" });
        } else {
            const MessageHistory = await MessageHistory.findOne({ _id: id, isActive: true });
            if (!MessageHistory) {
                res.status(404).send({ status: false, message: "MessageHistory Not Found" });
            } else {
                const updatedMessageHistory = await MessageHistory.findByIdAndUpdate(id, { ...req.body, updatedAt: mm.getCurrentDate() }, { new: true });
                if (!updatedMessageHistory) {
                    res.status(400).send({ status: false, message: "Failed to update" });
                } else {
                    res.status(200).send({ status: true, message: "MessageHistory updated", data: updatedMessageHistory });
                }
            }
        }
    } catch (err) {
        if (err.code == 11000) {
            res.status(400).send({ status: false, message: `${Object.entries(err.keyValue)[0][0]} already exists` });
        } else {
            res.status(400).send({ status: false, message: "Failed to update", error: err.errors });
        }
    }
}

exports.delete = async (req, res) => {
    const id = req.query.id
    try {
        if (!id) {
            res.status(400).send({ status: false, message: "Please enter MessageHistory id to update" });
        } else {
            const MessageHistory = await MessageHistory.findOne({ _id: id, isActive: true });
            if (!MessageHistory) {
                res.status(400).send({ status: false, message: "MessageHistory Not Found" });
            } else {
                const deletedMessageHistory = await MessageHistory.findByIdAndDelete(id)
                if (!deletedMessageHistory) {
                    res.status(400).send({ status: false, message: "Failed to Delete" });
                } else {
                    res.status(200).send({ status: true, message: "MessageHistory Deleted", data: deletedMessageHistory });
                }
            }
        }
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to Delete", data: err });
    }

}


exports.getMessageStats = async (req, res) => {
    const { wpClientId } = req.body
    const filterObject = {}
    if (wpClientId) filterObject.wpClientId = new mongoose.Types.ObjectId(wpClientId)

    // if (fromDate && toDate) {
    //     filterObject.messageDateTime = {
    //         $gte: fromDate,
    //         $lte: toDate
    //     }
    // }
    try {

        const getMessageHistory = await MessageHistory.aggregate([
            {
                $match: filterObject
            },
            {
                $facet: {
                    totalMessages: [{ $count: "count" }],
                    bulkMessages: [
                        {
                            $match: {
                                messageType: {
                                    $in: [
                                        "UTILITY",
                                        "MARKETING",
                                        "AUTHENTICATION"
                                    ]
                                }
                            }
                        },
                        { $count: "count" }
                    ],
                    chatbotMessages: [
                        {
                            $match: {
                                messageType: { $in: ["SERVICE"] }
                            }
                        },
                        { $count: "count" }
                    ],
                    pendingMessages: [
                        { $match: { messageStatus: "pending" } },
                        { $count: "count" }
                    ],
                    sentMessages: [
                        { $match: { messageStatus: "sent" } },
                        { $count: "count" }
                    ],
                    deliveredMessages: [
                        {
                            $match: { messageStatus: "delivered" }
                        },
                        { $count: "count" }
                    ],
                    readMessages: [
                        { $match: { messageStatus: "read" } },
                        { $count: "count" }
                    ],
                    failedMessages: [
                        { $match: { messageStatus: "failed" } },
                        { $count: "count" }
                    ],
                    receivedMessages: [
                        { $match: { messageStatus: "received" } },
                        { $count: "count" }
                    ]
                }
            },
            {
                $project: {
                    totalMessages: {
                        $arrayElemAt: ["$totalMessages.count", 0]
                    },
                    bulkMessages: {
                        $arrayElemAt: ["$bulkMessages.count", 0]
                    },
                    chatbotMessages: {
                        $arrayElemAt: [
                            "$chatbotMessages.count",
                            0
                        ]
                    },
                    pendingMessages: {
                        $arrayElemAt: [
                            "$pendingMessages.count",
                            0
                        ]
                    },
                    sentMessages: {
                        $arrayElemAt: ["$sentMessages.count", 0]
                    },
                    deliveredMessages: {
                        $arrayElemAt: [
                            "$deliveredMessages.count",
                            0
                        ]
                    },
                    readMessages: {
                        $arrayElemAt: ["$readMessages.count", 0]
                    },
                    failedMessages: {
                        $arrayElemAt: ["$failedMessages.count", 0]
                    },
                    receivedMessages: {
                        $arrayElemAt: [
                            "$receivedMessages.count",
                            0
                        ]
                    }
                }
            }

        ])
        const countTemplate = await template.countDocuments({ wpClientId: wpClientId })
        const countUsers = await clientUserContacts.countDocuments({ wpClientId: wpClientId })

        const allCombined = [
            {
                ...getMessageHistory[0],
                templateCount: countTemplate,
                userCount: countUsers
            }
        ]
        res.status(200).send({ status: true, message: "success", data: allCombined });
    } catch (err) {
        console.log(err);
        res.status(400).send({ status: false, message: "Failed to get Info", error: err });
    }
}



exports.getMonthMessageStats = async (req, res) => {
    const { wpClientId } = req.body;
    const filterObject = {};

    if (wpClientId) filterObject.wpClientId = new mongoose.Types.ObjectId(wpClientId);

    const monthDates = [];
    let date = new Date()
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let start = date.getDate();
    for (let i = start-10; i <= start; i++) {
        const day = i.toString().padStart(2, '0');
        monthDates.push(`${year}-${month.toString().padStart(2, '0')}-${day}`);
    }

    try {
        const getMonthMessageStats = await MessageHistory.aggregate([
            {
                $match: {
                    ...filterObject,
                    messageDateTime: {
                        $gte: new Date("2024-08-01T00:00:00.000Z"),
                        $lt: new Date("2024-09-01T00:00:00.000Z")
                    }
                }
            },
            {
                $addFields: {
                    date: {
                        $dateToString: { format: "%Y-%m-%d", date: "$messageDateTime" }
                    }
                }
            },
            {
                $group: {
                    _id: "$date",
                    totalMessages: { $sum: 1 },
                    marketingMessages: { $sum: { $cond: [{ $eq: ["$messageType", "MARKETING"] }, 1, 0] } },
                    utilityMessages: { $sum: { $cond: [{ $eq: ["$messageType", "UTILITY"] }, 1, 0] } },
                    authenticationMessages: { $sum: { $cond: [{ $eq: ["$messageType", "AUTHENTICATION"] }, 1, 0] } },
                    serviceMessage: { $sum: { $cond: [{ $eq: ["$messageType", "SERVICE"] }, 1, 0] } },
                }
            }
        ]);

        // Create a complete list of dates with zero counts
        const result = monthDates.map(date => {
            const stats = getMonthMessageStats.find(stat => stat._id === date);
            return {
                _id: date,
                totalMessages: stats ? stats.totalMessages : 0,
                marketingMessages: stats ? stats.marketingMessages : 0,
                utilityMessages: stats ? stats.utilityMessages : 0,
                authenticationMessages: stats ? stats.authenticationMessages : 0,
                serviceMessage: stats ? stats.serviceMessage : 0,
            };
        });

        res.status(200).send({ status: true, message: "success", data: result });
    } catch (err) {
        console.log(err);
        res.status(400).send({ status: false, message: "Failed to get Info", error: err });
    }
};
