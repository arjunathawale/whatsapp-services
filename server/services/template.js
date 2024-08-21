
const Template = require('../models/template');
const ClientWPConfig = require('../models/clientWPConfig');
const mm = require("../services/global")
const moment = require("moment");
const mongoose = require('mongoose');
const axios = require('axios');
const async = require('async');

exports.get = async (req, res) => {
    const { wpClientId, templateName, templateCategory, languages, fbTemplateStatus, fbTemplateId, status, sort, select, id, fromDate, toDate } = req.body
    const filterObject = {}

    if (wpClientId) filterObject.wpClientId = { $regex: wpClientId, $options: 'i' }
    if (templateName) filterObject.templateName = { $regex: templateName, $options: 'i' }
    if (templateCategory) filterObject.templateCategory = { $regex: templateCategory, $options: 'i' }
    if (languages) filterObject.languages = { $regex: languages, $options: 'i' }
    if (fbTemplateId) filterObject.fbTemplateId = { $regex: fbTemplateId, $options: 'i' }
    if (fbTemplateStatus) filterObject.fbTemplateStatus = { $regex: fbTemplateStatus, $options: 'i' }

    if (wpClientId) filterObject.wpClientId = wpClientId
    if (status) filterObject.status = status

    if (id) filterObject._id = id

    if (fromDate && toDate) {
        filterObject.createdAt = {
            $gte: fromDate,
            $lte: toDate
        }
    }

    let dataUrl = Template.find(filterObject)
    if (sort) {
        let sortFix = sort.replaceAll(",", " ")
        dataUrl = dataUrl.sort(sortFix)
    }
    if (select) {
        let selectFix = select.replaceAll(",", " ")
        dataUrl = dataUrl.select(selectFix)
    }

    let page = Number(req.body.page) || 1
    let limit = Number(req.body.limit) || 1000

    if (page) {
        dataUrl = dataUrl.skip((page - 1) * limit).limit(limit)
    }

    try {
        const getTemplateCount = await Template.countDocuments(filterObject)
        const getTemplate = await dataUrl
        res.status(200).send({ status: true, message: "success", count: getTemplateCount, data: getTemplate });
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to get Info", error: err });
    }
}

