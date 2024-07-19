
const PurchaseClientPlans = require('../models/purchaseClientPlans');
const plans = require('../models/pricingPlan');
const mm = require("./global");
const mongoose = require('mongoose');
const crypto = require('crypto');
const axios = require('axios');

exports.get = async (req, res) => {
    const { isActive, wpClientId, planId, startDatetime, expireDatetime, id } = req.body
    const filterObject = {}
    if (planId) filterObject.planId = new mongoose.Types.ObjectId(planId)
    if (wpClientId) filterObject.wpClientId = new mongoose.Types.ObjectId(wpClientId)
    if (isActive) filterObject.isActive = isActive
    if (id) filterObject._id = id


    let dataUrl = PricingPlan.find(filterObject)
    if (sort) {
        let sortFix = sort.replaceAll(",", " ")
        dataUrl = dataUrl.sort(sortFix)
    }
    if (select) {
        let selectFix = select.replaceAll(",", " ")
        dataUrl = dataUrl.select(selectFix)
    }

    let page = Number(req.body.page) || 1
    let limit = Number(req.body.limit) || 50

    if (page) {
        dataUrl = dataUrl.skip((page - 1) * limit).limit(limit)
    }


    try {
        const getPurchaseClientPlansCount = await PurchaseClientPlans.countDocuments(filterObject)
        const getPurchaseClientPlans = await dataUrl
        res.status(200).send({ status: true, message: "success", count: getPurchaseClientPlansCount, data: getPurchaseClientPlans });
    } catch (err) {
        console.log(err);
        res.status(400).send({ status: false, message: "Failed to get Info", error: err });
    }
}

exports.createOLD = async (req, res) => {
    const purchaseClientPlans = new PurchaseClientPlans({
        planId: new mongoose.Types.ObjectId(req.body.planId),
        wpClientId: new mongoose.Types.ObjectId(req.body.wpClientId),
        startDatetime: req.body.startDatetime,
        expireDatetime: req.body.expireDatetime,
    });

    try {
        const savedPurchaseClientPlans = await purchaseClientPlans.save();
        if (!savedPurchaseClientPlans) {
            res.status(400).send({ status: false, message: "Failed to Create" });
        } else {
            res.status(200).send({ insertId: savedPurchaseClientPlans._id, status: true, message: "PurchaseClientPlans created", data: savedPurchaseClientPlans });
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
            res.status(400).send({ status: false, message: "Please enter PurchaseClientPlans id to update" });
        } else {
            const purchaseClientPlans = await PurchaseClientPlans.findOne({ _id: id, isActive: true });
            if (!purchaseClientPlans) {
                res.status(404).send({ status: false, message: "PurchaseClientPlans Not Found" });
            } else {
                const updatedPurchaseClientPlans = await PurchaseClientPlans.findByIdAndUpdate(id, { ...req.body, updatedAt: mm.getCurrentDate() }, { new: true });
                if (!updatedPurchaseClientPlans) {
                    res.status(400).send({ status: false, message: "Failed to update" });
                } else {
                    res.status(200).send({ status: true, message: "PurchaseClientPlans updated", data: updatedPurchaseClientPlans });
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
            res.status(400).send({ status: false, message: "Please enter PurchaseClientPlans id to update" });
        } else {
            const purchaseClientPlans = await PurchaseClientPlans.findOne({ _id: id, isActive: true });
            if (!purchaseClientPlans) {
                res.status(400).send({ status: false, message: "PurchaseClientPlans Not Found" });
            } else {
                const deletedPurchaseClientPlans = await PurchaseClientPlans.findByIdAndDelete(id)
                if (!deletedPurchaseClientPlans) {
                    res.status(400).send({ status: false, message: "Failed to Delete" });
                } else {
                    res.status(200).send({ status: true, message: "PurchaseClientPlans Deleted", data: deletedPurchaseClientPlans });
                }
            }
        }
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to Delete", data: err });
    }

}

exports.create = async (req, res) => {
    const purchaseClientPlans = new PurchaseClientPlans({
        planId: new mongoose.Types.ObjectId(req.body.planId),
        wpClientId: new mongoose.Types.ObjectId(req.body.wpClientId),
        startDatetime: req.body.startDatetime,
        expireDatetime: req.body.expireDatetime,
    });

    try {
        const savedPurchaseClientPlans = await purchaseClientPlans.save();
        if (!savedPurchaseClientPlans) {
            res.status(400).send({ status: false, message: "Failed to Create" });
        } else {
            const data = await plans.findById(savedPurchaseClientPlans.planId);
            const planData = {
                startDatetime: savedPurchaseClientPlans.startDatetime,
                expireDatetime: savedPurchaseClientPlans.expireDatetime,
                bulkLimit: data.bulkLimit,
                chatBotFeature: data.chatBotFeature,
                description: data.description,
                manageTemplate: data.manageTemplate,
                messageSendAPI: data.messageSendAPI,
                planName: data.planName,
                planPrice: data.planPrice,
                isActive: savedPurchaseClientPlans.isActive
            }
            res.status(200).send({ insertId: savedPurchaseClientPlans._id, status: true, message: "PurchaseClientPlans created", data: savedPurchaseClientPlans, planData: planData });
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

exports.generatePaymentLink = async (req, res) => {

    try {
        const { name, mobileNo, amount, planId, wpClientId, planExpireIn } = req.body
        const merchantId = "PGTESTPAYUAT";
        const saltKey = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";

        const merchantTransactionId = "M1MS35IGRKZM-" + Date.now();
        const keyIndex = 1
        const data = {
            merchantId: merchantId,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: "Arjun008",
            name: name,
            amount: amount * 100,
            redirectUrl: `https://62v2gfh6-8989.inc1.devtunnels.ms/checkPaymentStatus/${wpClientId}/?planID=${planId}&mobile=${mobileNo}&uniquePaymentId=${merchantTransactionId}`,
            redirectMode: "POST",
            mobileNumber: mobileNo,
            paymentInstrument: {
                type: "PAY_PAGE"
            }
        }
        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        const string = payloadMain + "/pg/v1/pay" + saltKey;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checkSum = sha256 + "###" + keyIndex

        const devUrl = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay'
        const options = {
            method: 'POST',
            url: devUrl,
            headers: {
                'accpect': 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checkSum
            },
            data: {
                request: payloadMain
            }
        }

        axios.request(options).then((response) => {
            console.log(response.data.data);
            res.redirect(response.data.data.instrumentResponse.redirectInfo.url);
        }).catch((error) => {
            console.log(error.response.data);
            res.status(500).send({ status: false, message: "Internal Server Error" });
        });
    } catch (error) {
        res.status(400).send({ status: false, message: "Failed to generate payment link", error: error });
    }
}