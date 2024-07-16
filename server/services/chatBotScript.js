
const { default: mongoose } = require('mongoose');
const chatBotScript = require('../models/chatBotScript');
const mm = require("./global")


exports.get = async (req, res) => {
    const { wpClientId, botId, variableName, messageType, messageSubType, redirectId,prevRedirectId, waitTime, validationType,mediaUrl, buttonOrListData,apiUrl, method, headerParams, bodyParams, sampleDataKey, sort, select, id } = req.body
    const filterObject = {}


    if (botId) filterObject.botId = { $regex: botId, $options: 'i' }
    if (variableName) filterObject.variableName = { $regex: variableName, $options: 'i' }
    if (messageType) filterObject.messageType = { $regex: messageType, $options: 'i' }
    if (messageSubType) filterObject.messageSubType = { $regex: messageSubType, $options: 'i' }
    if (waitTime) filterObject.waitTime = { $regex: waitTime, $options: 'i' }
    if (validationType) filterObject.validationType = { $regex: validationType, $options: 'i' }
    if (mediaUrl) filterObject.mediaUrl = { $regex: mediaUrl, $options: 'i' }
    if (apiUrl) filterObject.apiUrl = { $regex: apiUrl, $options: 'i' }
    if (method) filterObject.method = { $regex: method, $options: 'i' }
    if (wpClientId) filterObject.wpClientId = wpClientId
    if (redirectId) filterObject.redirectId = new mongoose.Schema.Types.ObjectId(redirectId)
    if (prevRedirectId) filterObject.prevRedirectId = new mongoose.Schema.Types.ObjectId(prevRedirectId)
    if (id) filterObject._id = id

    let dataUrl = chatBotScript.find(filterObject)

    if (sort) {
        let sortFix = sort.replaceAll(",", " ")
        dataUrl = dataUrl.sort(sortFix)
    }
    if (select) {
        let selectFix = select.replaceAll(",", " ")
        dataUrl = dataUrl.select(selectFix)
    }

    let page = Number(req.query.page) || 1
    let limit = Number(req.query.limit) || 2

    if (page) {
        dataUrl = dataUrl.skip((page - 1) * limit).limit(limit)
    }
    try {
        const getclientConfigCount = await chatBotScript.countDocuments(filterObject)
        const getclientConfig = await dataUrl
        res.status(200).send({ status: true, message: "success", count: getclientConfigCount, data: getclientConfig });
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to get Info", error: err});
    }
}

exports.create = async (req, res) => {

    const chatBotScriptAdd = new chatBotScript({
        botId: new mongoose.Types.ObjectId(req.body.botId),
        variableName: req.body.variableName,
        messageType: req.body.messageType,
        messageSubType: req.body.messageSubType,
        messageDraft: req.body.messageDraft,
        redirectId: req.body.redirectId ? new mongoose.Types.ObjectId(req.body.redirectId) : new mongoose.Types.ObjectId('000000000000000000000000'),
        waitTime: req.body.waitTime,
        validationType: req.body.validationType || '',
        mediaUrl: req.body.mediaUrl,
        listButtonName: req.body.listButtonName,
        buttonOrListData: req.body.buttonOrListData || [],
        apiUrl: req.body.apiUrl,
        method: req.body.method,
        headerParams: req.body.headerParams,
        bodyParams: req.body.bodyParams,
        prevRedirectId: req.body.prevRedirectId ? new mongoose.Types.ObjectId(req.body.prevRedirectId) : new mongoose.Types.ObjectId('000000000000000000000000'),
        sampleDataKey: req.body.sampleDataKey
    })

    try {
        const savedChatBotScript = await chatBotScriptAdd.save();
        res.status(200).send({ insertId: savedChatBotScript._id, status: true, message: "chatBotScript created", data: savedChatBotScript });
    } catch (err) {
        console.log(err);
        if (err.code == 11000) {
            res.status(400).send({ status: false, message: `${Object.entries(err.keyValue)[0][0]} already exists` });
        } else {
            res.status(400).send({status: false,message: "Failed to save info",error: err});
        }
    }
}

exports.update = async (req, res) => {
    const id = req.body.id
    try {
        if (!id) {
            res.status(400).send({ status: false, message: "Please enter user id to update" });
        } else {
            const findChatBotScript = await chatBotScript.findById(id);
            if (!findChatBotScript) {
                res.status(404).send({ status: false, message: "chatBotScript details not found" });
            }else{
                const updateChatBotScriptData = await chatBotScript.findByIdAndUpdate(id, { ...req.body, updatedAt: mm.getCurrentDate() }, { new: true });
                if (!updateChatBotScriptData) {
                    res.status(400).send({ status: false, message: "Failed to Update" });
                } else {
                    res.status(200).send({ status: true, message: "chatBotScript updated", data: updateChatBotScriptData });
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
    const id = req.body.id
    try {
        if (!id) {
            res.status(400).send({ status: false, message: "Please provide id" });
        } else {
            const findChatBotScript = await chatBotScript.findById(id);
            if (!findChatBotScript) {
                res.status(404).send({ status: false, message: "chatBotScript details not found" });
            }else{
                const deletedChatBotScript = await chatBotScript.findByIdAndDelete(id);
                if (!deletedChatBotScript) {
                    res.status(400).send({ status: false, message: "Failed to Delete" });
                }else{
                    res.status(200).send({ status: true, message: "chatBotScript Deleted", data: deletedChatBotScript });
                }
            }
        }
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to Delete", error: err });
    }
}


