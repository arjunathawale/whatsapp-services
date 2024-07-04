
const Role = require('../models/role');
const mm = require("../services/global")
const moment = require("moment");

exports.get = async (req, res) => {
    const { name, status, sort, select, id } = req.body
    const { fromDate, toDate } = req.body
    const filterObject = {}
    if (name) filterObject.name = { $regex: name, $options: 'i' }

    if (status) filterObject.status = status
    if (id) filterObject._id = id

    if (fromDate && toDate) {
        filterObject.createdAt = { $gte: moment(fromDate).utcOffset("+05:30").format("YYYY-MM-DDTHH:mm:ss Z"), $lte: moment(toDate).utcOffset("+05:30").format("YYYY-MM-DDTHH:mm:ss Z") }
    }

    let dataUrl = Role.find(filterObject)
    if (sort) {
        let sortFix = sort.replaceAll(",", " ")
        dataUrl = dataUrl.sort(sortFix)
    }
    if (select) {
        let selectFix = select.replaceAll(",", " ")
        dataUrl = dataUrl.select(selectFix)
    }

    let page = Number(req.query.page) || 1
    let limit = Number(req.query.limit) || 50

    if (page) {
        dataUrl = dataUrl.skip((page - 1) * limit).limit(limit)
    }

    try {
        const getRoleCount = await Role.countDocuments(filterObject)
        const getRole = await dataUrl
        res.status(200).send({ status: true, message: "success", count: getRoleCount, data: getRole });
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to get Info", error: err});
    }
}

exports.create = async (req, res) => {

    const role = new Role({
        name: req.body.name,
    })

    try {
        const savedRole = await role.save();
        res.status(200).send({ insertId: savedRole._id, status: true, message: "Role created", data: savedRole });
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
            res.status(300).send({ status: false, message: "Please provide id" });
        } else {
            const findRole = await Role.findById(id);
            if (!findRole) {
                res.status(404).send({ status: false, message: "Role details not found" });
            } else {
                const updateRoleData = await Role.findByIdAndUpdate(id, { ...req.body, updatedAt: mm.getCurrentDate() }, { new: true });
                if (!updateRoleData) {
                    res.status(400).send({ status: false, message: "Failed to Update" });
                } else {
                    res.status(200).send({ status: true, message: "Role updated", data: updateRoleData });
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
            const findRole = await Role.findById(id);
            if (!findRole) {
                res.status(404).send({ status: false, message: "Role details not found" });
            } else {
                const deletedRole = await Role.findByIdAndDelete(id);
                res.status(200).send({ status: true, message: "Role Deleted", data: deletedRole });
            }
        }
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to Delete", error: err });
    }
}
