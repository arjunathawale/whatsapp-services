
const Client = require('../models/client');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const mm = require("../services/global")
const moment = require("moment");
const { default: mongoose } = require('mongoose');
const bcrypt = require("bcryptjs");


function generateSecretKey() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';

    for (let i = 0; i < 32; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        key += characters[randomIndex];
    }

    return key;
}


exports.get = async (req, res) => {
    const { isAdmin, clientname, gstNo, panNo, address, emailId, mobileNo, isActive, activePlanId, sort, select, id } = req.body
    const { fromDate, toDate } = req.body
    const filterObject = {}
    if (clientname) filterObject.clientname = { $regex: clientname, $options: 'i' }
    if (gstNo) filterObject.gstNo = { $regex: gstNo, $options: 'i' }
    if (panNo) filterObject.panNo = { $regex: panNo, $options: 'i' }
    if (address) filterObject.address = { $regex: address, $options: 'i' }
    if (emailId) filterObject.emailId = { $regex: emailId, $options: 'i' }
    if (mobileNo) filterObject.mobileNo = { $regex: mobileNo, $options: 'i' }

    if (isAdmin) filterObject.isAdmin = isAdmin
    if (isActive) filterObject.isActive = isActive
    if (activePlanId) filterObject.activePlanId = activePlanId
    if (id) filterObject._id = id

    if (fromDate && toDate) {
        filterObject.createdAt = { $gte: fromDate, $lte: toDate }
        // filterObject.createdAt = { $gte: moment(fromDate).utcOffset("+05:30").format("YYYY-MM-DDTHH:mm:ss Z"), $lte: moment(toDate).utcOffset("+05:30").format("YYYY-MM-DDTHH:mm:ss Z") }
    }

    let dataUrl = Client.aggregate([
        { $match: filterObject },
        {
            $lookup: {
                from: "clientwpconfigs",
                localField: "_id",
                foreignField: "wpClientId",
                as: "clinetConfig",
            }
        },])
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
        const getClientCount = await Client.countDocuments(filterObject)
        const getClient = await dataUrl
        res.status(200).send({ status: true, message: "success", count: getClientCount, data: getClient });
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to get Info", error: err });
    }
}

exports.create = async (req, res) => {






    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password || '12345678', salt);
        const client = new Client({
            role: "CLIENT",
            clientname: req.body.clientname,
            panNo: req.body.panNo,
            gstNo: req.body.gstNo,
            address: req.body.address,
            emailId: req.body.emailId,
            mobileNo: req.body.mobileNo,
            password: hashedPassword,
            isActive: req.body.isActive,
            clientSecretKey: generateSecretKey()
        })
        const savedClient = await client.save();
        res.status(200).send({ insertId: savedClient._id, status: true, message: "Client created", data: savedClient });
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
            res.status(300).send({ status: false, message: "parameter missing id" });
        } else {
            const findClient = await Client.findById(id);
            if (!findClient) {
                res.status(404).send({ status: false, message: "Client details not found" });
            } else {
                const updateClientData = await Client.findByIdAndUpdate(id, { ...req.body, updatedAt: mm.getCurrentDate() }, { new: true });
                if (!updateClientData) {
                    res.status(400).send({ status: false, message: "Failed to Update" });
                } else {
                    res.status(200).send({ status: true, message: "Client updated", data: updateClientData });
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
            res.status(400).send({ status: false, message: "Please provide id" });
        } else {
            const findClient = await Client.findById(id);
            if (!findClient) {
                res.status(404).send({ status: false, message: "Client details not found" });
            } else {
                const deletedClient = await Client.findByIdAndDelete(id);
                res.status(200).send({ status: true, message: "Client Deleted", data: deletedClient });
            }
        }
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to Delete", error: err });
    }

}

