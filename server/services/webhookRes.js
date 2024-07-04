const webHookResponses = require('../models/webHookResponses');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const mm = require("../services/global")
const moment = require("moment");
const { default: mongoose } = require('mongoose');
const { addToStatusQueue } = require('./Queues/WebhookStatusProducer');


exports.handleWebhookRequests = async (req, res) => {
    let data = req.body
    try {
        if (data.object) {
            if (data.entry && data.entry[0].changes && data.entry[0].changes[0].value.messages && data.entry[0].changes[0].value.messages[0]) {
                const queueData = {
                    "type": "BOT_MESSAGE",
                    "wpMessageId": statusData.id,
                    "messageStatus": statusData.status,
                    "specifiedRes": statusData,
                    "allRes": data
                }
                // mm.executeQueryData(`INSERT INTO message_status_queues (WEBHOOK_TYPE, WP_MSG_ID, MESSAGE_STATUS, WEBHOOK_RES, DATE_TIME,IS_PROCESSED, CLIENT_ID,ALL_WEBHOOK_RES) VALUES (?,?,?,?,?,?,?,?);`, ["BOT_MESSAGE", null, null, JSON.stringify(data), mm.getSystemDate(), 0, 1, JSON.stringify(data)], supportKey, (error, results1) => {
                //     if (error) {
                //         console.log("Failed to get bulkSenderDetails ", error);
                //         res.sendStatus(404);
                //     } else {
                //         res.sendStatus(200);
                //     }
                // })

            } else if (data.entry[0].changes[0].value.statuses) {
                let statusData = data.entry[0].changes[0].value.statuses[0]
                const queueData = {
                    "type": "MESSAGE_STATUS",
                    "wpMessageId": statusData.id,
                    "messageStatus": statusData.status,
                    "specifiedRes": statusData,
                    "allRes": data
                }
                let priority = 1
                if (statusData.status === 'failed') priority = 1
                else if (statusData.status === 'sent') priority = 2
                else if (statusData.status === 'delivered') priority = 3
                else if (statusData.status === 'read') priority = 4
                else priority = 5
                addToStatusQueue(`${statusData.id}-${statusData.status}`, queueData, priority)
                res.sendStatus(200);
            } else if (data.entry[0].changes[0].field != "messages") {
                const queueData = {
                    "type": "TEMPLATE_STATUS",
                    "wpMessageId": statusData.id,
                    "messageStatus": statusData.status,
                    "specifiedRes": data.entry[0].changes[0],
                    "allRes": data
                }
                mm.executeQueryData(`INSERT INTO message_status_queues (WEBHOOK_TYPE, WP_MSG_ID, MESSAGE_STATUS, WEBHOOK_RES, DATE_TIME,IS_PROCESSED, CLIENT_ID,ALL_WEBHOOK_RES) VALUES (?,?,?,?,?,?,?,?);`, ["TEMPLATE_STATUS", null, null, JSON.stringify(data.entry[0].changes[0]), mm.getSystemDate(), 0, 1, JSON.stringify(data)], supportKey, (error, results1) => {
                    if (error) {
                        console.log("Failed to get bulkSenderDetails ", error);
                        res.sendStatus(404);
                    } else {
                        res.sendStatus(200);
                    }
                })
            } else {
                console.log("WebHook Data Not Received");
            }
        } else {
            res.sendStatus(404);
        }
    } catch (err) {
        console.log(err);
        res.sendStatus(404);
    }
}


exports.VerifyWebhook = (req, res) => {
    try {
        let mode = req.query["hub.mode"]
        let challenge = req.query["hub.challenge"]
        let token = req.query["hub.verify_token"]
        if (mode && token) {

            if (mode === "subscribe" && token === "arjun") {
                res.status(200).send(challenge);
            } else {
                res.status(403).send("Token Wrong");
            }

        } else {
            res.status(403).send("Token not provided");
        }
    } catch (error) {
        console.log(error);
        res.status(403).send("Something went wrong");
    }
}
// handle webhook request like (status, user reply message)
exports.handleRequests = (req, res) => {
    var data = req.body
    try {
        if (data.object) {
            if (data.entry && data.entry[0].changes && data.entry[0].changes[0].value.messages && data.entry[0].changes[0].value.messages[0]) {
                mm.executeQueryData(`INSERT INTO message_status_queues (WEBHOOK_TYPE, WP_MSG_ID, MESSAGE_STATUS, WEBHOOK_RES, DATE_TIME,IS_PROCESSED, CLIENT_ID,ALL_WEBHOOK_RES) VALUES (?,?,?,?,?,?,?,?);`, ["BOT_MESSAGE", null, null, JSON.stringify(data), mm.getSystemDate(), 0, 1, JSON.stringify(data)], supportKey, (error, results1) => {
                    if (error) {
                        console.log("Failed to get bulkSenderDetails ", error);
                        res.sendStatus(404);
                    } else {
                        res.sendStatus(200);
                    }
                })

            } else if (data.entry[0].changes[0].value.statuses) {
                let statusData = data.entry[0].changes[0].value.statuses
                async.eachSeries(statusData, function iteratorOverElems(item, callback) {
                    mm.executeQueryData(`INSERT INTO message_status_queues (WEBHOOK_TYPE, WP_MSG_ID, MESSAGE_STATUS, WEBHOOK_RES, DATE_TIME,IS_PROCESSED, CLIENT_ID,ALL_WEBHOOK_RES) VALUES (?,?,?,?,?,?,?,?);`, ["MESSAGE_STATUS", item.id, item.status, JSON.stringify(item), mm.getSystemDate(), 0, 1, JSON.stringify(data)], supportKey, (error, results1) => {
                        if (error) {
                            console.log("Failed to get bulkSenderDetails ", error);
                            callback(error)
                        } else {
                            callback()

                        }
                    })
                }, function subCb(error) {
                    if (error) {
                        res.sendStatus(404);
                    } else {
                        res.sendStatus(200);
                    }
                });
            } else if (data.entry[0].changes[0].field != "messages") {
                mm.executeQueryData(`INSERT INTO message_status_queues (WEBHOOK_TYPE, WP_MSG_ID, MESSAGE_STATUS, WEBHOOK_RES, DATE_TIME,IS_PROCESSED, CLIENT_ID,ALL_WEBHOOK_RES) VALUES (?,?,?,?,?,?,?,?);`, ["TEMPLATE_STATUS", null, null, JSON.stringify(data.entry[0].changes[0]), mm.getSystemDate(), 0, 1, JSON.stringify(data)], supportKey, (error, results1) => {
                    if (error) {
                        console.log("Failed to get bulkSenderDetails ", error);
                        res.sendStatus(404);
                    } else {
                        res.sendStatus(200);
                    }
                })
            } else {
                console.log("WebHook Data Not Received");
            }
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(404);
    }
}
