const jwt = require('jsonwebtoken');
const express = require('express');
exports.dotenv = require('dotenv').config();
const moment = require("moment");
const axios = require("axios")
const mongoose = require('mongoose');

exports.checkAuth = (req, res, next) => {
    try {


        var apikey = req.headers['apikey']
        if (apikey == process.env.API_KEY) {
            next();
        } else {
            // console.log(process.env.API_KEY);
            res.status(300).send({ status: false, message: "Access Denied...!" });
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, message: "Server not found..." });
    }
}

exports.checkToken = (req, res, next) => {
    let bearerHeader = req.headers['authorization'];
    // console.log("bearerHeader",bearerHeader,  req.headers.authorization);
    if (bearerHeader) {
        const token = bearerHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, authData) => {
            if (err) {
                console.log(err);
                res.status(400).send({ status: false, message: "Invalid token" });
            }
            else {
                req.authData = authData;
                next();
            }
        });
    }
    else {
        res.status(400).send({ status: false, message: "Access Denied...!" });
    }
}

exports.getCurrentDate = function () {
    // console.log(moment().utcOffset("+05:30").format("YYYY-MM-DDTHH:mm:ss Z"));
    return moment().utcOffset("+05:30").format("YYYY-MM-DDTHH:mm:ss Z")
}

const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const { generateMetaMediaId } = require('./template');

exports.templateMedia = function (req, res) {
    const wpClientId = req.headers.wpclientid
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) {
                console.error(err);
                res.status(400).send({ status: false, message: "Failed to get file" });
            } else {
                var oldPath = files.Image[0].filepath;
                var newPath = path.join(__dirname, '../uploads/templateMedia/') + fields.Name;
                var rawData = fs.readFileSync(oldPath)
                fs.writeFile(newPath, rawData, function (err) {
                    if (!err) {
                        let file_length = files.Image[0].size
                        let mime_type = files.Image[0].mimetype
                        console.log("mime_type", mime_type);
                        generateMetaMediaId(res, newPath, file_length, mime_type, wpClientId)
                    }
                    else {
                        console.error(err);
                        res.status(400).send({ status: false, message: "Failed to upload" });
                    }
                })
            }
        })
    }
    catch (err) {
        console.error(err);
        res.status(500).send({
            "status": false,
            "message": "Server Error",
            error: err
        });
    }
}


