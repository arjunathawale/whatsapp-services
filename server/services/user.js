
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const mm = require("../services/global")

exports.get = async (req, res) => {
    const { isAdmin, name, emailId, mobileNo, isActive, sort, select, id } = req.body
    const filterObject = {}

    if (name) filterObject.name = { $regex: name, $options: 'i' }
    if (emailId) filterObject.emailId = { $regex: emailId, $options: 'i' }
    if (mobileNo) filterObject.mobileNo = { $regex: mobileNo, $options: 'i' }
    if (isActive) filterObject.isActive = isActive
    if (isAdmin) filterObject.isAdmin = isAdmin
    if (id) filterObject._id = id

    let dataUrl = User.find(filterObject)
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
        const getUserCount = await User.countDocuments(filterObject)
        const getUser = await dataUrl
        res.status(200).send({ status: true, message: "success", count: getUserCount, data: getUser });
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to get Info", error: err});
    }
}

exports.create = async (req, res) => {
    const user = new User({
        name: req.body.name,
        emailId: req.body.emailId,
        mobileNo: req.body.mobileNo,
        password: req.body.password
    });

    try {
        const savedUser = await user.save();
        if (!savedUser) {
            res.status(400).send({ status: false, message: "Failed to Create" });
        } else {
            res.status(200).send({ insertId: savedUser._id, status: true, message: "User created", data: savedUser });
        }
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
    const id = req.query.id
    try {
        if (id == null || id == "" || id == undefined) {
            res.status(400).send({ status: false, message: "Please enter user id to update" });
        } else {
            const user = await User.findOne({ _id: id, isActive: true });
            if (!user) {
                res.status(404).send({ status: false, message: "User Not Found" });
            } else {
                const updatedUser = await User.findByIdAndUpdate(id, { ...req.body, updatedAt: mm.getCurrentDate() }, { new: true });
                if (!updatedUser) {
                    res.status(400).send({ status: false, message: "Failed to update" });
                } else {
                    res.status(200).send({ status: true, message: "User updated", data: updatedUser });
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
            res.status(400).send({ status: false, message: "Please enter user id to update" });
        } else {
            const user = await User.findOne({ _id: id, isActive: true });
            if (!user) {
                res.status(400).send({ status: false, message: "User Not Found" });
            } else {
                const deletedUser = await User.findByIdAndDelete(id)
                if (!deletedUser) {
                    res.status(400).send({ status: false, message: "Failed to Delete" });
                } else {
                    res.status(200).send({ status: true, message: "User Deleted", data: deletedUser });
                }
            }
        }
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to Delete", data: err });
    }

}

exports.userLogin = async (req, res) => {
    const { emailId, mobileNo, password } = req.body
    try {
        if (!emailId || !mobileNo || !password) {
            res.status(400).send({ status: false, message: "Parameter Missing" });
        } else {
            const user = await User.findOne({ emailId, isActive: true });
            if (!user) {
                res.status(400).send({ status: false, message: "EmailId Not Found" });
            } else if (password !== user.password) {
                res.status(400).send({ status: false, message: "Incorrect Password" });
            } else {
                const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "365d" });
                const loginTimeUpdate = User.updateOne({ _id: user._id }, { $set: { loginTime: mm.getCurrentDate() } });
                if (!loginTimeUpdate) {
                    res.status(400).send({ status: false, message: "Failed to Login" });
                } else {
                    const loginObject = {
                        token: token,
                        userId: user._id,
                        name: user.name,
                        emailId: user.emailId,
                        mobileNo: user.mobileNo,
                        loginTime: loginTimeUpdate.loginDateTime
                    }
                    res.status(200).send({ status: true, message: "Login Successfully", data: loginObject });
                }
            }
        }
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to Login", error: err });
    }
}