exports.create = async (req, res) => {

    const template = new Template({
        wpClientId: new mongoose.Types.ObjectId(req.body.wpClientId),
        templateName: req.body.templateName,
        templateCategory: req.body.templateCategory,
        languages: req.body.languages,
        headerType: req.body.headerType,
        headerValues: req.body.headerValues,
        bodyValues: req.body.bodyValues,
        footerValues: req.body.footerValues,
        buttonValues: req.body.buttonValues,
        status: req.body.status,
        fbTemplateId: req.body.fbTemplateId,
    })

    try {
        const savedTemplate = await template.save();
        res.status(200).send({ insertId: savedTemplate._id, status: true, message: "Template created", data: savedTemplate });
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
        if (!id) {
            res.status(300).send({ status: false, message: "Please provide id" });
        } else {
            const findTemplate = await Template.findById(id);
            if (!findTemplate) {
                res.status(404).send({ status: false, message: "Template details not found" });
            } else {
                const updateTemplateData = await Template.findByIdAndUpdate(id, { ...req.body, updatedAt: mm.getCurrentDate() }, { new: true });
                if (!updateTemplateData) {
                    res.status(400).send({ status: false, message: "Failed to Update" });
                } else {
                    res.status(200).send({ status: true, message: "Template updated", data: updateTemplateData });
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
            const findTemplate = await Template.findById(id);
            if (!findTemplate) {
                res.status(404).send({ status: false, message: "Template details not found" });
            } else {
                const deletedTemplate = await Template.findByIdAndDelete(id);
                if (!deletedTemplate) {
                    res.status(400).send({ status: false, message: "Failed to Delete" });
                } else {
                    res.status(200).send({ status: true, message: "Template Deleted", data: deletedTemplate });
                }
            }
        }
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to Delete", error: err });
    }
}

exports.createTemplateOLD = async (req, res) => {

    const template = new Template({
        wpClientId: new mongoose.Types.ObjectId(req.body.wpClientId),
        templateName: req.body.templateName,
        templateCategory: req.body.templateCategory,
        languages: req.body.languages,
        headerType: req.body.headerType,
        headerValues: req.body.headerValues,
        bodyValues: req.body.bodyValues,
        footerValues: req.body.footerValues,
        buttonValues: req.body.buttonValues,
        status: req.body.status,
        mediaUrl: req.body.mediaUrl,
        mediaId: req.body.mediaId,
    })



    try {
        const savedTemplate = await template.save();
        if (savedTemplate) {
            const clientConfig = await ClientWPConfig.findOne({ wpClientId: savedTemplate.wpClientId })
            if (!clientConfig) {
                res.status(400).send({ status: false, message: "Client config not found" });
            } else {
                let header = savedTemplate?.headerValues
                let body = savedTemplate?.bodyValues
                let footer = savedTemplate?.footerValues
                let button = savedTemplate?.buttonValues
                let components = []
                function isEmpty(obj) {
                    for (const prop in obj) {
                        if (Object.hasOwn(obj, prop)) {
                            components.push({ ...obj })
                        }
                    }
                    return true
                }
                isEmpty(header)
                isEmpty(body)
                isEmpty(footer)
                isEmpty(button)
                const tempComponent = components.filter(function (item, index) {
                    return index === components.findIndex(function (obj) {
                        return JSON.stringify(item.type) === JSON.stringify(obj.type)
                    })
                })
                axios({
                    method: "POST",
                    url: `https://graph.facebook.com/${clientConfig?.wpApiVersion}/${clientConfig?.wpBussinessAccId}/message_templates`,
                    data: {
                        "name": savedTemplate?.templateName,
                        "language": savedTemplate?.languages,
                        "category": savedTemplate?.templateCategory,
                        "components": tempComponent,

                    },
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + clientConfig?.wpPermanentToken,
                    },
                }).then(async (success) => {
                    console.log("successq", success);
                    console.log("success", success.data);
                    const data = success.data
                    const updateTemplate = await Template.findByIdAndUpdate(savedTemplate._id, { fbTemplateId: data.id, status: data.status, fbTemplateStatus: data.status, templateCategory: data.category, updatedAt: mm.getCurrentDate() }, { new: true })
                    res.status(200).send({ insertId: savedTemplate._id, status: true, message: "Template created", data: updateTemplate });

                }, (reason) => {
                    console.log("reason", reason.response);
                    res.status(300).send({ insertId: savedTemplate._id, status: false, message: "Template Creation failed" });

                })

                // console.log("ress", ress);
            }




        }
        // console.log(savedTemplate);
    } catch (err) {
        console.log(err);
        if (err.code == 11000) {
            res.status(400).send({ status: false, message: `${Object.entries(err.keyValue)[0][0]} already exists` });
        } else {
            res.status(400).send({ status: false, message: "Failed to save info", error: err });
        }
    }
}



const fsProm = require("fs/promises");
async function generateMetaMediaId(req, res, newPath, file_length, mime_type, WP_CLIENT_ID) {
    try {
        let file = await fsProm.readFile(newPath);
        mm.executeQueryData('SELECT * FROM VIEW_CLIENT_MASTER WHERE ID = ?', [WP_CLIENT_ID], 'fromGlobals', (error, results) => {
            if (error) {
                console.log(error);
                res.send({
                    "code": 400,
                    "message": "Failed to save clientUserData information..."
                });
            }
            else {
                if (results.length > 0) {
                    if (results[0].API_VERSION && results[0].PER_ACCESS_TOKEN && results[0].APP_ID) {
                        axios({
                            method: "POST",
                            url: `https://graph.facebook.com/${results[0].API_VERSION}/${results[0].APP_ID}/uploads?file_length=${file_length}&file_type=${mime_type}`,
                            headers: {
                                "Content-Type": mime_type,
                                "Authorization": "Bearer " + results[0].PER_ACCESS_TOKEN,
                            },
                        }).then((success) => {
                            console.log("success", success.data); // Error!
                            axios({
                                method: "POST",
                                url: `https://graph.facebook.com/${results[0].API_VERSION}/${success.data.id}`,
                                data: file,
                                headers: {
                                    "Content-Type": mime_type,
                                    "file_offset": "0",
                                    "Authorization": "OAuth " + results[0].PER_ACCESS_TOKEN,
                                },
                            }).then((success1) => {
                                console.log("successNew", success1.data.h); // Error!
                                res.send({
                                    "code": 200,
                                    "message": "success",
                                    "mediaId": success1.data.h,
                                });
                            }, (reason1) => {
                                console.log("reasonNew", reason1); // Error!
                                res.send({
                                    "code": 400,
                                    "message": "failed to generate media id.. Please check Configuration"
                                });
                            })
                        }, (reason) => {
                            console.log("reason", reason); // Error!
                            res.send({
                                "code": 400,
                                "message": "failed to generate upload id.. Please check Configuration111"
                            });
                        })

                    } else {
                        res.send({
                            "code": 400,
                            "message": "Please Check Client Configuration"
                        });
                    }
                } else {
                    res.send({
                        "code": 400,
                        "message": "Client Detail not found"
                    });
                }
            }
        })
    } catch (err) {
        console.log(err);
    }
}

exports.generateMetaMediaId = async (res, newPath, file_length, mime_type, wpClientId) => {
    let file = await fsProm.readFile(newPath);
    const clientConfig = await ClientWPConfig.findOne({ wpClientId: wpClientId })
    if (!clientConfig) {
        res.status(400).send({ status: false, message: "Client config not found" });
    } else {
        if (clientConfig.wpPermanentToken && clientConfig.wpApiVersion && clientConfig.wpAppId) {
            axios({
                method: "POST",
                url: `https://graph.facebook.com/${clientConfig.wpApiVersion}/${clientConfig.wpAppId}/uploads?file_length=${file_length}&file_type=${mime_type}`,
                headers: {
                    "Content-Type": mime_type,
                    "Authorization": "Bearer " + clientConfig.wpPermanentToken,
                },
            }).then((successBearer) => {
                console.log("successBearer", successBearer.data);
                axios({
                    method: "POST",
                    url: `https://graph.facebook.com/${clientConfig.wpApiVersion}/${successBearer.data.id}`,
                    data: file,
                    headers: {
                        "Content-Type": mime_type,
                        "file_offset": "0",
                        "Authorization": "OAuth " + clientConfig.wpPermanentToken,
                    },
                }).then((successOAuth) => {
                    console.log("successOAuth", successOAuth.data.h);
                    res.status(200).send({
                        status: true,
                        message: "success",
                        data: [{
                            uploadId: successBearer.data.id,
                            mediaId: successOAuth.data.h,
                        }]
                    })
                }, (reasonOAuth) => {
                    console.log("reasonOAuth", reasonOAuth);
                    res.status(400).send({ status: false, message: "failed to generate media id.. Please check Configuration" });
                })
            }, (reasonBearer) => {
                console.log("reasonBearer", reasonBearer.response.data.error.message);
                res.status(400).send({ status: false, message: "failed to generate upload id.. Please check Configuration" });
            })
        } else {
            res.status(400).send({ status: false, message: "Please Check Client Configuration" });
        }
    }
}

exports.getFBTemplate = async (req, res) => {
    let wpClientId = req.body.wpClientId
    try {
        const clientConfig = await ClientWPConfig.findOne({ wpClientId: wpClientId })
        if (!clientConfig) {
            res.status(400).send({ status: false, message: "Client config not found" });
        } else {
            axios({
                method: "GET",
                url: `https://graph.facebook.com/${clientConfig?.wpApiVersion}/${clientConfig?.wpBussinessAccId}/message_templates?status=APPROVED`,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + clientConfig?.wpPermanentToken,
                },
            }).then((success) => {
                let templateData = success.data.data
                let insertData = []
                for (let i = 0; i < templateData.length; i++) {
                    const element = templateData[i];
                    // if( element?.name == "greetings"){
                    //     console.log(element);
                    // }
                    let object = {
                        wpClientId: new mongoose.Types.ObjectId(wpClientId),
                        templateName: element?.name,
                        templateCategory: element?.category,
                        languages: element?.language,
                        headerValues: element?.components[0]?.type == "HEADER" ? element?.components[0] : {},
                        headerType: element?.components[0]?.type == "HEADER" ? element?.components[0]?.format : "",
                        bodyValues: element?.components[0]?.type == "BODY" ? element.components[0] : element.components[1].type == "BODY" ? element.components[1] : {},
                        footerValues: element?.components[1]?.type == "FOOTER" ? element?.components[1] : element?.components[2]?.type == "FOOTER" ? element?.components[2] : {},
                        buttonValues: element?.components[1]?.type == "BUTTONS" ? element?.components[1] : element?.components[2]?.type == "BUTTONS" ? element?.components[2] : element?.components[3]?.type == "BUTTONS" ? element?.components[3] : {},
                        status: "S",
                        mediaUrl: (element?.components[0]?.format == "IMAGE" || element?.components[0]?.format == "VIDEO" || element?.components[0]?.format == "DOCUMENT") ? element?.components[0]?.example[0] : "",
                        mediaId: (element?.components[0]?.format == "IMAGE" || element?.components[0]?.format == "VIDEO" || element?.components[0]?.format == "DOCUMENT") ? element?.components[0]?.example[0] : "",
                        fbTemplateId: element?.id,
                        fbTemplateStatus: element?.status
                    }
                    insertData.push(object)

                }
                async.eachSeries(insertData, async function iteratorOverElems(item, callback) {
                    const template = await Template.findOne({ fbTemplateId: item.fbTemplateId })
                    if (!template) {
                        const insertTemplate = new Template(item)
                        await insertTemplate.save()

                    } else {
                        const updateTemplate = await Template.findOneAndUpdate({ fbTemplateId: item.fbTemplateId }, item, { new: true })
                    }
                }, function done(err) {
                    if (err) {
                        res.status(400).send({ status: false, message: "failed to map", error: err })
                    } else {
                        res.status(200).send({ status: true, message: "Successfully fetched" })
                    }
                })
            }, (reason) => {
                console.log("reason", reason);
                res.status(400).send({ status: false, message: "Failed to get from Meta", error: reason.response.error });
            })
        }
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to get Info", error: err });
    }
}

