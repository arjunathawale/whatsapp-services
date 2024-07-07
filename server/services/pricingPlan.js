
const PricingPlan = require('../models/pricingPlan');
const mm = require("../services/global")
const moment = require("moment");

exports.get = async (req, res) => {
    const { planName, planPeriod, description, bulkLimit, manageTemplate, chatBotFeature, planExpireIn, isActive, sort, select, id } = req.body
    const { fromDate, toDate } = req.body
    const filterObject = {}
    if (planName) filterObject.planName = { $regex: planName, $options: 'i' }
    if (description) filterObject.description = { $regex: description, $options: 'i' }


    if (planPeriod) filterObject.planPeriod = planPeriod
    if (bulkLimit) filterObject.bulkLimit = bulkLimit
    if (manageTemplate) filterObject.manageTemplate = manageTemplate
    if (chatBotFeature) filterObject.chatBotFeature = chatBotFeature
    if (isActive) filterObject.isActive = isActive
    if (planExpireIn) filterObject.planExpireIn = planExpireIn

    if (id) filterObject._id = id

    if (fromDate && toDate) {
        filterObject.createdAt = { $gte: moment(fromDate).utcOffset("+05:30").format("YYYY-MM-DDTHH:mm:ss Z"), $lte: moment(toDate).utcOffset("+05:30").format("YYYY-MM-DDTHH:mm:ss Z") }
    }

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
        const getPricingPlanCount = await PricingPlan.countDocuments(filterObject)
        const getPricingPlan = await dataUrl
        res.status(200).send({ status: true, message: "success", count: getPricingPlanCount, data: getPricingPlan });
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to get Info", error: err });
    }
}

exports.create = async (req, res) => {

    const PricingPlans = new PricingPlan({
        ...req.body
    })

    try {
        const savedPricingPlan = await PricingPlans.save();
        res.status(200).send({ insertId: savedPricingPlan._id, status: true, message: "PricingPlan created", data: savedPricingPlan });
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
            const findPricingPlan = await PricingPlan.findById(id);
            if (!findPricingPlan) {
                res.status(404).send({ status: false, message: "PricingPlan details not found" });
            } else {
                const updatePricingPlanData = await PricingPlan.findByIdAndUpdate(id, { ...req.body, updatedAt: mm.getCurrentDate() }, { new: true });
                if (!updatePricingPlanData) {
                    res.status(400).send({ status: false, message: "Failed to Update" });
                } else {
                    res.status(200).send({ status: true, message: "PricingPlan updated", data: updatePricingPlanData });
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
            const findPricingPlan = await PricingPlan.findById(id);
            if (!findPricingPlan) {
                res.status(404).send({ status: false, message: "PricingPlan details not found" });
            } else {
                const deletedPricingPlan = await PricingPlan.findByIdAndDelete(id);
                res.status(200).send({ status: true, message: "PricingPlan Deleted", data: deletedPricingPlan });
            }
        }
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to Delete", error: err });
    }

}