exports.sendInteractiveListMSGDate = (msg, phone_no_id, token, from, scriptDetails, header, button, LAST_MSG_ID, apiVersion, callback) => {
    try {
        var datas = []

        if (scriptDetails.length > 0) {
            for (let i = 0; i < scriptDetails.length; i++) {
                var data = {
                    id: scriptDetails[i].ID,
                    title: scriptDetails[i].DATE,
                    // description: scriptDetails[i].DESCRIPTION ? scriptDetails[i].DESCRIPTION  : ''
                }
                datas.push(data)
            }
        }

        const interactiveObject = {
            type: "list",
            header: {
                type: "text",
                text: header,
            },
            body: {
                text: msg,
            },
            footer: {
                text: "Type Home to MainMenu OR Type # to Back Menu",
            },
            action: {
                button: button,
                sections: [
                    {
                        title: "title",
                        rows: datas

                    },
                ],
            },
        };
        axios({
            method: "POST",
            url: "https://graph.facebook.com/" + apiVersion + "/" + phone_no_id + "/messages?access_token=" + token,
            data: {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: from,
                type: "interactive",
                interactive: interactiveObject,
                headers: {
                    "Content-Type": "application/json"
                }
            }

        }).then((success) => {
            let WP_MSG_ID = success.data.messages[0].id
            this.executeQueryData('UPDATE message_trasanction SET STATUS = ?, MESSAGE_STATUS = ?,  WP_MSG_ID = ?, MSG_DATETIME =? WHERE ID = ? ', ['S', 'unsent', WP_MSG_ID, this.getSystemDate(), LAST_MSG_ID], supportKey, (error, resultTemplate) => {
                if (error) {
                    console.log(error);
                    callback('Failed to update message trasanction');
                } else {
                    console.log("success");
                    callback();
                }
            })
        }, (reason) => {
            this.executeQueryData(`SELECT ID, MESSAGE_STATUS, TYPE, WP_CLIENT_ID, PLAN_TYPE, PLAN_ID, AMOUNT_CHARGES FROM view_message_trasanction where ID = ?`, [LAST_MSG_ID], supportKey, (error, results2) => {
                if (error) {
                    console.log("Error in get message_message_trasanction", error);
                    callback(error)
                } else {
                    let NEW_COLUMN_NAME = ''
                    if (results2[0].TYPE == 'UTILITY' && results2[0].PLAN_TYPE == 'R') NEW_COLUMN_NAME = "UTILITY_RATE_REMAINING"
                    else if (results2[0].TYPE == 'MARKETING' && results2[0].PLAN_TYPE == 'R') NEW_COLUMN_NAME = "MARKETING_RATE_REMAINING"
                    else if (results2[0].TYPE == 'AUTHENTICATION' && results2[0].PLAN_TYPE == 'R') NEW_COLUMN_NAME = "AUTH_RATE_REMAINING"
                    else if (results2[0].TYPE == 'SERVICE' && results2[0].PLAN_TYPE == 'R') NEW_COLUMN_NAME = "SERVICE_RATE_REMAINING"
                    else if (results2[0].TYPE == 'UTILITY' && results2[0].PLAN_TYPE == 'B') NEW_COLUMN_NAME = "UTI_BALANCE_REMAINING"
                    else if (results2[0].TYPE == 'MARKETING' && results2[0].PLAN_TYPE == 'B') NEW_COLUMN_NAME = "MAR_BALANCE_REMAINING"
                    else if (results2[0].TYPE == 'AUTHENTICATION' && results2[0].PLAN_TYPE == 'B') NEW_COLUMN_NAME = "AUTH_BALANCE_REMAINING"
                    else if (results2[0].TYPE == 'SERVICE' && results2[0].PLAN_TYPE == 'B') NEW_COLUMN_NAME = "SERVICE_BALANCE_REMAINING"
                    else NEW_COLUMN_NAME = ''

                    this.executeQueryData(`UPDATE message_trasanction SET STATUS = ?, MESSAGE_STATUS = ?, AMOUNT_CHARGES=0, WP_MSG_ID = ?, MSG_DATETIME =? WHERE ID = ?;UPDATE client_transaction SET DR_MSG_BALANCE = 0, DR_MSG_COUNT = 0 WHERE MSG_ID = ?;UPDATE client_plan_usage SET ${NEW_COLUMN_NAME} = (${NEW_COLUMN_NAME} + ${results2[0].AMOUNT_CHARGES}) where WP_CLIENT_ID = ? AND PLAN_ID = ?;`, ['F', 'failed', null, this.getSystemDate(), LAST_MSG_ID, LAST_MSG_ID], supportKey, (error, resultTemplate) => {
                        if (error) {
                            console.log(error);
                            callback('Failed to update message trasanction');
                        } else {
                            console.log("Failed");
                            callback()
                        }
                    })
                }
            })

        })

    } catch (error) {
        console.log(error);
        callback()
    }
}

