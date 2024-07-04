
const clientConfig = require('../models/clientWPConfig');
const mm = require("../services/global")
const moogoose = require('mongoose');


exports.get = async (req, res) => {
    const { wpClientId, wpRegisteredMobileNo, wpPhoneNoId, wpBussinessAccId, wpPermanentToken, wpApiVersion, wpAppId, sort, select, id } = req.body
    const filterObject = {}


    if (wpRegisteredMobileNo) filterObject.wpRegisteredMobileNo = { $regex: wpRegisteredMobileNo, $options: 'i' }
    if (wpPhoneNoId) filterObject.wpPhoneNoId = { $regex: wpPhoneNoId, $options: 'i' }
    if (wpBussinessAccId) filterObject.wpBussinessAccId = { $regex: wpBussinessAccId, $options: 'i' }
    if (wpPermanentToken) filterObject.wpPermanentToken = { $regex: wpPermanentToken, $options: 'i' }
    if (wpApiVersion) filterObject.wpApiVersion = { $regex: wpApiVersion, $options: 'i' }
    if (wpAppId) filterObject.wpAppId = { $regex: wpAppId, $options: 'i' }
    if (wpClientId) filterObject.wpClientId = wpClientId
    if (id) filterObject._id = id

    let dataUrl = clientConfig.find(filterObject)

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
        const getclientConfigCount = await clientConfig.countDocuments(filterObject)
        const getclientConfig = await dataUrl
        res.status(200).send({ status: true, message: "success", count: getclientConfigCount, data: getclientConfig });
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to get Info", error: err});
    }
}

exports.create = async (req, res) => {

    const client = new clientConfig({
        wpClientId: new moogoose.Types.ObjectId(req.body.wpClientId),
        wpRegisteredMobileNo: req.body.wpRegisteredMobileNo,
        wpPhoneNoId: req.body.wpPhoneNoId,
        wpBussinessAccId: req.body.wpBussinessAccId,
        wpPermanentToken: req.body.wpPermanentToken,
        wpApiVersion: req.body.wpApiVersion,
        wpAppId: req.body.wpAppId,
    })

    try {
        const savedclientConfig = await client.save();
      
        res.status(200).send({ insertId: savedclientConfig._id, status: true, message: "clientConfig created", data: savedclientConfig });
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
            const findClientConfig = await clientConfig.findById(id);
            if (!findClientConfig) {
                res.status(404).send({ status: false, message: "clientConfig details not found" });
            }else{
                const updateClientConfigData = await clientConfig.findByIdAndUpdate(id, { ...req.body, updatedAt: mm.getCurrentDate() }, { new: true });
                if (!updateClientConfigData) {
                    res.status(400).send({ status: false, message: "Failed to Update" });
                } else {
                    res.status(200).send({ status: true, message: "clientConfig updated", data: updateClientConfigData });
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
            const findClientConfig = await clientConfig.findById(id);
            if (!findClientConfig) {
                res.status(404).send({ status: false, message: "clientConfig details not found" });
            }else{
                const deletedclientConfig = await clientConfig.findByIdAndDelete(id);
                if (!deletedclientConfig) {
                    res.status(400).send({ status: false, message: "Failed to Delete" });
                }else{
                    res.status(200).send({ status: true, message: "clientConfig Deleted", data: deletedclientConfig });
                }
            }
        }
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to Delete", error: err });
    }
}


