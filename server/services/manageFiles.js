const manageFiles = require('../models/manageFiles');
const moment = require("moment")
const mm = require("../services/global")
const fs = require('fs');
const path = require('path');
const { log } = require('console');
const { default: mongoose } = require('mongoose');
exports.get = async (req, res) => {
    const { wpClientId, fileOriginalName, fileNewName, fileType, fileSize, sort, id } = req.body
    let filterObject = {}
    let filterArray = [];

    if (wpClientId) filterObject.wpClientId = wpClientId
    if (fileOriginalName) filterArray.push({ fileOriginalName: { $regex: fileOriginalName, $options: 'i' } });
    if (fileNewName) filterArray.push({ fileNewName: { $regex: fileNewName, $options: 'i' } });
    if (fileType) filterArray.push({ fileType: { $regex: fileType, $options: 'i' } });
    if (fileSize) filterArray.push({ fileSize });
    if (id) filterArray.push({ _id: id });

    filterObject = filterArray.length ? { ...filterObject, $or: filterArray } : filterObject;


    let dataUrl = manageFiles.find(filterObject)
    if (sort) {
        let sortFix = sort.replaceAll(",", " ")
        dataUrl = dataUrl.sort(sortFix)
    }


    let page = Number(req.body.page) || 1
    let limit = Number(req.body.limit) || 10

    if (page) {
        dataUrl = dataUrl.skip((page - 1) * limit).limit(limit)
    }

    try {
        const result = await manageFiles.aggregate([
            {
                $match: {
                    wpClientId: new mongoose.Types.ObjectId(wpClientId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalFileSize: { $sum: "$fileSize" }
                }
            }
        ]);

        const getManageFilesCount = await manageFiles.countDocuments(filterObject)
        const getmanageFiles = await dataUrl
        res.status(200).send({ status: true, message: "success", count: getManageFilesCount, totalFileSizeUsed: result[0].totalFileSize, data: getmanageFiles });
    } catch (err) {
        console.log(err);
        res.status(400).send({ status: false, message: "Failed to get Info", error: err });
    }
}

exports.create = async (req, res) => {

    const clientplans = new manageFiles({
        ...req.body
    })

    try {
        const savedmanageFiles = await clientplans.save();
        res.status(200).send({ insertId: savedmanageFiles._id, status: true, message: "manageFiles created", data: savedmanageFiles });
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
    const id = req.body.id
    try {
        if (!id) {
            res.status(400).send({ status: false, message: "Please provide id to update" });
        } else {
            const findClientConfig = await manageFiles.findById(id);
            if (!findClientConfig) {
                res.status(404).send({ status: false, message: "manageFiles details not found" });
            } else {
                const updateClientConfigData = await manageFiles.findByIdAndUpdate(id, { ...req.body, updatedAt: mm.getCurrentDate() }, { new: true });
                if (!updateClientConfigData) {
                    res.status(400).send({ status: false, message: "Failed to Update" });
                } else {
                    res.status(200).send({ status: true, message: "manageFiles updated", data: updateClientConfigData });
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
    const id = req.params.id
    try {
        if (!id) {
            res.status(400).send({ status: false, message: "Please enter user id to update" });
        } else {
            const findClientConfig = await manageFiles.findById(id);
            if (!findClientConfig) {
                res.status(404).send({ status: false, message: "manageFiles details not found" });
            } else {
                const deletedClientConfigData = await manageFiles.findByIdAndDelete(id);
                if (!deletedClientConfigData) {
                    res.status(400).send({ status: false, message: "Failed to Delete" });
                } else {
                    var newPath = path.join(__dirname, '../uploads/clientMediaFiles/') + deletedClientConfigData.fileNewName;
                    fs.unlink(newPath, (err) => {
                        if (err) res.status(400).send({ status: false, message: "Failed to Delete", error: err });
                        else res.status(200).send({ status: true, message: "ManageFiles Deleted", data: deletedClientConfigData });
                    })
                }
            }
        }
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to Delete", error: err });
    }
}
