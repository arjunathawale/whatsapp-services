
const clientUserContact = require('../models/clientUserContacts');
const mm = require("../services/global")
const moogoose = require('mongoose');

exports.get = async (req, res) => {
    const { wpClientId, mobileNo, name,isSubscribed, sort, select, id } = req.body
    const filterObject = {}


    if (name) filterObject.name = { $regex: name, $options: 'i' }
    if (mobileNo) filterObject.mobileNo = { $regex: mobileNo, $options: 'i' }
    if (wpClientId) filterObject.wpClientId = wpClientId

    if (id) filterObject._id = id

    let dataUrl = clientUserContact.find(filterObject)

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
        const getClientUserContactCount = await clientUserContact.countDocuments(filterObject)
        const getClientUserContact = await dataUrl
        res.status(200).send({ status: true, message: "success", count: getClientUserContactCount, data: getClientUserContact });
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to get Info", error: err});
    }
}

exports.create = async (req, res) => {

    const clientContact = new clientUserContact({
        wpClientId: new moogoose.Types.ObjectId(req.body.wpClientId),
        mobileNo: req.body.mobileNo,
        name: req.body.name,
    })

    try {
        const clientUserContactSaved = await clientContact.save();
        res.status(200).send({ insertId: clientUserContactSaved._id, status: true, message: "Client User Contact created", data: clientUserContactSaved });

    } catch (err) {
        console.log(err);
        if (err.code == 11000) {
            res.status(400).send({ status: false, message: `${Object.entries(err.keyValue)[0][0]} already exists` });
        } else {
            res.status(400).send({status: false,message: "Failed to save info", error: err});
        }
    }
}

exports.update = async (req, res) => {
    const id = req.body.id
    try {
        if (!id) {
            res.status(400).send({ status: false, message: "Please enter id" });
        } else {

            const findRow = await clientUserContact.findById(id)
            if (!findRow) {
                res.status(404).send({ status: false, message: "clientUserContact not found" });
            } else {
                const updateRow = await clientUserContact.findByIdAndUpdate(id, { ...req.body, updatedAt: mm.getCurrentDate() }, { new: true });
                if (!updateRow) {
                    res.status(400).send({ status: false, message: "Failed to Update" });
                }else{
                    res.status(200).send({ status: true, message: "clientUserContact updated", data: updateRow });
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
        if (id) {
            res.status(400).send({ status: false, message: "Please enter id" });
        } else {
            const findRow = await clientUserContact.findById(id)
            if (!findRow) {
                res.status(404).send({ status: false, message: "clientUserContact not found" });
            } else {
                const deletedRow = await clientUserContact.findByIdAndDelete(id);
                if (!deletedRow) {
                    res.status(400).send({ status: false, message: "Failed to Delete" });
                } else {
                    res.status(200).send({ status: true, message: "clientUserContact Deleted", data: deletedRow });
                }
            }
        }
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to Delete", error: err });
    }
}