exports.clientLogin = async (req, res) => {
    const { username, password } = req.body
    try {
        if (!username || !password) {
            res.status(400).send({ status: false, message: "Parameter Missing" });
        } else {
            const client = await Client.aggregate([
                {
                    $match: {
                        $or: [
                            { emailId: username },
                            { mobileNo: username }
                        ],
                        isActive: true
                    }
                },
                {
                    $lookup: {
                        from: "clientwpconfigs",
                        localField: "_id",
                        foreignField: "wpClientId",
                        as: "clinetConfig",
                    },
                }

            ]);


            if (client.length == 0) {
                const user = await User.findOne({ $or: [{ emailId: username }, { mobileNo: username }], isActive: true });
                if (!user) {
                    res.status(400).send({ status: false, message: "User Not Found" });
                } else {
                    const passwordMatch = await bcrypt.compare(password, user.password);
                    if (!passwordMatch) {
                        res.status(400).send({ status: false, message: "Incorrect Password" });
                    } else {

                        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "365d" });
                        // user['AuthToken'] = token;
                        const loginObject = user;
                        res.status(200).send({ status: true, message: "Login Successfully", data: loginObject, AuthToken: token });
                    }
                }

            } else {
                const passwordMatch = await bcrypt.compare(password, client[0].password);
                if (!passwordMatch) {
                    res.status(400).send({ status: false, message: "Incorrect Password" });
                } else {
                    const token = jwt.sign({ clientId: client._id }, process.env.JWT_SECRET, { expiresIn: "365d" });
                    const loginObject = {
                        ...client[0],
                        // AuthToken: token
                    }
                    res.status(200).send({ status: true, message: "Login Successfully", data: loginObject, AuthToken: token });
                }
            }
        }
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to Login", error: err });
    }

}

exports.getClientConfigInfo = async (req, res) => {

    const { isAdmin, clientname, gstNo, panNo, address, emailId, mobileNo, isActive, activePlanId, sort, id } = req.body
    const filterObject = {}
    if (clientname) filterObject.clientname = { $regex: clientname, $options: 'i' }
    if (gstNo) filterObject.gstNo = { $regex: gstNo, $options: 'i' }
    if (panNo) filterObject.panNo = { $regex: panNo, $options: 'i' }
    if (address) filterObject.address = { $regex: address, $options: 'i' }
    if (emailId) filterObject.emailId = { $regex: emailId, $options: 'i' }
    if (mobileNo) filterObject.mobileNo = { $regex: mobileNo, $options: 'i' }

    if (isAdmin) filterObject.isAdmin = isAdmin
    if (isActive) filterObject.isActive = isActive
    if (activePlanId) filterObject.activePlanId = activePlanId
    if (id) filterObject._id = new mongoose.Types.ObjectId(id)

    // let dataUrl = Client.find(filterObject)
    let dataUrl = Client.aggregate([
        { $match: filterObject },
        {
            $lookup: {
                from: "clientwpconfigs",
                localField: "_id",
                foreignField: "wpClientId",
                as: "clinetConfig",
            }
        },

        // {
        //     $project: {
        //         _id: 1,
        //         clientname: 1,
        //         gstNo: 1,
        //         clinetConfig: 1

        //     }
        // }
    ])
    if (sort) {
        let sortFix = sort.replaceAll(",", " ")
        dataUrl = dataUrl.sort(sortFix)
    }
    // if (select) {
    //     let selectFix = select.replaceAll(",", " ")
    //     dataUrl = dataUrl.select(selectFix)
    // }

    let page = Number(req.query.page) || 1
    let limit = Number(req.query.limit) || 100

    if (page) {
        dataUrl = dataUrl.skip((page - 1) * limit).limit(limit)
    }
    try {
        const getClientCount = await Client.countDocuments(filterObject)
        const getClient = await dataUrl
        res.status(200).send({ status: true, message: "success", count: getClientCount, data: getClient });
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to get Info", error: err });
    }
}


exports.updatePassword = async (req, res) => {
    const id = req.body.id
    try {
        if (!id) {
            res.status(300).send({ status: false, message: "parameter missing id" });
        } else {
            const findClient = await Client.findOne({ _id: id });
            if (!findClient) {
                res.status(404).send({ status: false, message: "Client Not Found" });
            } else {
                const passwordMatch = await bcrypt.compare(req.body.oldPassword, findClient.password);
                const salt = await bcrypt.genSalt(10);
                const confirmPassword = await bcrypt.hash(req.body.confirmPassword, salt);
                if (!passwordMatch) {
                    res.status(400).send({ status: false, message: "Incorrect Old Password" });
                } else {
                    const updateClientData = await Client.findByIdAndUpdate(id, { password: confirmPassword }, { new: true });
                    if (!updateClientData) {
                        res.status(400).send({ status: false, message: "Failed to Update" });
                    } else {
                        res.status(200).send({ status: true, message: "Password Updated", data: updateClientData });
                    }
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
