const clientPlan = require('../models/clientPlan');
const moment = require("moment")
const mm = require("../services/global")

exports.get = async (req, res) => {
    const { wpClientId, planId, startTime, expireTime, fromDate, toDate, status, sort, select, id } = req.body
    let filterObject = {}

    if (startTime && expireTime) filterObject = { ...filterObject, startTime: { $gte: new Date(startTime).setHours(0, 0, 0), $lt: new Date(expireTime).setHours(23, 59, 59) } }
    else if (startTime) filterObject.startTime = { $gte: new Date(startTime).setHours(0, 0, 0) }
    else if (expireTime) filterObject.expireTime = { $gte: new Date(expireTime).setHours(0, 0, 0) }


    if (wpClientId) filterObject.wpClientId = wpClientId
    if (planId) filterObject.planId = planId
    if (status) filterObject.status = status
    if (id) filterObject._id = id

    let dataUrl = clientPlan.find(filterObject)
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
        const getClientPlanCount = await clientPlan.countDocuments(filterObject)
        const getclientPlan = await dataUrl
        res.status(200).send({ status: true, message: "success", count: getClientPlanCount, data: getclientPlan });
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to get Info", error: err});
    }
}

exports.create = async (req, res) => {

    const clientplans = new clientPlan({
        wpClientId: req.body.wpClientId,
        planId: req.body.planId,
        startTime: moment(req.body.startTime).utcOffset("+05:30").format("YYYY-MM-DDTHH:mm:ss Z"),
        expireTime: moment(req.body.expireTime).utcOffset("+05:30").format("YYYY-MM-DDTHH:mm:ss Z"),
        status: req.body.status,
    })

    try {
        const savedclientPlan = await clientplans.save();
        res.status(200).send({ insertId: savedclientPlan._id, status: true, message: "clientPlan created", data: savedclientPlan });
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
            res.status(400).send({ status: false, message: "Please provide id to update" });
        } else {
            const findClientConfig = await clientPlan.findById(id);
            if (!findClientConfig) {
                res.status(404).send({ status: false, message: "clientPlan details not found" });
            }else{
                const updateClientConfigData = await clientPlan.findByIdAndUpdate(id, { ...req.body, updatedAt: mm.getCurrentDate() }, { new: true });
                if (!updateClientConfigData) {
                    res.status(400).send({ status: false, message: "Failed to Update" });
                } else {
                    res.status(200).send({ status: true, message: "clientPlan updated", data: updateClientConfigData });
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
            res.status(400).send({ status: false, message: "Please enter user id to update" });
        } else {
            const findClientConfig = await clientPlan.findById(id);
            if (!findClientConfig) {
                res.status(404).send({ status: false, message: "clientPlan details not found" });
            } else {
                const deletedClientConfigData = await clientPlan.findByIdAndDelete(id);
                if (!deletedClientConfigData) {
                    res.status(400).send({ status: false, message: "Failed to Delete" });
                } else {
                    res.status(200).send({ status: true, message: "clientPlan Deleted", data: deletedClientConfigData });
                }
            }
        }
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to Delete", error: err });
    }
}