exports.deleteTemplate = async (req, res) => {
    let wpClientId = req.body.wpClientId;
    let fbTemplateId = req.body.fbTemplateId;
    let _id = req.body.id;
    try {
        if (!wpClientId || !fbTemplateId || !_id) {
            res.status(400).send({ status: false, message: "wpClientId and fbTemplateId is required" });
        } else {
            const clientConfig = await ClientWPConfig.findOne({ wpClientId: wpClientId })
            if (!clientConfig) {
                res.status(400).send({ status: false, message: "Client config not found" });
            } else {
                const template = await Template.findOne({ fbTemplateId: fbTemplateId })
                if (!template) {
                    res.status(400).send({ status: false, message: "Template not found" });
                } else {
                    console.log("HERE", template);
                    const deletedTemplate = await Template.deleteOne({ fbTemplateId: fbTemplateId})
                    if (!deletedTemplate) {
                        res.status(400).send({ status: false, message: "Failed to delete" });
                    } else {
                        axios({
                            method: "DELETE",
                            url: `https://graph.facebook.com/${clientConfig?.wpApiVersion}/${clientConfig?.wpBussinessAccId}/message_templates?name=${template?.templateName}`,
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": "Bearer " + clientConfig?.wpPermanentToken,
                            },
                        }).then((success) => {
                            console.log(success.data);
                            res.status(200).send({ status: true, message: "Successfully deleted" })
                        }, (reason) => {
                            console.log(reason);
                            res.status(400).send({ status: true, message: "Failed to delete from Meta" })
                        })
                    }
                }
            }

        }
    } catch (err) {
        res.status(400).send({ status: false, message: "Failed to get Info", error: err });
    }
}