exports.sendMSG = (message, from, phone_no_id, token, apiVersion, callback) => {

    let messageData = JSON.stringify({
        TYPE: "TEXT",
        BODY_TEXT: message
    })

    try {
        axios({
            method: "POST",
            url: "https://graph.facebook.com/" + apiVersion + "/" + phone_no_id + "/messages?access_token=" + token,
            data: {
                messaging_product: "whatsapp",
                to: from,
                text: {
                    body: message
                }
            },
            headers: {
                "Content-Type": "application/json"
            }
        }).then((success) => {
            let WP_MSG_ID = success.data.messages[0].id
            callback(null, WP_MSG_ID);
            // this.executeQueryData('UPDATE message_trasanction SET TEXT = ?, STATUS = ?, MESSAGE_STATUS = ?,  WP_MSG_ID = ?, MSG_DATETIME =? WHERE ID = ? ', [messageData, 'S', 'unsent', WP_MSG_ID, this.getSystemDate(), LAST_MSG_ID], supportKey, (error, resultTemplate) => {
            //     if (error) {
            //         console.log(error);
            //         callback('Failed to update message trasanction');
            //     } else {

            //         console.log("success");
            //     }
            // })
        }, (reason) => {
            callback(error)
            // this.executeQueryData(`SELECT ID, MESSAGE_STATUS, TYPE, WP_CLIENT_ID, PLAN_TYPE, PLAN_ID, AMOUNT_CHARGES FROM view_message_trasanction where ID = ?`, [LAST_MSG_ID], supportKey, (error, results2) => {
            //     if (error) {
            //         console.log("Error in get message_message_trasanction", error);
            //         callback(error)
            //     } else {
            //         let NEW_COLUMN_NAME = ''
            //         if (results2[0].TYPE == 'UTILITY' && results2[0].PLAN_TYPE == 'R') NEW_COLUMN_NAME = "UTILITY_RATE_REMAINING"
            //         else if (results2[0].TYPE == 'MARKETING' && results2[0].PLAN_TYPE == 'R') NEW_COLUMN_NAME = "MARKETING_RATE_REMAINING"
            //         else if (results2[0].TYPE == 'AUTHENTICATION' && results2[0].PLAN_TYPE == 'R') NEW_COLUMN_NAME = "AUTH_RATE_REMAINING"
            //         else if (results2[0].TYPE == 'SERVICE' && results2[0].PLAN_TYPE == 'R') NEW_COLUMN_NAME = "SERVICE_RATE_REMAINING"
            //         else if (results2[0].TYPE == 'UTILITY' && results2[0].PLAN_TYPE == 'B') NEW_COLUMN_NAME = "UTI_BALANCE_REMAINING"
            //         else if (results2[0].TYPE == 'MARKETING' && results2[0].PLAN_TYPE == 'B') NEW_COLUMN_NAME = "MAR_BALANCE_REMAINING"
            //         else if (results2[0].TYPE == 'AUTHENTICATION' && results2[0].PLAN_TYPE == 'B') NEW_COLUMN_NAME = "AUTH_BALANCE_REMAINING"
            //         else if (results2[0].TYPE == 'SERVICE' && results2[0].PLAN_TYPE == 'B') NEW_COLUMN_NAME = "SERVICE_BALANCE_REMAINING"
            //         else NEW_COLUMN_NAME = ''

            //         this.executeQueryData(`UPDATE message_trasanction SET STATUS = ?, MESSAGE_STATUS = ?, AMOUNT_CHARGES=0, WP_MSG_ID = ?, MSG_DATETIME =? WHERE ID = ?;UPDATE client_transaction SET DR_MSG_BALANCE = 0, DR_MSG_COUNT = 0 WHERE MSG_ID = ?;UPDATE client_plan_usage SET ${NEW_COLUMN_NAME} = (${NEW_COLUMN_NAME} + ${results2[0].AMOUNT_CHARGES}) where WP_CLIENT_ID = ? AND PLAN_ID = ?;`, ['F', 'failed', null, this.getSystemDate(), LAST_MSG_ID, LAST_MSG_ID], supportKey, (error, resultTemplate) => {
            //             if (error) {
            //                 console.log(error);
            //                 callback('Failed to update message trasanction');
            //             } else {
            //                 console.log("Failed");
            //                 callback()

            //             }
            //         })
            //     }
            // })
        })
    } catch (error) {
        console.log(error);
        callback(error)
    }
}

exports.sendMSGWithImage = (medialink, caption, from, phone_no_id, token, apiVersion, callback) => {

    let messageData = JSON.stringify({
        TYPE: "IMAGE_WITH_TEXT",
        LINK: medialink,
        BODY_TEXT: caption
    })
    try {
        axios({
            method: "POST",
            url: "https://graph.facebook.com/" + apiVersion + "/" + phone_no_id + "/messages?access_token=" + token,
            data: {
                messaging_product: "whatsapp",
                to: from,
                type: "image",
                image: {
                    "link": medialink,
                    "caption": caption
                },
            },
            headers: {
                "Content-Type": "application/json"
            }
        }).then((success) => {
            let WP_MSG_ID = success.data.messages[0].id
            callback(null, WP_MSG_ID);
        }, (reason) => {
            console.log("error :- ", reason);
            callback(reason);
        })
    } catch (error) {
        console.log("Failed to iamge message ", error);
        callback('Failed to iamge message ');
    }
}

exports.sendInteractiveListMSG = (msg, phone_no_id, token, from, scriptDetails, header, buttonName, LAST_MSG_ID, apiVersion, callback) => {

    try {
        var datas = []
        if (scriptDetails.length > 0) {
            for (let i = 0; i < scriptDetails.length; i++) {
                var data = {
                    id: scriptDetails[i].ID,
                    title: scriptDetails[i].NAME,
                    description: scriptDetails[i].DESCRIPTION ? scriptDetails[i].DESCRIPTION : ''
                }
                datas.push(data)
            }

            if (scriptDetails.length > 8) {
                var data = {
                    id: 0,
                    title: "More Items",
                    description: "Get More Items"
                }
                datas.push(data)
            }
        }

        const interactiveObject = {
            type: "list",
            header: {
                type: "text",
                text: header,
            },
            body: {
                text: msg,
            },
            footer: {
                text: "",
            },
            action: {
                button: buttonName,
                sections: [
                    {
                        title: "title",
                        rows: datas

                    },
                ],
            },
        };

        let messageData = JSON.stringify({
            TYPE: "LIST",
            BODY_TEXT: msg,
            FOOTER: "",
            BUTTON_NAME: buttonName,
            LIST_DATA: datas
        })

        axios({
            method: "POST",
            url: "https://graph.facebook.com/" + apiVersion + "/" + phone_no_id + "/messages?access_token=" + token,
            data: {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: from,
                type: "interactive",
                interactive: interactiveObject,
                headers: {
                    "Content-Type": "application/json"
                }
            }

        }).then((success) => {
            let WP_MSG_ID = success.data.messages[0].id
            this.executeQueryData('UPDATE message_trasanction SET TEXT =?, STATUS = ?, MESSAGE_STATUS = ?,  WP_MSG_ID = ?, MSG_DATETIME =? WHERE ID = ? ', [messageData, 'S', 'unsent', WP_MSG_ID, this.getSystemDate(), LAST_MSG_ID], supportKey, (error, resultTemplate) => {
                if (error) {
                    console.log('Failed to update message trasanction' + error);
                    callback('Failed to update message trasanction' + error);
                } else {
                    console.log("success");
                    callback();
                }
            })
        }, (reason) => {
            console.log("error in sendInteractiveListMSG :- ", reason);
            this.executeQueryData(`SELECT ID, MESSAGE_STATUS, TYPE, WP_CLIENT_ID, PLAN_TYPE, PLAN_ID, AMOUNT_CHARGES FROM view_message_trasanction where ID = ?`, [LAST_MSG_ID], supportKey, (error, results2) => {
                if (error) {
                    console.log("Error in get message_message_trasanction", error);
                    callback("Error in get message_message_trasanction", error);
                } else {
                    let NEW_COLUMN_NAME = ''
                    if (results2[0].TYPE == 'UTILITY' && results2[0].PLAN_TYPE == 'R') NEW_COLUMN_NAME = "UTILITY_RATE_REMAINING"
                    else if (results2[0].TYPE == 'MARKETING' && results2[0].PLAN_TYPE == 'R') NEW_COLUMN_NAME = "MARKETING_RATE_REMAINING"
                    else if (results2[0].TYPE == 'AUTHENTICATION' && results2[0].PLAN_TYPE == 'R') NEW_COLUMN_NAME = "AUTH_RATE_REMAINING"
                    else if (results2[0].TYPE == 'SERVICE' && results2[0].PLAN_TYPE == 'R') NEW_COLUMN_NAME = "SERVICE_RATE_REMAINING"
                    else if (results2[0].TYPE == 'UTILITY' && results2[0].PLAN_TYPE == 'B') NEW_COLUMN_NAME = "UTI_BALANCE_REMAINING"
                    else if (results2[0].TYPE == 'MARKETING' && results2[0].PLAN_TYPE == 'B') NEW_COLUMN_NAME = "MAR_BALANCE_REMAINING"
                    else if (results2[0].TYPE == 'AUTHENTICATION' && results2[0].PLAN_TYPE == 'B') NEW_COLUMN_NAME = "AUTH_BALANCE_REMAINING"
                    else if (results2[0].TYPE == 'SERVICE' && results2[0].PLAN_TYPE == 'B') NEW_COLUMN_NAME = "SERVICE_BALANCE_REMAINING"
                    else NEW_COLUMN_NAME = ''
                    this.executeQueryData(`UPDATE message_trasanction SET STATUS = ?, MESSAGE_STATUS = ?, AMOUNT_CHARGES=0, WP_MSG_ID = ?, MSG_DATETIME =? WHERE ID = ?;UPDATE client_transaction SET DR_MSG_BALANCE = 0, DR_MSG_COUNT = 0 WHERE MSG_ID = ?;UPDATE client_plan_usage SET ${NEW_COLUMN_NAME} = (${NEW_COLUMN_NAME} + ${results2[0].AMOUNT_CHARGES}) where WP_CLIENT_ID = ? AND PLAN_ID = ?;`, ['F', 'failed', null, this.getSystemDate(), LAST_MSG_ID, LAST_MSG_ID], supportKey, (error, resultTemplate) => {
                        if (error) {
                            console.log("Failed to credit charged amount", error);
                            callback('Failed to update message trasanction');
                        } else {
                            console.log("Success");
                            callback()

                        }
                    })
                }
            })
        })
    } catch (error) {
        console.log("Failed to send list message ", error);
        callback("Failed to send list message", error);
    }
}