exports.createTemplate = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const template = new Template({
            wpClientId: new mongoose.Types.ObjectId(req.body.wpClientId),
            templateName: req.body.templateName,
            templateCategory: req.body.templateCategory,
            languages: req.body.languages,
            headerType: req.body.headerType,
            headerValues: req.body.headerValues,
            bodyValues: req.body.bodyValues,
            footerValues: req.body.footerValues,
            buttonValues: req.body.buttonValues,
            status: req.body.status,
            mediaUrl: req.body.mediaUrl,
            mediaId: req.body.mediaId,
        });

        const savedTemplate = await template.save({ session });
        if (savedTemplate) {
            const clientConfig = await ClientWPConfig.findOne({ wpClientId: savedTemplate.wpClientId }).session(session);
            if (!clientConfig) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).send({ status: false, message: "Client config not found" });
            }

            let header = savedTemplate?.headerValues;
            let body = savedTemplate?.bodyValues;
            let footer = savedTemplate?.footerValues;
            let button = savedTemplate?.buttonValues;
            let components = [];

            function isEmpty(obj) {
                for (const prop in obj) {
                    if (Object.hasOwn(obj, prop)) {
                        components.push({ ...obj });
                    }
                }
                return true;
            }

            isEmpty(header);
            isEmpty(body);
            isEmpty(footer);
            isEmpty(button);

            const tempComponent = components.filter(function (item, index) {
                return index === components.findIndex(function (obj) {
                    return JSON.stringify(item.type) === JSON.stringify(obj.type);
                });
            });

            try {
                const response = await axios({
                    method: "POST",
                    url: `https://graph.facebook.com/${clientConfig?.wpApiVersion}/${clientConfig?.wpBussinessAccId}/message_templates`,
                    data: {
                        "name": savedTemplate?.templateName,
                        "language": savedTemplate?.languages,
                        "category": savedTemplate?.templateCategory,
                        "components": tempComponent,
                    },
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + clientConfig?.wpPermanentToken,
                    },
                });

                const data = response.data;
                const updateTemplate = await Template.findByIdAndUpdate(savedTemplate._id, {
                    fbTemplateId: data.id,
                    status: data.status,
                    fbTemplateStatus: data.status,
                    templateCategory: data.category,
                    updatedAt: new Date()
                }, { new: true, session });

                await session.commitTransaction();
                session.endSession();
                return res.status(200).send({ insertId: savedTemplate._id, status: true, message: "Template created", data: updateTemplate });

            } catch (reason) {
                await session.abortTransaction();
                session.endSession();
                console.error("Reason:", reason.response);
                return res.status(300).send({ insertId: savedTemplate._id, status: false, message: "Template Creation failed" });
            }
        } else {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).send({ status: false, message: "Failed to save template" });
        }
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error(err);
        if (err.code == 11000) {
            return res.status(400).send({ status: false, message: `${Object.entries(err.keyValue)[0][0]} already exists` });
        } else {
            return res.status(400).send({ status: false, message: "Failed to save info", error: err });
        }
    }
};