exports.sendDocumentMedia = (caption, medialink, filename, from, phone_no_id, token, apiVersion, callback) => {
    let messageData = JSON.stringify({
        TYPE: "DOCUMENT",
        LINK: medialink,
        BODY_TEXT: caption,
        filename: filename,
    })
    try {
        axios({
            method: "POST",
            url: "https://graph.facebook.com/" + apiVersion + "/" + phone_no_id + "/messages?access_token=" + token,
            data: {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: from,
                type: "document",
                document: {
                    link: medialink,
                    caption: caption,
                    filename: filename
                },
            },
            headers: {
                "Content-Type": "application/json"
            }
        }).then((success) => {
            let WP_MSG_ID = success.data.messages[0].id

        }, (reason) => {
            console.log("error sendDocumentMedia :- ", reason);

        })

    } catch (error) {
        console.log(error);
        callback("Error in sendDocumentMedia", error);
    }
}

exports.sendInteractiveButtonMSG = (text, from, phone_no_id, token, apiVersion, buttonData, callback) => {

    try {
        let datas = []
        if (buttonData.length > 0) {
            for (let i = 0; i < buttonData.length; i++) {
                var data = {
                    "type": "reply",
                    "reply": {
                        id: buttonData[i].id,
                        title: buttonData[i].optionName
                    }
                }
                datas.push(data)
            }
        }


        const interactiveObject = {
            type: "button",
            // header: {
            //     type: "image",
            //     text: header,
            // },
            body: {
                text: text,
            },
            footer: {
                text: "",
            },
            action: {
                buttons: datas

            },
        };

        let messageData = JSON.stringify({
            TYPE: "BUTTON",
            BODY_TEXT: text,
            FOOTER: "",
            // BUTTON_NAME: button,
            BUTTON_DATA: datas
        })
        axios({
            method: "POST",
            url: "https://graph.facebook.com/" + apiVersion + "/" + phone_no_id + "/messages?access_token=" + token,
            data: {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: from,
                type: "interactive",
                interactive: interactiveObject,
                headers: {
                    "Content-Type": "application/json"
                }
            }

        }).then((success) => {
            console.log("success", success.data);
            let WP_MSG_ID = success.data.messages[0].id
            callback(null, WP_MSG_ID)
        }, (reason) => {
            console.log("error InteractiveButtonMSG:- ", reason);
            callback(reason)
        })

    } catch (error) {
        console.log(error);
        callback('Failed to send button message');
    }
}

exports.sendInteractiveListMSGNew = (message, buttonText, from, phone_no_id, token, apiVersion, scriptDetails, callback) => {
    try {
        var datas = []
        if (scriptDetails.length > 0) {
            for (let i = 0; i < scriptDetails.length; i++) {
                var data = {
                    id: scriptDetails[i].id,
                    title: scriptDetails[i].optionName,
                    description: scriptDetails[i].desc
                }
                datas.push(data)
            }
        }

        const interactiveObject = {
            type: "list",
            header: {
                type: "text",
                text: "",
            },
            body: {
                text: message,
            },
            footer: {
                text: "",
                // text: "Type Home to MainMenu OR Type # to Back Menu",
            },
            action: {
                button: buttonText,
                sections: [
                    {
                        title: "title",
                        rows: datas

                    },
                ],
            },
        };

        let messageData = JSON.stringify({
            TYPE: "LIST",
            BODY_TEXT: message,
            FOOTER: "",
            BUTTON_NAME: buttonText,
            LIST_DATA: datas
        })
        axios({
            method: "POST",
            url: "https://graph.facebook.com/" + apiVersion + "/" + phone_no_id + "/messages?access_token=" + token,
            data: {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: from,
                type: "interactive",
                interactive: interactiveObject,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        }).then((success) => {
            let WP_MSG_ID = success.data.messages[0].id
            callback(null, WP_MSG_ID)
        }, (reason) => {
            console.log("error in sendInteractiveListMSGNew:- ", reason.response.data);
            callback(reason.response.data)
        })

    } catch (error) {
        console.log(error);
        callback('error in sendInteractiveListMSGNew', error);
    }
}



exports.dateValidation = (stringToValidate) => {
    const regex = /(^(((0[1-9]|1[0-9]|2[0-8])[-](0[1-9]|1[012]))|((29|30|31)[-](0[13578]|1[02]))|((29|30)[-](0[4,6,9]|11)))[-](19|[2-9][0-9])\d\d$)|(^29[-]02[-](19|[2-9][0-9])(00|04|08|12|16|20|24|28|32|36|40|44|48|52|56|60|64|68|72|76|80|84|88|92|96)$)/;;
    return regex.test(stringToValidate);
};

exports.numberValidation = (number) => {
    const regex = /^[0-9]+$/;
    return regex.test(number);
};

exports.checkPinCode = (value) => {
    var expr = /^\d{6}(-\d{4})?$/;
    // var expr = /^[0-9][0-9]{5|4|5}$/;
    return expr.test(value)
};

exports.validatePAN = (panNumber) => {
    var panPattern = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
    return panPattern.test(panNumber);

}

exports.validateGSTNumber = (gstNumber) => {
    const gstPattern = /^([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Za-z]{1}Z[0-9A-Z]{1})$/;
    return gstPattern.test(gstNumber);
}

exports.validateName = (name) => {
    var regex = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/;
    return regex.test(name);
}

exports.validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

exports.ValidateMobileNumber = (mobileNumber) => {
    var expr = /^(0|91)?[6-9][0-9]{9}$/;
    return expr.test(mobileNumber)
}

exports.isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
}