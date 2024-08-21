const chatBotScript = require('../models/chatBotScript');
const userChatHistory = require('../models/userChatHistory');
const bot = require('../models/bots');
const clientUserContacts = require('../models/clientUserContacts');
const userInputData = require('../models/userInputData');
const messageHistory = require('../models/messageHistory');
const mm = require('../services/global')
const request = require('request');
const { addToStatusQueue } = require('./Queues/WebhookStatusProducer');
const { addToChatBotQueue } = require('./Queues/ChatBotProvider');
const { setItem, getItem } = require('./Queues/Redis');


let selectLanguage = 'en'
let USER_INPUT = ''
let limitObject = {
    limit: 10,
    page: 1
}

const translateLanguageFunc = async (text, lang) => {
    try {
        const { default: translate } = await import('translate');
        const result = await translate(text, { to: lang });
        return result;
    } catch (error) {
        console.log(error);
    }
};



exports.VerifyWebhook = (req, res) => {
    try {
        let mode = req.query["hub.mode"]
        let challenge = req.query["hub.challenge"]
        let token = req.query["hub.verify_token"]
        if (mode && token) {
            if (mode === "subscribe" && token === "arjun") {
                res.status(200).send(challenge);
            } else {
                res.status(403).send("Token Wrong");
            }
        } else {
            res.status(403).send("Token not provided");
        }
    } catch (error) {
        console.log(error);
        res.status(403).send("Something went wrong");
    }
}

const isGreetingMessage = (message, triggerMsg) => {
    const greetings = triggerMsg.map(msg => msg.toLowerCase());
    return greetings.includes(message.toLowerCase());
}

const isBackMessage = (message) => {
    const isBack = ['#'];
    return isBack.includes(message.toLowerCase());
}

exports.handleWebhookRequests = async (req, res) => {
    let data = req.body
    try {
        if (data.object) {
            if (data.entry && data.entry[0].changes && data.entry[0].changes[0].value.messages && data.entry[0].changes[0].value.messages[0]) {
                addToChatBotQueue(data.entry[0].changes[0].value.messages[0].id, data)
                res.sendStatus(200);
            } else if (data.entry[0].changes[0].value.statuses) {
                let statusData = data.entry[0].changes[0].value.statuses[0]
                const queueData = {
                    "type": "MESSAGE_STATUS",
                    "wpMessageId": statusData.id,
                    "messageStatus": statusData.status,
                    "specifiedRes": statusData,
                    "allRes": data
                }
                let priority = 1
                if (statusData.status === 'failed') priority = 1
                else if (statusData.status === 'sent') priority = 2
                else if (statusData.status === 'delivered') priority = 3
                else if (statusData.status === 'read') priority = 4
                else priority = 5
                addToStatusQueue(`${statusData.id}-${statusData.status}`, queueData, priority)
                res.sendStatus(200);
            } else if (data.entry[0].changes[0].field != "messages") {
                const queueData = {
                    "type": "TEMPLATE_STATUS",
                    "wpMessageId": statusData.id,
                    "messageStatus": statusData.status,
                    "specifiedRes": data.entry[0].changes[0],
                    "allRes": data
                }
                res.sendStatus(200);
            } else {
                res.sendStatus(404);
                console.log("WebHook Data Not Received");
            }
        } else {
            console.log("data.object not found");
            res.sendStatus(404);
        }
    } catch (err) {
        console.log("Something went wrong:- ", err);
        res.sendStatus(404);
    }
}

// first message like ('hello', 'hi', 'hey', 'home', 'main', 'menu')
const greetMessage = async (message, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, callbackFunction) => {
    try {
        const insertUserChatHistory = await userChatHistory.create({
            botId: botId,
            userId: userId,
            userMobileNo: userMobileNo,
            sender: "U",
            messageContent: message,
            messageDatetime: new Date(),
            mainRedirectId: null,
            redirectId: null,
            userInputSaveIn: "",
            validationType: "",
            prevRedirectId: null,
        })

        if (!insertUserChatHistory) {
            callbackFunction('Failed to Insert In Chat History');
        } else {
            const chatBotStart = await chatBotScript.findOne({ botId: botId }).sort({ _id: 1 }).limit(1)
            if (!chatBotStart) {
                callbackFunction('Start Chatbot script not found')
            } else {
                let redirectId = chatBotStart._id
                if (redirectId === "000000000000000000000000") {
                    callbackFunction("Chatbot script not found")
                } else {
                    async function processScript() {
                        const scriptData = await chatBotScript.findById(redirectId)
                        if (!scriptData) {
                            callbackFunction("Chat script not found")
                        } else {
                            if (scriptData.messageType === "TEXT") {
                                let messageContent = await translateLanguageFunc(scriptData.messageDraft, selectLanguage)
                                const insertAdminChatHistory = await userChatHistory.create({
                                    botId: botId,
                                    userId: userId,
                                    userMobileNo: userMobileNo,
                                    sender: "A",
                                    messageContent: messageContent,
                                    messageDatetime: new Date(),
                                    mainRedirectId: null,
                                    redirectId: scriptData.redirectId,
                                    userInputSaveIn: scriptData.variableName,
                                    validationType: scriptData.validationType,
                                    prevRedirectId: scriptData.prevRedirectId,
                                })
                                if (!insertAdminChatHistory) {
                                    callbackFunction("Failed to Insert Admin chat history")
                                } else {
                                    mm.sendMSG(messageContent, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                                        if (error) {
                                            console.log("Error in get method: ", error);
                                            callbackFunction('Failed to send message');
                                        } else {
                                            redirectId = scriptData.redirectId;
                                            let waitTime = scriptData.waitTime;
                                            if (waitTime !== null && waitTime > 0) {
                                                setTimeout(processScript, waitTime);
                                            } else {
                                                callbackFunction(null, "Success");
                                            }
                                        }
                                    });
                                }
                            } else if (scriptData.messageType === "IMAGE") {
                                let caption = await translateLanguageFunc(scriptData.messageDraft, selectLanguage),
                                    mediaUrl = scriptData.mediaUrl
                                const insertAdminChatHistory = await userChatHistory.create({
                                    botId: botId,
                                    userId: userId,
                                    userMobileNo: userMobileNo,
                                    sender: "A",
                                    messageContent: caption,
                                    mediaUrl: mediaUrl,
                                    messageDatetime: new Date(),
                                    mainRedirectId: null,
                                    redirectId: scriptData.redirectId,
                                    userInputSaveIn: scriptData.variableName,
                                    validationType: scriptData.validationType,
                                    prevRedirectId: scriptData.prevRedirectId,
                                })
                                if (!insertAdminChatHistory) {
                                    callbackFunction("Failed to Insert Admin chat history")
                                } else {
                                    mm.sendMSGWithImage(mediaUrl, caption, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                                        if (error) {
                                            console.log("Failed to send image message: ", error);
                                            callbackFunction('Failed to send image message');
                                        } else {
                                            redirectId = scriptData.redirectId;
                                            let waitTime = scriptData.waitTime;
                                            if (waitTime !== null && waitTime > 0) {
                                                setTimeout(processScript, waitTime);
                                            } else {
                                                callbackFunction(null, "Success");
                                            }
                                        }
                                    });
                                }


                            } else if (scriptData.messageType === "DOCUMENT") {
                                let caption = await translateLanguageFunc(scriptData.messageDraft, selectLanguage),
                                    mediaUrl = scriptData.mediaUrl,
                                    filename = Date.now()
                                const insertAdminChatHistory = await userChatHistory.create({
                                    botId: botId,
                                    userId: userId,
                                    userMobileNo: userMobileNo,
                                    sender: "A",
                                    messageContent: caption,
                                    mediaUrl: mediaUrl,
                                    messageDatetime: new Date(),
                                    mainRedirectId: scriptData.redirectId,
                                    redirectId: scriptData.redirectId,
                                    userInputSaveIn: scriptData.variableName,
                                    validationType: scriptData.validationType,
                                    prevRedirectId: scriptData.prevRedirectId,
                                })
                                if (!insertAdminChatHistory) {
                                    callbackFunction("Failed to Insert Admin chat history")
                                } else {
                                    mm.sendDocumentMedia(caption, mediaUrl, filename, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                                        if (error) {
                                            console.log("Failed to send Document message: ", error);
                                            callbackFunction('Failed to send Document message');
                                        } else {
                                            redirectId = scriptData.redirectId;
                                            let waitTime = scriptData.waitTime;
                                            if (waitTime !== null && waitTime > 0) {
                                                setTimeout(processScript, waitTime);
                                            } else {
                                                callbackFunction(null, "Success");
                                            }
                                        }
                                    });
                                }
                            } else if (scriptData.messageType === "BUTTON") {
                                let messageContent = scriptData.messageDraft
                                // let messageContent = await translateLanguageFunc(scriptData.messageDraft, selectLanguage)
                                let manyInsertArray = []
                                let listData = []
                                let arrayData = scriptData.buttonOrListData
                                if (arrayData.length > 0) {
                                    for (let i = 0; i < arrayData.length; i++) {
                                        const element = arrayData[i];
                                        // const trans = await translateLanguageFunc(element.optionName, selectLanguage)
                                        const object = {
                                            botId: botId,
                                            userId: userId,
                                            userMobileNo: userMobileNo,
                                            sender: "A",
                                            messageContent: element.optionName,
                                            messageDatetime: new Date(),
                                            mainRedirectId: element.id + "_" + (i + 1),
                                            redirectId: element.id + "_" + (i + 1),
                                            userInputSaveIn: scriptData.variableName,
                                            validationType: scriptData.validationType,
                                            prevRedirectId: scriptData.prevRedirectId,
                                        }
                                        manyInsertArray.push(object)
                                        const listObject = {
                                            id: element.id + "_" + (i + 1),
                                            optionName: element.optionName
                                        }
                                        listData.push(listObject)
                                    }

                                    const insertAdminChatHistory = await userChatHistory.insertMany(manyInsertArray)
                                    if (!insertAdminChatHistory) {
                                        callbackFunction("Failed to Insert Admin chat history")
                                    } else {
                                        mm.sendInteractiveButtonMSG(messageContent, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, listData, wpClientId, botId, userId, planId, (error, result) => {
                                            if (error) {
                                                console.log("Failed to send Button message: ", error);
                                                callbackFunction('Failed to send Button message');
                                            } else {
                                                redirectId = scriptData.redirectId;
                                                let waitTime = scriptData.waitTime;
                                                if (waitTime !== null && waitTime > 0) {
                                                    setTimeout(processScript, waitTime);
                                                } else {
                                                    callbackFunction(null, "Success");
                                                }
                                            }
                                        });
                                    }
                                } else {
                                    callbackFunction("Not Found buttonOrListData")
                                }
                            } else if (scriptData.messageType === "LIST") {
                                let messageContent = await translateLanguageFunc(scriptData.messageDraft, selectLanguage)
                                buttonText = await translateLanguageFunc(scriptData.listButtonName, selectLanguage),
                                    listData = [],
                                    manyInsertArray = [],
                                    arrayData = scriptData.buttonOrListData
                                if (arrayData.length > 0) {
                                    for (let i = 0; i < arrayData.length; i++) {
                                        const element = arrayData[i];
                                        const trans = await translateLanguageFunc(element.optionName, selectLanguage)
                                        const object = {
                                            botId: botId,
                                            userId: userId,
                                            userMobileNo: userMobileNo,
                                            sender: "A",
                                            messageContent: trans,
                                            messageDatetime: new Date(),
                                            mainRedirectId: element.id + "_" + (i + 1),
                                            redirectId: element.id + "_" + (i + 1),
                                            userInputSaveIn: scriptData.variableName,
                                            validationType: scriptData.validationType,
                                            prevRedirectId: scriptData.prevRedirectId,
                                        }
                                        manyInsertArray.push(object)
                                        const listObject = {
                                            id: element.id + "_" + (i + 1),
                                            optionName: trans
                                        }
                                        listData.push(listObject)

                                    }

                                    console.log("listData: ", listData);
                                    const insertAdminChatHistory = await userChatHistory.insertMany(manyInsertArray)
                                    if (!insertAdminChatHistory) {
                                        callbackFunction("Failed to Insert Admin chat history")
                                    }
                                    mm.sendInteractiveListMSGNew(messageContent, buttonText, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, listData, wpClientId, botId, userId, planId, (error, result) => {
                                        if (error) {
                                            console.log("Failed to send Button message: ", error);
                                            callbackFunction('Failed to send Button message');
                                        } else {
                                            redirectId = scriptData.redirectId;
                                            let waitTime = scriptData.waitTime;
                                            if (waitTime !== null && waitTime > 0) {
                                                setTimeout(processScript, waitTime);
                                            } else {
                                                callbackFunction(null, "Success");
                                            }
                                        }
                                    });
                                } else {
                                    callbackFunction("Not Found buttonOrListData")
                                }
                            } else if (scriptData.messageType === "API_DATA") {
                                let bodyParams = scriptData.bodyParams;
                                let keys = []
                                if (bodyParams) {
                                    Object.keys(bodyParams).forEach((key) => {
                                        keys.push(bodyParams[key])
                                    })
                                } else {
                                    keys.push("")
                                }

                                const resultInputData = await userInputData.find({ botId: botId, mobileNo: userMobileNo, variableName: { $in: keys } }).select({ selectedValue: 1, variableName: 1, _id: 0 })
                                Object.keys(bodyParams).forEach((key) => {
                                    for (let i = 0; i < resultInputData.length; i++) {
                                        const element = resultInputData[i];
                                        if (bodyParams[key] === element.variableName) {
                                            bodyParams[key] = element.selectedValue
                                        }
                                    }
                                })

                                const newObject = {
                                    ...bodyParams,
                                    ...limitObject
                                }
                                const requestOptions = {
                                    url: scriptData.apiUrl,
                                    method: scriptData.method,
                                    headers: scriptData.headerParams,
                                    body: newObject,
                                    json: true
                                }
                                request(requestOptions, async (error, response, body) => {
                                    if (error) {
                                        console.log("Error in request", error);
                                        callbackFunction("Failed to Request API Data")
                                    } else {
                                        if (response.statusCode === 200) {
                                            let dataKey = scriptData?.sampleDataKey?.data,
                                                dataId = scriptData?.sampleDataKey?.id,
                                                dataName = scriptData?.sampleDataKey?.name,
                                                dataDesc = scriptData?.sampleDataKey?.desc;
                                            fileUrl = scriptData?.sampleDataKey?.fileUrl;
                                            if (body[dataKey].length > 0) {
                                                if (scriptData.messageSubType === "TEXT") {
                                                    let messageContent = await translateLanguageFunc(scriptData.messageDraft, selectLanguage)
                                                    const keyData = await flattenCartData(body[dataKey], messageContent, dataName, dataId, "", "")
                                                    const insertAdminChatHistory = await userChatHistory.create({
                                                        botId: botId,
                                                        userId: userId,
                                                        userMobileNo: userMobileNo,
                                                        sender: "A",
                                                        messageContent: keyData.stringValue,
                                                        messageDatetime: new Date(),
                                                        mainRedirectId: null,
                                                        redirectId: scriptData.redirectId,
                                                        userInputSaveIn: scriptData.variableName,
                                                        validationType: scriptData.validationType,
                                                        prevRedirectId: scriptData.prevRedirectId,
                                                    })
                                                    if (!insertAdminChatHistory) {
                                                        callbackFunction("Failed to Insert Admin chat history")
                                                    } else {
                                                        mm.sendMSG(keyData.stringValue, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                                                            if (error) {
                                                                console.log("Error in get method: ", error);
                                                                callbackFunction('Failed to send message');
                                                            } else {
                                                                redirectId = scriptData.redirectId;
                                                                let waitTime = scriptData.waitTime;
                                                                if (waitTime !== null && waitTime > 0) {
                                                                    setTimeout(processScript, waitTime);
                                                                } else {
                                                                    callbackFunction(null, "Success");
                                                                }
                                                            }
                                                        });
                                                    }
                                                } else if (scriptData.messageSubType === "LIST") {
                                                    let messageContent = await translateLanguageFunc(scriptData.messageDraft, selectLanguage),
                                                        buttonText = await translateLanguageFunc(scriptData.listButtonName, selectLanguage),
                                                        listData = [],
                                                        manyInsertArray = []
                                                    for (let i = 0; i < body[dataKey].length; i++) {
                                                        const element = body[dataKey][i];

                                                        const object = {
                                                            botId: botId,
                                                            userId: userId,
                                                            userMobileNo: userMobileNo,
                                                            sender: "A",
                                                            messageContent: element[dataName],
                                                            messageDatetime: new Date(),
                                                            mainRedirectId: scriptData.redirectId + "_" + (i + 1),
                                                            redirectId: scriptData.redirectId + "_" + (i + 1),
                                                            userInputSaveIn: scriptData.variableName,
                                                            validationType: scriptData.validationType,
                                                            prevRedirectId: scriptData.prevRedirectId,
                                                        }
                                                        manyInsertArray.push(object)
                                                        const listObject = {
                                                            id: scriptData.redirectId + "_" + (i + 1),
                                                            optionName: await translateLanguageFunc(element[dataName], selectLanguage),
                                                            desc: await translateLanguageFunc(element[dataDesc], selectLanguage)
                                                        }
                                                        listData.push(listObject)
                                                    }

                                                    const insertAdminChatHistory = await userChatHistory.insertMany(manyInsertArray)
                                                    if (!insertAdminChatHistory) {
                                                        callbackFunction("Failed to Insert Admin chat history")
                                                    } else {
                                                        mm.sendInteractiveListMSGNew(messageContent, buttonText, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, listData, wpClientId, botId, userId, planId, (error, result) => {
                                                            if (error) {
                                                                console.log("Failed to send Button message: ", error);
                                                                callbackFunction('Failed to send Button message');
                                                            } else {
                                                                redirectId = scriptData.redirectId;
                                                                let waitTime = scriptData.waitTime;
                                                                if (waitTime !== null && waitTime > 0) {
                                                                    setTimeout(processScript, waitTime);
                                                                } else {
                                                                    callbackFunction(null, "Success");
                                                                }
                                                            }
                                                        });
                                                    }
                                                } else if (scriptData.messageSubType === "DOCUMENT") {

                                                    const keyData = await flattenCartData(body[dataKey], scriptData.messageDraft, dataName, dataId, fileUrl, "")


                                                    console.log("keyData", keyData);
                                                    let caption = await translateLanguageFunc(keyData.stringValue, selectLanguage),
                                                        mediaUrl = keyData.fileUrlValue,
                                                        filename = Date.now()
                                                    const insertAdminChatHistory = await userChatHistory.create({
                                                        botId: botId,
                                                        userId: userId,
                                                        userMobileNo: userMobileNo,
                                                        sender: "A",
                                                        messageContent: caption,
                                                        mediaUrl: mediaUrl,
                                                        messageDatetime: new Date(),
                                                        mainRedirectId: scriptData.redirectId,
                                                        redirectId: scriptData.redirectId,
                                                        userInputSaveIn: scriptData.variableName,
                                                        validationType: scriptData.validationType,
                                                        prevRedirectId: scriptData.prevRedirectId,
                                                    })
                                                    if (!insertAdminChatHistory) {
                                                        callbackFunction("Failed to Insert Admin chat history")
                                                    } else {
                                                        mm.sendDocumentMedia(caption, mediaUrl, filename, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                                                            if (error) {
                                                                console.log("Failed to send Document message: ", error);
                                                                callbackFunction('Failed to send Document message');
                                                            } else {
                                                                redirectId = scriptData.redirectId;
                                                                let waitTime = scriptData.waitTime;
                                                                if (waitTime !== null && waitTime > 0) {
                                                                    setTimeout(processScript, waitTime);
                                                                } else {
                                                                    callbackFunction(null, "Success");
                                                                }
                                                            }
                                                        });
                                                    }
                                                } else {
                                                    callbackFunction("messageSubType not matched")
                                                }
                                            } else {
                                                callbackFunction("No Data Found")
                                            }

                                        } else {
                                            callbackFunction("Failed to send API Data")
                                        }
                                    }
                                })
                            } else {
                                callbackFunction("messageType not matched")
                            }
                        }

                    }

                    processScript()
                }
            }
        }
    } catch (error) {
        console.log(error);
        callbackFunction(error);
    }
}

// if user type text
const textMessage = async (message, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, callbackFunction) => {
    try {
        const userChatHistorys = await userChatHistory.findOne({ userMobileNo: userMobileNo, botId: botId, }).sort({ _id: -1 }).limit(1)
        if (userChatHistorys) {
            let redirectIdNew = userChatHistorys?.mainRedirectId ? userChatHistorys?.mainRedirectId : userChatHistorys?.redirectId,
                setValidationError = false,
                USER_INPUT = message
            if (userChatHistorys?.validationType != null || userChatHistorys?.validationType != undefined) {
                if (userChatHistorys?.validationType === 'NUMBER') setValidationError = mm.numberValidation(message)
                else if (userChatHistorys?.validationType === 'NAME') setValidationError = mm.validateName(message)
                else if (userChatHistorys?.validationType === 'EMAIL') setValidationError = mm.validateEmail(message)
                else if (userChatHistorys?.validationType === 'PAN') setValidationError = mm.validatePAN(message)
                else if (userChatHistorys?.validationType === 'GST') setValidationError = mm.validateGSTNumber(message)
                else if (userChatHistorys?.validationType === 'MOBILE_NO') setValidationError = mm.ValidateMobileNumber(message)
                else if (userChatHistorys?.validationType === 'DATE') setValidationError = mm.dateValidation(message)
                else if (userChatHistorys?.validationType === 'ADDRESS') setValidationError = true
                else if (userChatHistorys?.validationType === 'FREE_TEXT') setValidationError = true
                else if (userChatHistorys?.validationType === 'PINCODE') setValidationError = mm.checkPinCode(parseInt(message))
                else if (userChatHistorys?.validationType === 'OBJECT_ID') setValidationError = mm.isValidObjectId(message.split("_")[0])
                else setValidationError = true

                if (setValidationError) {
                    // main logic goes here
                    if (USER_INPUT != 0 || USER_INPUT != "#") {
                        if (userChatHistorys?.userInputSaveIn) {
                            const insertUserInputData = await userInputData.findOneAndUpdate({ botId: botId, mobileNo: userMobileNo, variableName: userChatHistorys?.userInputSaveIn }, { selectedValue: USER_INPUT }, { upsert: true }, { new: true })
                        }

                    }
                    const insertUserChatHistory = await userChatHistory.create({
                        botId: botId,
                        userId: userId,
                        userMobileNo: userMobileNo,
                        sender: "U",
                        messageContent: message,
                        messageDatetime: new Date(),
                        mainRedirectId: null,
                        redirectId: redirectIdNew,
                        prevRedirectId: redirectIdNew,
                    })
                    if (!insertUserChatHistory) {
                        callbackFunction('Failed to Insert In Chat History');
                    } else {
                        let redirectId = redirectIdNew?.split("_")[0];
                        if (redirectId === "000000000000000000000000") {
                            callbackFunction("Chatbot script not found")
                        } else {
                            async function processScript() {
                                const scriptData = await chatBotScript.findById(redirectId)
                                if (!scriptData) {
                                    callbackFunction("Chat script not found")
                                } else {
                                    if (scriptData.messageType === "TEXT") {
                                        let messageContent = await translateLanguageFunc(scriptData.messageDraft, selectLanguage)
                                        const insertAdminChatHistory = await userChatHistory.create({
                                            botId: botId,
                                            userId: userId,
                                            userMobileNo: userMobileNo,
                                            sender: "A",
                                            messageContent: messageContent,
                                            messageDatetime: new Date(),
                                            mainRedirectId: null,
                                            redirectId: scriptData.redirectId,
                                            userInputSaveIn: scriptData.variableName,
                                            validationType: scriptData.validationType,
                                            prevRedirectId: scriptData.prevRedirectId,
                                        })
                                        if (!insertAdminChatHistory) {
                                            callbackFunction("Failed to Insert Admin chat history")
                                        } else {
                                            mm.sendMSG(messageContent, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                                                if (error) {
                                                    console.log("Error in get method: ", error);
                                                    callbackFunction('Failed to send message');
                                                } else {
                                                    redirectId = scriptData.redirectId;
                                                    let waitTime = scriptData.waitTime;
                                                    if (waitTime !== null && waitTime > 0) {
                                                        setTimeout(processScript, waitTime);
                                                    } else {
                                                        callbackFunction(null, "Success");
                                                    }
                                                }
                                            });
                                        }
                                    } else if (scriptData.messageType === "IMAGE") {
                                        let caption = await translateLanguageFunc(scriptData.messageDraft, selectLanguage),
                                            mediaUrl = scriptData.mediaUrl
                                        const insertAdminChatHistory = await userChatHistory.create({
                                            botId: botId,
                                            userId: userId,
                                            userMobileNo: userMobileNo,
                                            sender: "A",
                                            messageContent: caption,
                                            mediaUrl: mediaUrl,
                                            messageDatetime: new Date(),
                                            mainRedirectId: null,
                                            redirectId: scriptData.redirectId,
                                            userInputSaveIn: scriptData.variableName,
                                            validationType: scriptData.validationType,
                                            prevRedirectId: scriptData.prevRedirectId,
                                        })
                                        if (!insertAdminChatHistory) {
                                            callbackFunction("Failed to Insert Admin chat history")
                                        } else {
                                            mm.sendMSGWithImage(mediaUrl, caption, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                                                if (error) {
                                                    console.log("Failed to send image message: ", error);
                                                    callbackFunction('Failed to send image message');
                                                } else {
                                                    redirectId = scriptData.redirectId;
                                                    let waitTime = scriptData.waitTime;
                                                    if (waitTime !== null && waitTime > 0) {
                                                        setTimeout(processScript, waitTime);
                                                    } else {
                                                        callbackFunction(null, "Success");
                                                    }
                                                }
                                            });
                                        }


                                    } else if (scriptData.messageType === "DOCUMENT") {
                                        let caption = await translateLanguageFunc(scriptData.messageDraft, selectLanguage),
                                            mediaUrl = scriptData.mediaUrl,
                                            filename = Date.now()
                                        const insertAdminChatHistory = await userChatHistory.create({
                                            botId: botId,
                                            userId: userId,
                                            userMobileNo: userMobileNo,
                                            sender: "A",
                                            messageContent: caption,
                                            mediaUrl: mediaUrl,
                                            messageDatetime: new Date(),
                                            mainRedirectId: scriptData.redirectId,
                                            redirectId: scriptData.redirectId,
                                            userInputSaveIn: scriptData.variableName,
                                            validationType: scriptData.validationType,
                                            prevRedirectId: scriptData.prevRedirectId,
                                        })
                                        if (!insertAdminChatHistory) {
                                            callbackFunction("Failed to Insert Admin chat history")
                                        } else {
                                            mm.sendDocumentMedia(caption, mediaUrl, filename, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                                                if (error) {
                                                    console.log("Failed to send Document message: ", error);
                                                    callbackFunction('Failed to send Document message');
                                                } else {
                                                    redirectId = scriptData.redirectId;
                                                    let waitTime = scriptData.waitTime;
                                                    if (waitTime !== null && waitTime > 0) {
                                                        setTimeout(processScript, waitTime);
                                                    } else {
                                                        callbackFunction(null, "Success");
                                                    }
                                                }
                                            });
                                        }
                                    } else if (scriptData.messageType === "BUTTON") {
                                        let messageContent = await translateLanguageFunc(scriptData.messageDraft, selectLanguage)
                                        let manyInsertArray = []
                                        let listData = []
                                        let arrayData = scriptData.buttonOrListData
                                        if (arrayData.length > 0) {
                                            for (let i = 0; i < arrayData.length; i++) {
                                                const element = arrayData[i];
                                                const trans = await translateLanguageFunc(element.optionName, selectLanguage)
                                                const object = {
                                                    botId: botId,
                                                    userId: userId,
                                                    userMobileNo: userMobileNo,
                                                    sender: "A",
                                                    messageContent: trans,
                                                    messageDatetime: new Date(),
                                                    mainRedirectId: element.id + "_" + (i + 1),
                                                    redirectId: element.id + "_" + (i + 1),
                                                    userInputSaveIn: scriptData.variableName,
                                                    validationType: scriptData.validationType,
                                                    prevRedirectId: scriptData.prevRedirectId,
                                                }
                                                manyInsertArray.push(object)
                                                const listObject = {
                                                    id: element.id + "_" + (i + 1),
                                                    optionName: trans
                                                }
                                                listData.push(listObject)
                                            }

                                            const insertAdminChatHistory = await userChatHistory.insertMany(manyInsertArray)
                                            if (!insertAdminChatHistory) {
                                                callbackFunction("Failed to Insert Admin chat history")
                                            } else {
                                                mm.sendInteractiveButtonMSG(messageContent, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, listData, wpClientId, botId, userId, planId, (error, result) => {
                                                    if (error) {
                                                        console.log("Failed to send Button message: ", error);
                                                        callbackFunction('Failed to send Button message');
                                                    } else {
                                                        redirectId = scriptData.redirectId;
                                                        let waitTime = scriptData.waitTime;
                                                        if (waitTime !== null && waitTime > 0) {
                                                            setTimeout(processScript, waitTime);
                                                        } else {
                                                            callbackFunction(null, "Success");
                                                        }
                                                    }
                                                });
                                            }
                                        } else {
                                            callbackFunction("Not Found buttonOrListData")
                                        }
                                    } else if (scriptData.messageType === "LIST") {
                                        let messageContent = await translateLanguageFunc(scriptData.messageDraft, selectLanguage)
                                        buttonText = await translateLanguageFunc(scriptData.listButtonName, selectLanguage),
                                            listData = [],
                                            manyInsertArray = [],
                                            arrayData = scriptData.buttonOrListData
                                        if (arrayData.length > 0) {
                                            for (let i = 0; i < arrayData.length; i++) {
                                                const element = arrayData[i];
                                                const trans = await translateLanguageFunc(element.optionName, selectLanguage)
                                                const object = {
                                                    botId: botId,
                                                    userId: userId,
                                                    userMobileNo: userMobileNo,
                                                    sender: "A",
                                                    messageContent: trans,
                                                    messageDatetime: new Date(),
                                                    mainRedirectId: element.id + "_" + (i + 1),
                                                    redirectId: element.id + "_" + (i + 1),
                                                    userInputSaveIn: scriptData.variableName,
                                                    validationType: scriptData.validationType,
                                                    prevRedirectId: scriptData.prevRedirectId,
                                                }
                                                manyInsertArray.push(object)
                                                const listObject = {
                                                    id: element.id + "_" + (i + 1),
                                                    optionName: trans
                                                }
                                                listData.push(listObject)

                                            }

                                            console.log("listData: ", listData);
                                            const insertAdminChatHistory = await userChatHistory.insertMany(manyInsertArray)
                                            if (!insertAdminChatHistory) {
                                                callbackFunction("Failed to Insert Admin chat history")
                                            }
                                            mm.sendInteractiveListMSGNew(messageContent, buttonText, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, listData, wpClientId, botId, userId, planId, (error, result) => {
                                                if (error) {
                                                    console.log("Failed to send Button message: ", error);
                                                    callbackFunction('Failed to send Button message');
                                                } else {
                                                    redirectId = scriptData.redirectId;
                                                    let waitTime = scriptData.waitTime;
                                                    if (waitTime !== null && waitTime > 0) {
                                                        setTimeout(processScript, waitTime);
                                                    } else {
                                                        callbackFunction(null, "Success");
                                                    }
                                                }
                                            });
                                        } else {
                                            callbackFunction("Not Found buttonOrListData")
                                        }
                                    } else if (scriptData.messageType === "API_DATA") {
                                        let bodyParams = scriptData.bodyParams;
                                        let keys = []
                                        if (bodyParams) {
                                            Object.keys(bodyParams).forEach((key) => {
                                                keys.push(bodyParams[key])
                                            })
                                        } else {
                                            keys.push("")
                                        }

                                        const resultInputData = await userInputData.find({ botId: botId, mobileNo: userMobileNo, variableName: { $in: keys } }).select({ selectedValue: 1, variableName: 1, _id: 0 })
                                        Object.keys(bodyParams).forEach((key) => {
                                            for (let i = 0; i < resultInputData.length; i++) {
                                                const element = resultInputData[i];
                                                if (bodyParams[key] === element.variableName) {
                                                    bodyParams[key] = element.selectedValue
                                                }
                                            }
                                        })

                                        const newObject = {
                                            ...bodyParams,
                                            ...limitObject
                                        }
                                        const requestOptions = {
                                            url: scriptData.apiUrl,
                                            method: scriptData.method,
                                            headers: scriptData.headerParams,
                                            body: newObject,
                                            json: true
                                        }
                                        request(requestOptions, async (error, response, body) => {
                                            if (error) {
                                                console.log("Error in request", error);
                                                callbackFunction("Failed to Request API Data")
                                            } else {
                                                if (response.statusCode === 200) {
                                                    let dataKey = scriptData?.sampleDataKey?.data,
                                                        dataId = scriptData?.sampleDataKey?.id,
                                                        dataName = scriptData?.sampleDataKey?.name,
                                                        dataDesc = scriptData?.sampleDataKey?.desc;
                                                    fileUrl = scriptData?.sampleDataKey?.fileUrl;
                                                    if (body[dataKey].length > 0) {
                                                        if (scriptData.messageSubType === "TEXT") {
                                                            let messageContent = await translateLanguageFunc(scriptData.messageDraft, selectLanguage)
                                                            const keyData = await flattenCartData(body[dataKey], messageContent, dataName, dataId, "", "")
                                                            const insertAdminChatHistory = await userChatHistory.create({
                                                                botId: botId,
                                                                userId: userId,
                                                                userMobileNo: userMobileNo,
                                                                sender: "A",
                                                                messageContent: keyData.stringValue,
                                                                messageDatetime: new Date(),
                                                                mainRedirectId: null,
                                                                redirectId: scriptData.redirectId,
                                                                userInputSaveIn: scriptData.variableName,
                                                                validationType: scriptData.validationType,
                                                                prevRedirectId: scriptData.prevRedirectId,
                                                            })
                                                            if (!insertAdminChatHistory) {
                                                                callbackFunction("Failed to Insert Admin chat history")
                                                            } else {
                                                                mm.sendMSG(keyData.stringValue, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                                                                    if (error) {
                                                                        console.log("Error in get method: ", error);
                                                                        callbackFunction('Failed to send message');
                                                                    } else {
                                                                        redirectId = scriptData.redirectId;
                                                                        let waitTime = scriptData.waitTime;
                                                                        if (waitTime !== null && waitTime > 0) {
                                                                            setTimeout(processScript, waitTime);
                                                                        } else {
                                                                            callbackFunction(null, "Success");
                                                                        }
                                                                    }
                                                                });
                                                            }
                                                        } else if (scriptData.messageSubType === "LIST") {
                                                            let messageContent = await translateLanguageFunc(scriptData.messageDraft, selectLanguage),
                                                                buttonText = await translateLanguageFunc(scriptData.listButtonName, selectLanguage),
                                                                listData = [],
                                                                manyInsertArray = []
                                                            for (let i = 0; i < body[dataKey].length; i++) {
                                                                const element = body[dataKey][i];

                                                                const object = {
                                                                    botId: botId,
                                                                    userId: userId,
                                                                    userMobileNo: userMobileNo,
                                                                    sender: "A",
                                                                    messageContent: element[dataName],
                                                                    messageDatetime: new Date(),
                                                                    mainRedirectId: scriptData.redirectId + "_" + (i + 1),
                                                                    redirectId: scriptData.redirectId + "_" + (i + 1),
                                                                    userInputSaveIn: scriptData.variableName,
                                                                    validationType: scriptData.validationType,
                                                                    prevRedirectId: scriptData.prevRedirectId,
                                                                }
                                                                manyInsertArray.push(object)
                                                                const listObject = {
                                                                    id: scriptData.redirectId + "_" + (i + 1),
                                                                    optionName: await translateLanguageFunc(element[dataName], selectLanguage),
                                                                    desc: await translateLanguageFunc(element[dataDesc], selectLanguage)
                                                                }
                                                                listData.push(listObject)
                                                            }

                                                            const insertAdminChatHistory = await userChatHistory.insertMany(manyInsertArray)
                                                            if (!insertAdminChatHistory) {
                                                                callbackFunction("Failed to Insert Admin chat history")
                                                            } else {
                                                                mm.sendInteractiveListMSGNew(messageContent, buttonText, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, listData, wpClientId, botId, userId, planId, (error, result) => {
                                                                    if (error) {
                                                                        console.log("Failed to send Button message: ", error);
                                                                        callbackFunction('Failed to send Button message');
                                                                    } else {
                                                                        redirectId = scriptData.redirectId;
                                                                        let waitTime = scriptData.waitTime;
                                                                        if (waitTime !== null && waitTime > 0) {
                                                                            setTimeout(processScript, waitTime);
                                                                        } else {
                                                                            callbackFunction(null, "Success");
                                                                        }
                                                                    }
                                                                });
                                                            }
                                                        } else if (scriptData.messageSubType === "DOCUMENT") {

                                                            const keyData = await flattenCartData(body[dataKey], scriptData.messageDraft, dataName, dataId, fileUrl, "")


                                                            console.log("keyData", keyData);
                                                            let caption = await translateLanguageFunc(keyData.stringValue, selectLanguage),
                                                                mediaUrl = keyData.fileUrlValue,
                                                                filename = Date.now()
                                                            const insertAdminChatHistory = await userChatHistory.create({
                                                                botId: botId,
                                                                userId: userId,
                                                                userMobileNo: userMobileNo,
                                                                sender: "A",
                                                                messageContent: caption,
                                                                mediaUrl: mediaUrl,
                                                                messageDatetime: new Date(),
                                                                mainRedirectId: scriptData.redirectId,
                                                                redirectId: scriptData.redirectId,
                                                                userInputSaveIn: scriptData.variableName,
                                                                validationType: scriptData.validationType,
                                                                prevRedirectId: scriptData.prevRedirectId,
                                                            })
                                                            if (!insertAdminChatHistory) {
                                                                callbackFunction("Failed to Insert Admin chat history")
                                                            } else {
                                                                mm.sendDocumentMedia(caption, mediaUrl, filename, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                                                                    if (error) {
                                                                        console.log("Failed to send Document message: ", error);
                                                                        callbackFunction('Failed to send Document message');
                                                                    } else {
                                                                        redirectId = scriptData.redirectId;
                                                                        let waitTime = scriptData.waitTime;
                                                                        if (waitTime !== null && waitTime > 0) {
                                                                            setTimeout(processScript, waitTime);
                                                                        } else {
                                                                            callbackFunction(null, "Success");
                                                                        }
                                                                    }
                                                                });
                                                            }
                                                        } else {
                                                            callbackFunction("messageSubType not matched")
                                                        }
                                                    } else {
                                                        callbackFunction("No Data Found")
                                                    }

                                                } else {
                                                    callbackFunction("Failed to send API Data")
                                                }
                                            }
                                        })
                                    } else {
                                        callbackFunction("messageType not matched")
                                    }
                                }

                            }

                            processScript()
                        }
                    }
                } else {
                    // restart the chat logic here
                    console.log("Restarting Not Found");
                    const res1 = await translateLanguageFunc("Please Enter/Select Valid input", selectLanguage)
                    mm.sendMSG(res1, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                        if (error) {
                            console.log("Error in get method: ", error);
                            callbackFunction('Failed to send validation message');
                        } else {
                            callbackFunction(null, "Success");
                        }
                    });
                    // restartMessage(redirectIdNew, "Please Enter/Select Valid input", userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, (err, result) => {
                    //     if (err) {
                    //         console.log("Err", err);
                    //         callbackFunction("Error in Restart message"+ err)
                    //     } else {
                    //         console.log("result", result);
                    //         callbackFunction(null, "success")
                    //     }
                    // })
                }
            } else {
                callbackFunction("Validation Not Found")
            }

        } else {

        }
    } catch (error) {
        console.log(error);
        callbackFunction(error);
    }
}

// if user reply from button
const buttonMessage = async (redirectSelectedId, selectedOption, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, callbackFunction) => {
    try {
        const userChatHistorys = await userChatHistory.findOne({ userMobileNo: userMobileNo, botId: botId, redirectId: redirectSelectedId }).sort({ _id: -1 }).limit(1)
        let redirectIdNew = userChatHistorys?.mainRedirectId ? userChatHistorys?.mainRedirectId : userChatHistorys?.redirectId
        if (USER_INPUT != 0 || USER_INPUT != "#") {
            if (userChatHistorys?.userInputSaveIn) {
                const insertUserInputData = await userInputData.findOneAndUpdate({ botId: botId, mobileNo: userMobileNo, variableName: userChatHistorys?.userInputSaveIn }, { selectedValue: selectedOption }, { upsert: true }, { new: true })
            }
        }
        const insertUserChatHistory = await userChatHistory.create({
            botId: botId,
            userId: userId,
            userMobileNo: userMobileNo,
            sender: "U",
            messageContent: selectedOption,
            messageDatetime: new Date(),
            mainRedirectId: null,
            redirectId: redirectIdNew,
            prevRedirectId: redirectIdNew,
        })
        if (!insertUserChatHistory) {
            callbackFunction('Failed to Insert In Chat History');
        } else {
            let redirectId = redirectIdNew?.split("_")[0];
            if (redirectId === "000000000000000000000000") {
                callbackFunction("Chatbot script not found")
            } else {
                async function processScript() {
                    const scriptData = await chatBotScript.findById(redirectId)
                    if (!scriptData) {
                        callbackFunction("Chat script not found")
                    } else {
                        if (scriptData.messageType === "TEXT") {
                            let messageContent = await translateLanguageFunc(scriptData.messageDraft, selectLanguage)
                            const insertAdminChatHistory = await userChatHistory.create({
                                botId: botId,
                                userId: userId,
                                userMobileNo: userMobileNo,
                                sender: "A",
                                messageContent: messageContent,
                                messageDatetime: new Date(),
                                mainRedirectId: null,
                                redirectId: scriptData.redirectId,
                                userInputSaveIn: scriptData.variableName,
                                validationType: scriptData.validationType,
                                prevRedirectId: scriptData.prevRedirectId,
                            })
                            if (!insertAdminChatHistory) {
                                callbackFunction("Failed to Insert Admin chat history")
                            } else {
                                mm.sendMSG(messageContent, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                                    if (error) {
                                        console.log("Error in get method: ", error);
                                        callbackFunction('Failed to send message');
                                    } else {
                                        redirectId = scriptData.redirectId;
                                        let waitTime = scriptData.waitTime;
                                        if (waitTime !== null && waitTime > 0) {
                                            setTimeout(processScript, waitTime);
                                        } else {
                                            callbackFunction(null, "Success");
                                        }
                                    }
                                });
                            }
                        } else if (scriptData.messageType === "IMAGE") {
                            let caption = await translateLanguageFunc(scriptData.messageDraft, selectLanguage),
                                mediaUrl = scriptData.mediaUrl
                            const insertAdminChatHistory = await userChatHistory.create({
                                botId: botId,
                                userId: userId,
                                userMobileNo: userMobileNo,
                                sender: "A",
                                messageContent: caption,
                                mediaUrl: mediaUrl,
                                messageDatetime: new Date(),
                                mainRedirectId: null,
                                redirectId: scriptData.redirectId,
                                userInputSaveIn: scriptData.variableName,
                                validationType: scriptData.validationType,
                                prevRedirectId: scriptData.prevRedirectId,
                            })
                            if (!insertAdminChatHistory) {
                                callbackFunction("Failed to Insert Admin chat history")
                            } else {
                                mm.sendMSGWithImage(mediaUrl, caption, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                                    if (error) {
                                        console.log("Failed to send image message: ", error);
                                        callbackFunction('Failed to send image message');
                                    } else {
                                        redirectId = scriptData.redirectId;
                                        let waitTime = scriptData.waitTime;
                                        if (waitTime !== null && waitTime > 0) {
                                            setTimeout(processScript, waitTime);
                                        } else {
                                            callbackFunction(null, "Success");
                                        }
                                    }
                                });
                            }


                        } else if (scriptData.messageType === "DOCUMENT") {
                            let caption = await translateLanguageFunc(scriptData.messageDraft, selectLanguage),
                                mediaUrl = scriptData.mediaUrl,
                                filename = Date.now()
                            const insertAdminChatHistory = await userChatHistory.create({
                                botId: botId,
                                userId: userId,
                                userMobileNo: userMobileNo,
                                sender: "A",
                                messageContent: caption,
                                mediaUrl: mediaUrl,
                                messageDatetime: new Date(),
                                mainRedirectId: scriptData.redirectId,
                                redirectId: scriptData.redirectId,
                                userInputSaveIn: scriptData.variableName,
                                validationType: scriptData.validationType,
                                prevRedirectId: scriptData.prevRedirectId,
                            })
                            if (!insertAdminChatHistory) {
                                callbackFunction("Failed to Insert Admin chat history")
                            } else {
                                mm.sendDocumentMedia(caption, mediaUrl, filename, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                                    if (error) {
                                        console.log("Failed to send Document message: ", error);
                                        callbackFunction('Failed to send Document message');
                                    } else {
                                        redirectId = scriptData.redirectId;
                                        let waitTime = scriptData.waitTime;
                                        if (waitTime !== null && waitTime > 0) {
                                            setTimeout(processScript, waitTime);
                                        } else {
                                            callbackFunction(null, "Success");
                                        }
                                    }
                                });
                            }
                        } else if (scriptData.messageType === "BUTTON") {
                            let messageContent = await translateLanguageFunc(scriptData.messageDraft, selectLanguage)
                            let manyInsertArray = []
                            let listData = []
                            let arrayData = scriptData.buttonOrListData
                            if (arrayData.length > 0) {
                                for (let i = 0; i < arrayData.length; i++) {
                                    const element = arrayData[i];
                                    const trans = await translateLanguageFunc(element.optionName, selectLanguage)
                                    const object = {
                                        botId: botId,
                                        userId: userId,
                                        userMobileNo: userMobileNo,
                                        sender: "A",
                                        messageContent: trans,
                                        messageDatetime: new Date(),
                                        mainRedirectId: element.id + "_" + (i + 1),
                                        redirectId: element.id + "_" + (i + 1),
                                        userInputSaveIn: scriptData.variableName,
                                        validationType: scriptData.validationType,
                                        prevRedirectId: scriptData.prevRedirectId,
                                    }
                                    manyInsertArray.push(object)
                                    const listObject = {
                                        id: element.id + "_" + (i + 1),
                                        optionName: trans
                                    }
                                    listData.push(listObject)
                                }

                                const insertAdminChatHistory = await userChatHistory.insertMany(manyInsertArray)
                                if (!insertAdminChatHistory) {
                                    callbackFunction("Failed to Insert Admin chat history")
                                } else {
                                    mm.sendInteractiveButtonMSG(messageContent, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, listData, wpClientId, botId, userId, planId, (error, result) => {
                                        if (error) {
                                            console.log("Failed to send Button message: ", error);
                                            callbackFunction('Failed to send Button message');
                                        } else {
                                            redirectId = scriptData.redirectId;
                                            let waitTime = scriptData.waitTime;
                                            if (waitTime !== null && waitTime > 0) {
                                                setTimeout(processScript, waitTime);
                                            } else {
                                                callbackFunction(null, "Success");
                                            }
                                        }
                                    });
                                }
                            } else {
                                callbackFunction("Not Found buttonOrListData")
                            }
                        } else if (scriptData.messageType === "LIST") {
                            let messageContent = await translateLanguageFunc(scriptData.messageDraft, selectLanguage)
                            buttonText = await translateLanguageFunc(scriptData.listButtonName, selectLanguage),
                                listData = [],
                                manyInsertArray = [],
                                arrayData = scriptData.buttonOrListData
                            if (arrayData.length > 0) {
                                for (let i = 0; i < arrayData.length; i++) {
                                    const element = arrayData[i];
                                    const trans = await translateLanguageFunc(element.optionName, selectLanguage)
                                    const object = {
                                        botId: botId,
                                        userId: userId,
                                        userMobileNo: userMobileNo,
                                        sender: "A",
                                        messageContent: trans,
                                        messageDatetime: new Date(),
                                        mainRedirectId: element.id + "_" + (i + 1),
                                        redirectId: element.id + "_" + (i + 1),
                                        userInputSaveIn: scriptData.variableName,
                                        validationType: scriptData.validationType,
                                        prevRedirectId: scriptData.prevRedirectId,
                                    }
                                    manyInsertArray.push(object)
                                    const listObject = {
                                        id: element.id + "_" + (i + 1),
                                        optionName: trans
                                    }
                                    listData.push(listObject)

                                }

                                console.log("listData: ", listData);
                                const insertAdminChatHistory = await userChatHistory.insertMany(manyInsertArray)
                                if (!insertAdminChatHistory) {
                                    callbackFunction("Failed to Insert Admin chat history")
                                }
                                mm.sendInteractiveListMSGNew(messageContent, buttonText, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, listData, wpClientId, botId, userId, planId, (error, result) => {
                                    if (error) {
                                        console.log("Failed to send Button message: ", error);
                                        callbackFunction('Failed to send Button message');
                                    } else {
                                        redirectId = scriptData.redirectId;
                                        let waitTime = scriptData.waitTime;
                                        if (waitTime !== null && waitTime > 0) {
                                            setTimeout(processScript, waitTime);
                                        } else {
                                            callbackFunction(null, "Success");
                                        }
                                    }
                                });
                            } else {
                                callbackFunction("Not Found buttonOrListData")
                            }
                        } else if (scriptData.messageType === "API_DATA") {
                            let bodyParams = scriptData.bodyParams;
                            let keys = []
                            if (bodyParams) {
                                Object.keys(bodyParams).forEach((key) => {
                                    keys.push(bodyParams[key])
                                })
                            } else {
                                keys.push("")
                            }

                            const resultInputData = await userInputData.find({ botId: botId, mobileNo: userMobileNo, variableName: { $in: keys } }).select({ selectedValue: 1, variableName: 1, _id: 0 })
                            Object.keys(bodyParams).forEach((key) => {
                                for (let i = 0; i < resultInputData.length; i++) {
                                    const element = resultInputData[i];
                                    if (bodyParams[key] === element.variableName) {
                                        bodyParams[key] = element.selectedValue
                                    }
                                }
                            })

                            const newObject = {
                                ...bodyParams,
                                ...limitObject
                            }
                            const requestOptions = {
                                url: scriptData.apiUrl,
                                method: scriptData.method,
                                headers: scriptData.headerParams,
                                body: newObject,
                                json: true
                            }
                            request(requestOptions, async (error, response, body) => {
                                if (error) {
                                    console.log("Error in request", error);
                                    callbackFunction("Failed to Request API Data")
                                } else {
                                    if (response.statusCode === 200) {
                                        let dataKey = scriptData?.sampleDataKey?.data,
                                            dataId = scriptData?.sampleDataKey?.id,
                                            dataName = scriptData?.sampleDataKey?.name,
                                            dataDesc = scriptData?.sampleDataKey?.desc;
                                        fileUrl = scriptData?.sampleDataKey?.fileUrl;
                                        if (body[dataKey].length > 0) {
                                            if (scriptData.messageSubType === "TEXT") {
                                                let messageContent = await translateLanguageFunc(scriptData.messageDraft, selectLanguage)
                                                const keyData = await flattenCartData(body[dataKey], messageContent, dataName, dataId, "", "")
                                                const insertAdminChatHistory = await userChatHistory.create({
                                                    botId: botId,
                                                    userId: userId,
                                                    userMobileNo: userMobileNo,
                                                    sender: "A",
                                                    messageContent: keyData.stringValue,
                                                    messageDatetime: new Date(),
                                                    mainRedirectId: null,
                                                    redirectId: scriptData.redirectId,
                                                    userInputSaveIn: scriptData.variableName,
                                                    validationType: scriptData.validationType,
                                                    prevRedirectId: scriptData.prevRedirectId,
                                                })
                                                if (!insertAdminChatHistory) {
                                                    callbackFunction("Failed to Insert Admin chat history")
                                                } else {
                                                    mm.sendMSG(keyData.stringValue, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                                                        if (error) {
                                                            console.log("Error in get method: ", error);
                                                            callbackFunction('Failed to send message');
                                                        } else {
                                                            redirectId = scriptData.redirectId;
                                                            let waitTime = scriptData.waitTime;
                                                            if (waitTime !== null && waitTime > 0) {
                                                                setTimeout(processScript, waitTime);
                                                            } else {
                                                                callbackFunction(null, "Success");
                                                            }
                                                        }
                                                    });
                                                }
                                            } else if (scriptData.messageSubType === "LIST") {
                                                let messageContent = await translateLanguageFunc(scriptData.messageDraft, selectLanguage),
                                                    buttonText = await translateLanguageFunc(scriptData.listButtonName, selectLanguage),
                                                    listData = [],
                                                    manyInsertArray = []
                                                for (let i = 0; i < body[dataKey].length; i++) {
                                                    const element = body[dataKey][i];

                                                    const object = {
                                                        botId: botId,
                                                        userId: userId,
                                                        userMobileNo: userMobileNo,
                                                        sender: "A",
                                                        messageContent: element[dataName],
                                                        messageDatetime: new Date(),
                                                        mainRedirectId: scriptData.redirectId + "_" + (i + 1),
                                                        redirectId: scriptData.redirectId + "_" + (i + 1),
                                                        userInputSaveIn: scriptData.variableName,
                                                        validationType: scriptData.validationType,
                                                        prevRedirectId: scriptData.prevRedirectId,
                                                    }
                                                    manyInsertArray.push(object)
                                                    const listObject = {
                                                        id: scriptData.redirectId + "_" + (i + 1),
                                                        optionName: await translateLanguageFunc(element[dataName], selectLanguage),
                                                        desc: await translateLanguageFunc(element[dataDesc], selectLanguage)
                                                    }
                                                    listData.push(listObject)
                                                }

                                                const insertAdminChatHistory = await userChatHistory.insertMany(manyInsertArray)
                                                if (!insertAdminChatHistory) {
                                                    callbackFunction("Failed to Insert Admin chat history")
                                                } else {
                                                    mm.sendInteractiveListMSGNew(messageContent, buttonText, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, listData, wpClientId, botId, userId, planId, (error, result) => {
                                                        if (error) {
                                                            console.log("Failed to send Button message: ", error);
                                                            callbackFunction('Failed to send Button message');
                                                        } else {
                                                            redirectId = scriptData.redirectId;
                                                            let waitTime = scriptData.waitTime;
                                                            if (waitTime !== null && waitTime > 0) {
                                                                setTimeout(processScript, waitTime);
                                                            } else {
                                                                callbackFunction(null, "Success");
                                                            }
                                                        }
                                                    });
                                                }
                                            } else if (scriptData.messageSubType === "DOCUMENT") {

                                                const keyData = await flattenCartData(body[dataKey], scriptData.messageDraft, dataName, dataId, fileUrl, "")


                                                console.log("keyData", keyData);
                                                let caption = await translateLanguageFunc(keyData.stringValue, selectLanguage),
                                                    mediaUrl = keyData.fileUrlValue,
                                                    filename = Date.now()
                                                const insertAdminChatHistory = await userChatHistory.create({
                                                    botId: botId,
                                                    userId: userId,
                                                    userMobileNo: userMobileNo,
                                                    sender: "A",
                                                    messageContent: caption,
                                                    mediaUrl: mediaUrl,
                                                    messageDatetime: new Date(),
                                                    mainRedirectId: scriptData.redirectId,
                                                    redirectId: scriptData.redirectId,
                                                    userInputSaveIn: scriptData.variableName,
                                                    validationType: scriptData.validationType,
                                                    prevRedirectId: scriptData.prevRedirectId,
                                                })
                                                if (!insertAdminChatHistory) {
                                                    callbackFunction("Failed to Insert Admin chat history")
                                                } else {
                                                    mm.sendDocumentMedia(caption, mediaUrl, filename, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                                                        if (error) {
                                                            console.log("Failed to send Document message: ", error);
                                                            callbackFunction('Failed to send Document message');
                                                        } else {
                                                            redirectId = scriptData.redirectId;
                                                            let waitTime = scriptData.waitTime;
                                                            if (waitTime !== null && waitTime > 0) {
                                                                setTimeout(processScript, waitTime);
                                                            } else {
                                                                callbackFunction(null, "Success");
                                                            }
                                                        }
                                                    });
                                                }
                                            } else {
                                                callbackFunction("messageSubType not matched")
                                            }
                                        } else {
                                            callbackFunction("No Data Found")
                                        }

                                    } else {
                                        callbackFunction("Failed to send API Data")
                                    }
                                }
                            })
                        } else {
                            callbackFunction("messageType not matched")
                        }
                    }

                }

                processScript()
            }
        }
    } catch (error) {
        console.log(error);
        callbackFunction("Something went wrong in Button Function" + error);
    }
}

// if user reply from list message
const ListMessage = async (redirectSelectedId, selectedOption, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, callbackFunction) => {
    try {
        const userChatHistorys = await userChatHistory.findOne({ userMobileNo: userMobileNo, botId: botId, redirectId: redirectSelectedId }).sort({ _id: -1 }).limit(1)
        let redirectIdNew = userChatHistorys?.mainRedirectId ? userChatHistorys?.mainRedirectId : userChatHistorys?.redirectId
        if (USER_INPUT != 0 || USER_INPUT != "#") {
            if (userChatHistorys?.userInputSaveIn) {
                const insertUserInputData = await userInputData.findOneAndUpdate({ botId: botId, mobileNo: userMobileNo, variableName: userChatHistorys?.userInputSaveIn }, { selectedValue: selectedOption }, { upsert: true }, { new: true })
            }
        }
        const insertUserChatHistory = await userChatHistory.create({
            botId: botId,
            userId: userId,
            userMobileNo: userMobileNo,
            sender: "U",
            messageContent: selectedOption,
            messageDatetime: new Date(),
            mainRedirectId: null,
            redirectId: redirectIdNew,
            prevRedirectId: redirectIdNew,
        })

        if (!insertUserChatHistory) {
            callbackFunction('Failed to Insert In Chat History');
        } else {
            let redirectId = redirectIdNew?.split("_")[0];
            if (redirectId === "000000000000000000000000") {
                callbackFunction("Chatbot script not found")
            } else {
                async function processScript() {
                    const scriptData = await chatBotScript.findById(redirectId)
                    if (!scriptData) {
                        callbackFunction("Chat script not found")
                    } else {
                        if (scriptData.messageType === "TEXT") {
                            let messageContent = await translateLanguageFunc(scriptData.messageDraft, selectLanguage)
                            const insertAdminChatHistory = await userChatHistory.create({
                                botId: botId,
                                userId: userId,
                                userMobileNo: userMobileNo,
                                sender: "A",
                                messageContent: messageContent,
                                messageDatetime: new Date(),
                                mainRedirectId: null,
                                redirectId: scriptData.redirectId,
                                userInputSaveIn: scriptData.variableName,
                                validationType: scriptData.validationType,
                                prevRedirectId: scriptData.prevRedirectId,
                            })
                            if (!insertAdminChatHistory) {
                                callbackFunction("Failed to Insert Admin chat history")
                            } else {
                                mm.sendMSG(messageContent, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                                    if (error) {
                                        console.log("Error in get method: ", error);
                                        callbackFunction('Failed to send message');
                                    } else {
                                        redirectId = scriptData.redirectId;
                                        let waitTime = scriptData.waitTime;
                                        if (waitTime !== null && waitTime > 0) {
                                            setTimeout(processScript, waitTime);
                                        } else {
                                            callbackFunction(null, "Success");
                                        }
                                    }
                                });
                            }
                        } else if (scriptData.messageType === "IMAGE") {
                            let caption = await translateLanguageFunc(scriptData.messageDraft, selectLanguage),
                                mediaUrl = scriptData.mediaUrl
                            const insertAdminChatHistory = await userChatHistory.create({
                                botId: botId,
                                userId: userId,
                                userMobileNo: userMobileNo,
                                sender: "A",
                                messageContent: caption,
                                mediaUrl: mediaUrl,
                                messageDatetime: new Date(),
                                mainRedirectId: null,
                                redirectId: scriptData.redirectId,
                                userInputSaveIn: scriptData.variableName,
                                validationType: scriptData.validationType,
                                prevRedirectId: scriptData.prevRedirectId,
                            })
                            if (!insertAdminChatHistory) {
                                callbackFunction("Failed to Insert Admin chat history")
                            } else {
                                mm.sendMSGWithImage(mediaUrl, caption, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                                    if (error) {
                                        console.log("Failed to send image message: ", error);
                                        callbackFunction('Failed to send image message');
                                    } else {
                                        redirectId = scriptData.redirectId;
                                        let waitTime = scriptData.waitTime;
                                        if (waitTime !== null && waitTime > 0) {
                                            setTimeout(processScript, waitTime);
                                        } else {
                                            callbackFunction(null, "Success");
                                        }
                                    }
                                });
                            }


                        } else if (scriptData.messageType === "DOCUMENT") {
                            let caption = await translateLanguageFunc(scriptData.messageDraft, selectLanguage),
                                mediaUrl = scriptData.mediaUrl,
                                filename = Date.now()
                            const insertAdminChatHistory = await userChatHistory.create({
                                botId: botId,
                                userId: userId,
                                userMobileNo: userMobileNo,
                                sender: "A",
                                messageContent: caption,
                                mediaUrl: mediaUrl,
                                messageDatetime: new Date(),
                                mainRedirectId: scriptData.redirectId,
                                redirectId: scriptData.redirectId,
                                userInputSaveIn: scriptData.variableName,
                                validationType: scriptData.validationType,
                                prevRedirectId: scriptData.prevRedirectId,
                            })
                            if (!insertAdminChatHistory) {
                                callbackFunction("Failed to Insert Admin chat history")
                            } else {
                                mm.sendDocumentMedia(caption, mediaUrl, filename, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                                    if (error) {
                                        console.log("Failed to send Document message: ", error);
                                        callbackFunction('Failed to send Document message');
                                    } else {
                                        redirectId = scriptData.redirectId;
                                        let waitTime = scriptData.waitTime;
                                        if (waitTime !== null && waitTime > 0) {
                                            setTimeout(processScript, waitTime);
                                        } else {
                                            callbackFunction(null, "Success");
                                        }
                                    }
                                });
                            }
                        } else if (scriptData.messageType === "BUTTON") {
                            let messageContent = await translateLanguageFunc(scriptData.messageDraft, selectLanguage)
                            let manyInsertArray = []
                            let listData = []
                            let arrayData = scriptData.buttonOrListData
                            if (arrayData.length > 0) {
                                for (let i = 0; i < arrayData.length; i++) {
                                    const element = arrayData[i];
                                    const trans = await translateLanguageFunc(element.optionName, selectLanguage)
                                    const object = {
                                        botId: botId,
                                        userId: userId,
                                        userMobileNo: userMobileNo,
                                        sender: "A",
                                        messageContent: trans,
                                        messageDatetime: new Date(),
                                        mainRedirectId: element.id + "_" + (i + 1),
                                        redirectId: element.id + "_" + (i + 1),
                                        userInputSaveIn: scriptData.variableName,
                                        validationType: scriptData.validationType,
                                        prevRedirectId: scriptData.prevRedirectId,
                                    }
                                    manyInsertArray.push(object)
                                    const listObject = {
                                        id: element.id + "_" + (i + 1),
                                        optionName: trans
                                    }
                                    listData.push(listObject)
                                }

                                const insertAdminChatHistory = await userChatHistory.insertMany(manyInsertArray)
                                if (!insertAdminChatHistory) {
                                    callbackFunction("Failed to Insert Admin chat history")
                                } else {
                                    mm.sendInteractiveButtonMSG(messageContent, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, listData, wpClientId, botId, userId, planId, (error, result) => {
                                        if (error) {
                                            console.log("Failed to send Button message: ", error);
                                            callbackFunction('Failed to send Button message');
                                        } else {
                                            redirectId = scriptData.redirectId;
                                            let waitTime = scriptData.waitTime;
                                            if (waitTime !== null && waitTime > 0) {
                                                setTimeout(processScript, waitTime);
                                            } else {
                                                callbackFunction(null, "Success");
                                            }
                                        }
                                    });
                                }
                            } else {
                                callbackFunction("Not Found buttonOrListData")
                            }
                        } else if (scriptData.messageType === "LIST") {
                            let messageContent = await translateLanguageFunc(scriptData.messageDraft, selectLanguage)
                            buttonText = await translateLanguageFunc(scriptData.listButtonName, selectLanguage),
                                listData = [],
                                manyInsertArray = [],
                                arrayData = scriptData.buttonOrListData
                            if (arrayData.length > 0) {
                                for (let i = 0; i < arrayData.length; i++) {
                                    const element = arrayData[i];
                                    const trans = await translateLanguageFunc(element.optionName, selectLanguage)
                                    const object = {
                                        botId: botId,
                                        userId: userId,
                                        userMobileNo: userMobileNo,
                                        sender: "A",
                                        messageContent: trans,
                                        messageDatetime: new Date(),
                                        mainRedirectId: element.id + "_" + (i + 1),
                                        redirectId: element.id + "_" + (i + 1),
                                        userInputSaveIn: scriptData.variableName,
                                        validationType: scriptData.validationType,
                                        prevRedirectId: scriptData.prevRedirectId,
                                    }
                                    manyInsertArray.push(object)
                                    const listObject = {
                                        id: element.id + "_" + (i + 1),
                                        optionName: trans
                                    }
                                    listData.push(listObject)

                                }

                                console.log("listData: ", listData);
                                const insertAdminChatHistory = await userChatHistory.insertMany(manyInsertArray)
                                if (!insertAdminChatHistory) {
                                    callbackFunction("Failed to Insert Admin chat history")
                                }
                                mm.sendInteractiveListMSGNew(messageContent, buttonText, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, listData, wpClientId, botId, userId, planId, (error, result) => {
                                    if (error) {
                                        console.log("Failed to send Button message: ", error);
                                        callbackFunction('Failed to send Button message');
                                    } else {
                                        redirectId = scriptData.redirectId;
                                        let waitTime = scriptData.waitTime;
                                        if (waitTime !== null && waitTime > 0) {
                                            setTimeout(processScript, waitTime);
                                        } else {
                                            callbackFunction(null, "Success");
                                        }
                                    }
                                });
                            } else {
                                callbackFunction("Not Found buttonOrListData")
                            }
                        } else if (scriptData.messageType === "API_DATA") {
                            let bodyParams = scriptData.bodyParams;
                            let keys = []
                            if (bodyParams) {
                                Object.keys(bodyParams).forEach((key) => {
                                    keys.push(bodyParams[key])
                                })
                            } else {
                                keys.push("")
                            }

                            const resultInputData = await userInputData.find({ botId: botId, mobileNo: userMobileNo, variableName: { $in: keys } }).select({ selectedValue: 1, variableName: 1, _id: 0 })
                            Object.keys(bodyParams).forEach((key) => {
                                for (let i = 0; i < resultInputData.length; i++) {
                                    const element = resultInputData[i];
                                    if (bodyParams[key] === element.variableName) {
                                        bodyParams[key] = element.selectedValue
                                    }
                                }
                            })

                            const newObject = {
                                ...bodyParams,
                                ...limitObject
                            }
                            const requestOptions = {
                                url: scriptData.apiUrl,
                                method: scriptData.method,
                                headers: scriptData.headerParams,
                                body: newObject,
                                json: true
                            }
                            request(requestOptions, async (error, response, body) => {
                                if (error) {
                                    console.log("Error in request", error);
                                    callbackFunction("Failed to Request API Data")
                                } else {
                                    if (response.statusCode === 200) {
                                        let dataKey = scriptData?.sampleDataKey?.data,
                                            dataId = scriptData?.sampleDataKey?.id,
                                            dataName = scriptData?.sampleDataKey?.name,
                                            dataDesc = scriptData?.sampleDataKey?.desc;
                                        fileUrl = scriptData?.sampleDataKey?.fileUrl;
                                        if (body[dataKey].length > 0) {
                                            if (scriptData.messageSubType === "TEXT") {
                                                let messageContent = await translateLanguageFunc(scriptData.messageDraft, selectLanguage)
                                                const keyData = await flattenCartData(body[dataKey], messageContent, dataName, dataId, "", "")
                                                const insertAdminChatHistory = await userChatHistory.create({
                                                    botId: botId,
                                                    userId: userId,
                                                    userMobileNo: userMobileNo,
                                                    sender: "A",
                                                    messageContent: keyData.stringValue,
                                                    messageDatetime: new Date(),
                                                    mainRedirectId: null,
                                                    redirectId: scriptData.redirectId,
                                                    userInputSaveIn: scriptData.variableName,
                                                    validationType: scriptData.validationType,
                                                    prevRedirectId: scriptData.prevRedirectId,
                                                })
                                                if (!insertAdminChatHistory) {
                                                    callbackFunction("Failed to Insert Admin chat history")
                                                } else {
                                                    mm.sendMSG(keyData.stringValue, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                                                        if (error) {
                                                            console.log("Error in get method: ", error);
                                                            callbackFunction('Failed to send message');
                                                        } else {
                                                            redirectId = scriptData.redirectId;
                                                            let waitTime = scriptData.waitTime;
                                                            if (waitTime !== null && waitTime > 0) {
                                                                setTimeout(processScript, waitTime);
                                                            } else {
                                                                callbackFunction(null, "Success");
                                                            }
                                                        }
                                                    });
                                                }
                                            } else if (scriptData.messageSubType === "LIST") {
                                                let messageContent = await translateLanguageFunc(scriptData.messageDraft, selectLanguage),
                                                    buttonText = await translateLanguageFunc(scriptData.listButtonName, selectLanguage),
                                                    listData = [],
                                                    manyInsertArray = []
                                                for (let i = 0; i < body[dataKey].length; i++) {
                                                    const element = body[dataKey][i];

                                                    const object = {
                                                        botId: botId,
                                                        userId: userId,
                                                        userMobileNo: userMobileNo,
                                                        sender: "A",
                                                        messageContent: element[dataName],
                                                        messageDatetime: new Date(),
                                                        mainRedirectId: scriptData.redirectId + "_" + (i + 1),
                                                        redirectId: scriptData.redirectId + "_" + (i + 1),
                                                        userInputSaveIn: scriptData.variableName,
                                                        validationType: scriptData.validationType,
                                                        prevRedirectId: scriptData.prevRedirectId,
                                                    }
                                                    manyInsertArray.push(object)
                                                    const listObject = {
                                                        id: scriptData.redirectId + "_" + (i + 1),
                                                        optionName: await translateLanguageFunc(element[dataName], selectLanguage),
                                                        desc: await translateLanguageFunc(element[dataDesc], selectLanguage)
                                                    }
                                                    listData.push(listObject)
                                                }

                                                const insertAdminChatHistory = await userChatHistory.insertMany(manyInsertArray)
                                                if (!insertAdminChatHistory) {
                                                    callbackFunction("Failed to Insert Admin chat history")
                                                } else {
                                                    mm.sendInteractiveListMSGNew(messageContent, buttonText, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, listData, wpClientId, botId, userId, planId, (error, result) => {
                                                        if (error) {
                                                            console.log("Failed to send Button message: ", error);
                                                            callbackFunction('Failed to send Button message');
                                                        } else {
                                                            redirectId = scriptData.redirectId;
                                                            let waitTime = scriptData.waitTime;
                                                            if (waitTime !== null && waitTime > 0) {
                                                                setTimeout(processScript, waitTime);
                                                            } else {
                                                                callbackFunction(null, "Success");
                                                            }
                                                        }
                                                    });
                                                }
                                            } else if (scriptData.messageSubType === "DOCUMENT") {

                                                const keyData = await flattenCartData(body[dataKey], scriptData.messageDraft, dataName, dataId, fileUrl, "")


                                                console.log("keyData", keyData);
                                                let caption = await translateLanguageFunc(keyData.stringValue, selectLanguage),
                                                    mediaUrl = keyData.fileUrlValue,
                                                    filename = Date.now()
                                                const insertAdminChatHistory = await userChatHistory.create({
                                                    botId: botId,
                                                    userId: userId,
                                                    userMobileNo: userMobileNo,
                                                    sender: "A",
                                                    messageContent: caption,
                                                    mediaUrl: mediaUrl,
                                                    messageDatetime: new Date(),
                                                    mainRedirectId: scriptData.redirectId,
                                                    redirectId: scriptData.redirectId,
                                                    userInputSaveIn: scriptData.variableName,
                                                    validationType: scriptData.validationType,
                                                    prevRedirectId: scriptData.prevRedirectId,
                                                })
                                                if (!insertAdminChatHistory) {
                                                    callbackFunction("Failed to Insert Admin chat history")
                                                } else {
                                                    mm.sendDocumentMedia(caption, mediaUrl, filename, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                                                        if (error) {
                                                            console.log("Failed to send Document message: ", error);
                                                            callbackFunction('Failed to send Document message');
                                                        } else {
                                                            redirectId = scriptData.redirectId;
                                                            let waitTime = scriptData.waitTime;
                                                            if (waitTime !== null && waitTime > 0) {
                                                                setTimeout(processScript, waitTime);
                                                            } else {
                                                                callbackFunction(null, "Success");
                                                            }
                                                        }
                                                    });
                                                }
                                            } else {
                                                callbackFunction("messageSubType not matched")
                                            }
                                        } else {
                                            callbackFunction("No Data Found")
                                        }

                                    } else {
                                        callbackFunction("Failed to send API Data")
                                    }
                                }
                            })
                        } else {
                            callbackFunction("messageType not matched")
                        }
                    }

                }

                processScript()
            }
        }
    } catch (error) {
        console.log(error);
        callbackFunction(callbackFunction("Something went wrong in List Function" + error));
    }
}

// for restarting a conversation
const restartMessage = async (restartId, errorMessage, from, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, callbackFunction) => {
    try {

        let redirectId = restartId
        async function processScript() {
            const scriptData = await chatBotScript.findById(redirectId)
            if (!scriptData) {
                callbackFunction("Chat script not found")
            } else {
                if (scriptData.messageType === "TEXT") {
                    let messageContent = scriptData.messageDraft
                    const insertAdminChatHistory = await userChatHistory.create({
                        botId: botId,
                        userId: userId,
                        userMobileNo: userMobileNo,
                        sender: "A",
                        messageContent: messageContent,
                        messageDatetime: new Date(),
                        mainRedirectId: null,
                        redirectId: scriptData.redirectId,
                        userInputSaveIn: scriptData.variableName,
                        validationType: scriptData.validationType,
                        prevRedirectId: scriptData.prevRedirectId,
                    })
                    if (!insertAdminChatHistory) {
                        callbackFunction("Failed to Insert Admin chat history")
                    } else {
                        mm.sendMSG(messageContent, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, (error, result) => {
                            if (error) {
                                console.log("Error in get method: ", error);
                                callbackFunction('Failed to send message');
                            } else {
                                redirectId = scriptData.redirectId;
                                let waitTime = scriptData.waitTime;
                                if (waitTime !== null && waitTime > 0) {
                                    setTimeout(processScript, waitTime);
                                } else {
                                    callbackFunction(null, "Success");
                                }
                            }
                        });
                    }
                } else if (scriptData.messageType === "IMAGE") {
                    let caption = scriptData.messageDraft,
                        mediaUrl = scriptData.mediaUrl
                    const insertAdminChatHistory = await userChatHistory.create({
                        botId: botId,
                        userId: userId,
                        userMobileNo: userMobileNo,
                        sender: "A",
                        messageContent: caption,
                        mediaUrl: mediaUrl,
                        messageDatetime: new Date(),
                        mainRedirectId: null,
                        redirectId: scriptData.redirectId,
                        userInputSaveIn: scriptData.variableName,
                        validationType: scriptData.validationType,
                        prevRedirectId: scriptData.prevRedirectId,
                    })
                    if (!insertAdminChatHistory) {
                        callbackFunction("Failed to Insert Admin chat history")
                    } else {
                        mm.sendMSGWithImage(mediaUrl, caption, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, (error, result) => {
                            if (error) {
                                console.log("Failed to send image message: ", error);
                                callbackFunction('Failed to send image message');
                            } else {
                                redirectId = scriptData.redirectId;
                                let waitTime = scriptData.waitTime;
                                if (waitTime !== null && waitTime > 0) {
                                    setTimeout(processScript, waitTime);
                                } else {
                                    callbackFunction(null, "Success");
                                }
                            }
                        });
                    }


                } else if (scriptData.messageType === "DOCUMENT") {
                    let caption = scriptData.messageDraft,
                        mediaUrl = scriptData.mediaUrl,
                        filename = Date.now()
                    const insertAdminChatHistory = await userChatHistory.create({
                        botId: botId,
                        userId: userId,
                        userMobileNo: userMobileNo,
                        sender: "A",
                        messageContent: caption,
                        mediaUrl: mediaUrl,
                        messageDatetime: new Date(),
                        mainRedirectId: null,
                        redirectId: scriptData.redirectId,
                        userInputSaveIn: scriptData.variableName,
                        validationType: scriptData.validationType,
                        prevRedirectId: scriptData.prevRedirectId,
                    })
                    if (!insertAdminChatHistory) {
                        callbackFunction("Failed to Insert Admin chat history")
                    } else {
                        mm.sendDocumentMedia(caption, mediaUrl, filename, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, (error, result) => {
                            if (error) {
                                console.log("Failed to send Document message: ", error);
                                callbackFunction('Failed to send Document message');
                            } else {
                                redirectId = scriptData.redirectId;
                                let waitTime = scriptData.waitTime;
                                if (waitTime !== null && waitTime > 0) {
                                    setTimeout(processScript, waitTime);
                                } else {
                                    callbackFunction(null, "Success");
                                }
                            }
                        });
                    }
                } else if (scriptData.messageType === "BUTTON") {
                    let messageContent = scriptData.messageDraft
                    let manyInsertArray = []
                    let arrayData = scriptData.buttonOrListData
                    if (arrayData.length > 0) {
                        for (let i = 0; i < arrayData.length; i++) {
                            const element = arrayData[i];
                            const object = {
                                botId: botId,
                                userId: userId,
                                userMobileNo: userMobileNo,
                                sender: "A",
                                messageContent: element.optionName,
                                messageDatetime: new Date(),
                                mainRedirectId: element.id,
                                redirectId: element.id,
                                userInputSaveIn: scriptData.variableName,
                                validationType: scriptData.validationType,
                                prevRedirectId: scriptData.prevRedirectId,
                            }
                            manyInsertArray.push(object)
                        }
                        const insertAdminChatHistory = await userChatHistory.insertMany(manyInsertArray)
                        if (!insertAdminChatHistory) {
                            callbackFunction("Failed to Insert Admin chat history")
                        } else {
                            mm.sendInteractiveButtonMSG(messageContent, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, arrayData, (error, result) => {
                                if (error) {
                                    console.log("Failed to send Button message: ", error);
                                    callbackFunction('Failed to send Button message');
                                } else {
                                    redirectId = scriptData.redirectId;
                                    let waitTime = scriptData.waitTime;
                                    if (waitTime !== null && waitTime > 0) {
                                        setTimeout(processScript, waitTime);
                                    } else {
                                        callbackFunction(null, "Success");
                                    }
                                }
                            });
                        }
                    } else {
                        callbackFunction("Not Found buttonOrListData")
                    }
                } else if (scriptData.messageType === "LIST") {
                    let messageContent = scriptData.messageDraft,
                        buttonText = scriptData.listButtonName,
                        listData = [],
                        manyInsertArray = [],
                        arrayData = scriptData.buttonOrListData
                    if (arrayData.length > 0) {
                        for (let i = 0; i < arrayData.length; i++) {
                            const element = arrayData[i];
                            const object = {
                                botId: botId,
                                userId: userId,
                                userMobileNo: userMobileNo,
                                sender: "A",
                                messageContent: element.optionName,
                                messageDatetime: new Date(),
                                mainRedirectId: element.id + "_" + (i + 1),
                                redirectId: element.id + "_" + (i + 1),
                                userInputSaveIn: scriptData.variableName,
                                validationType: scriptData.validationType,
                                prevRedirectId: scriptData.prevRedirectId,
                            }
                            manyInsertArray.push(object)
                            const listObject = {
                                id: element.id + "_" + (i + 1),
                                optionName: element.optionName
                            }
                            listData.push(listObject)

                        }

                        console.log("listData: ", listData);
                        const insertAdminChatHistory = await userChatHistory.insertMany(manyInsertArray)
                        if (!insertAdminChatHistory) {
                            callbackFunction("Failed to Insert Admin chat history")
                        }

                        mm.sendInteractiveListMSGNew(messageContent, buttonText, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, listData, wpClientId, botId, userId, planId, (error, result) => {
                            if (error) {
                                console.log("Failed to send Button message: ", error);
                                callbackFunction('Failed to send Button message');
                            } else {
                                redirectId = scriptData.redirectId;
                                let waitTime = scriptData.waitTime;
                                if (waitTime !== null && waitTime > 0) {
                                    setTimeout(processScript, waitTime);
                                } else {
                                    callbackFunction(null, "Success");
                                }
                            }
                        });
                    } else {
                        callbackFunction("Not Found buttonOrListData")
                    }
                } else {
                    callbackFunction("messageType not matched")
                }
            }

        }
        processScript()
    } catch (error) {
        console.log(error);
        callbackFunction(error);
    }
}

// if user reply go back (Not in use)
const backMessage = async (message, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, triggerMsg, planId, callbackFunction) => {
    try {
        const userChatHistorys = await userChatHistory.findOne({ userMobileNo: userMobileNo, botId: botId, sender: "A" }).sort({ _id: -1 }).limit(1)
        if (userChatHistorys) {
            let redirectIdNew = userChatHistorys?.prevRedirectId
            const insertUserChatHistory = await userChatHistory.create({
                botId: botId,
                userId: userId,
                userMobileNo: userMobileNo,
                sender: "U",
                messageContent: message,
                messageDatetime: new Date(),
                mainRedirectId: null,
                redirectId: redirectIdNew,
                prevRedirectId: redirectIdNew,
            })
            if (!insertUserChatHistory) {
                callbackFunction('Failed to Insert In Chat History');
            } else {
                let redirectId = redirectIdNew?.split("_")[0];
                if (redirectId === "000000000000000000000000" || redirectId === undefined || redirectId === null || redirectId === "") {
                    let msg_body = "Cannot Procced to Previous Option\n*'" + triggerMsg + "'* To Start From First"
                    mm.sendMSG(msg_body, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, (error, result) => {
                        if (error) {
                            console.log("Error in get method: ", error);
                            callbackFunction('Failed to send message');
                        } else {
                            callbackFunction(null, "Success");
                        }
                    });
                } else {
                    async function processScript() {
                        const scriptData = await chatBotScript.findById(redirectId)
                        if (!scriptData) {
                            callbackFunction("Chat script not found")
                        } else {
                            if (scriptData.messageType === "TEXT") {
                                let messageContent = await translateLanguageFunc(scriptData.messageDraft, selectLanguage)
                                const insertAdminChatHistory = await userChatHistory.create({
                                    botId: botId,
                                    userId: userId,
                                    userMobileNo: userMobileNo,
                                    sender: "A",
                                    messageContent: messageContent,
                                    messageDatetime: new Date(),
                                    mainRedirectId: null,
                                    redirectId: scriptData.redirectId,
                                    userInputSaveIn: scriptData.variableName,
                                    validationType: scriptData.validationType,
                                    prevRedirectId: scriptData.prevRedirectId,
                                })
                                if (!insertAdminChatHistory) {
                                    callbackFunction("Failed to Insert Admin chat history")
                                } else {
                                    mm.sendMSG(messageContent, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                                        if (error) {
                                            console.log("Error in get method: ", error);
                                            callbackFunction('Failed to send message');
                                        } else {
                                            redirectId = scriptData.redirectId;
                                            let waitTime = scriptData.waitTime;
                                            if (waitTime !== null && waitTime > 0) {
                                                setTimeout(processScript, waitTime);
                                            } else {
                                                callbackFunction(null, "Success");
                                            }
                                        }
                                    });
                                }
                            } else if (scriptData.messageType === "IMAGE") {
                                let caption = await translateLanguageFunc(scriptData.messageDraft, selectLanguage),
                                    mediaUrl = scriptData.mediaUrl
                                const insertAdminChatHistory = await userChatHistory.create({
                                    botId: botId,
                                    userId: userId,
                                    userMobileNo: userMobileNo,
                                    sender: "A",
                                    messageContent: caption,
                                    mediaUrl: mediaUrl,
                                    messageDatetime: new Date(),
                                    mainRedirectId: null,
                                    redirectId: scriptData.redirectId,
                                    userInputSaveIn: scriptData.variableName,
                                    validationType: scriptData.validationType,
                                    prevRedirectId: scriptData.prevRedirectId,
                                })
                                if (!insertAdminChatHistory) {
                                    callbackFunction("Failed to Insert Admin chat history")
                                } else {
                                    mm.sendMSGWithImage(mediaUrl, caption, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                                        if (error) {
                                            console.log("Failed to send image message: ", error);
                                            callbackFunction('Failed to send image message');
                                        } else {
                                            redirectId = scriptData.redirectId;
                                            let waitTime = scriptData.waitTime;
                                            if (waitTime !== null && waitTime > 0) {
                                                setTimeout(processScript, waitTime);
                                            } else {
                                                callbackFunction(null, "Success");
                                            }
                                        }
                                    });
                                }


                            } else if (scriptData.messageType === "DOCUMENT") {
                                let caption = await translateLanguageFunc(scriptData.messageDraft, selectLanguage),
                                    mediaUrl = scriptData.mediaUrl,
                                    filename = Date.now()
                                const insertAdminChatHistory = await userChatHistory.create({
                                    botId: botId,
                                    userId: userId,
                                    userMobileNo: userMobileNo,
                                    sender: "A",
                                    messageContent: caption,
                                    mediaUrl: mediaUrl,
                                    messageDatetime: new Date(),
                                    mainRedirectId: scriptData.redirectId,
                                    redirectId: scriptData.redirectId,
                                    userInputSaveIn: scriptData.variableName,
                                    validationType: scriptData.validationType,
                                    prevRedirectId: scriptData.prevRedirectId,
                                })
                                if (!insertAdminChatHistory) {
                                    callbackFunction("Failed to Insert Admin chat history")
                                } else {
                                    mm.sendDocumentMedia(caption, mediaUrl, filename, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                                        if (error) {
                                            console.log("Failed to send Document message: ", error);
                                            callbackFunction('Failed to send Document message');
                                        } else {
                                            redirectId = scriptData.redirectId;
                                            let waitTime = scriptData.waitTime;
                                            if (waitTime !== null && waitTime > 0) {
                                                setTimeout(processScript, waitTime);
                                            } else {
                                                callbackFunction(null, "Success");
                                            }
                                        }
                                    });
                                }
                            } else if (scriptData.messageType === "BUTTON") {
                                let messageContent = await translateLanguageFunc(scriptData.messageDraft, selectLanguage)
                                let manyInsertArray = []
                                let listData = []
                                let arrayData = scriptData.buttonOrListData
                                if (arrayData.length > 0) {
                                    for (let i = 0; i < arrayData.length; i++) {
                                        const element = arrayData[i];
                                        const trans = await translateLanguageFunc(element.optionName, selectLanguage)
                                        const object = {
                                            botId: botId,
                                            userId: userId,
                                            userMobileNo: userMobileNo,
                                            sender: "A",
                                            messageContent: trans,
                                            messageDatetime: new Date(),
                                            mainRedirectId: element.id + "_" + (i + 1),
                                            redirectId: element.id + "_" + (i + 1),
                                            userInputSaveIn: scriptData.variableName,
                                            validationType: scriptData.validationType,
                                            prevRedirectId: scriptData.prevRedirectId,
                                        }
                                        manyInsertArray.push(object)
                                        const listObject = {
                                            id: element.id + "_" + (i + 1),
                                            optionName: trans
                                        }
                                        listData.push(listObject)
                                    }

                                    const insertAdminChatHistory = await userChatHistory.insertMany(manyInsertArray)
                                    if (!insertAdminChatHistory) {
                                        callbackFunction("Failed to Insert Admin chat history")
                                    } else {
                                        mm.sendInteractiveButtonMSG(messageContent, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, listData, wpClientId, botId, userId, planId, (error, result) => {
                                            if (error) {
                                                console.log("Failed to send Button message: ", error);
                                                callbackFunction('Failed to send Button message');
                                            } else {
                                                redirectId = scriptData.redirectId;
                                                let waitTime = scriptData.waitTime;
                                                if (waitTime !== null && waitTime > 0) {
                                                    setTimeout(processScript, waitTime);
                                                } else {
                                                    callbackFunction(null, "Success");
                                                }
                                            }
                                        });
                                    }
                                } else {
                                    callbackFunction("Not Found buttonOrListData")
                                }
                            } else if (scriptData.messageType === "LIST") {
                                let messageContent = await translateLanguageFunc(scriptData.messageDraft, selectLanguage)
                                buttonText = await translateLanguageFunc(scriptData.listButtonName, selectLanguage),
                                    listData = [],
                                    manyInsertArray = [],
                                    arrayData = scriptData.buttonOrListData
                                if (arrayData.length > 0) {
                                    for (let i = 0; i < arrayData.length; i++) {
                                        const element = arrayData[i];
                                        const trans = await translateLanguageFunc(element.optionName, selectLanguage)
                                        const object = {
                                            botId: botId,
                                            userId: userId,
                                            userMobileNo: userMobileNo,
                                            sender: "A",
                                            messageContent: trans,
                                            messageDatetime: new Date(),
                                            mainRedirectId: element.id + "_" + (i + 1),
                                            redirectId: element.id + "_" + (i + 1),
                                            userInputSaveIn: scriptData.variableName,
                                            validationType: scriptData.validationType,
                                            prevRedirectId: scriptData.prevRedirectId,
                                        }
                                        manyInsertArray.push(object)
                                        const listObject = {
                                            id: element.id + "_" + (i + 1),
                                            optionName: trans
                                        }
                                        listData.push(listObject)

                                    }

                                    console.log("listData: ", listData);
                                    const insertAdminChatHistory = await userChatHistory.insertMany(manyInsertArray)
                                    if (!insertAdminChatHistory) {
                                        callbackFunction("Failed to Insert Admin chat history")
                                    }
                                    mm.sendInteractiveListMSGNew(messageContent, buttonText, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, listData, wpClientId, botId, userId, planId, (error, result) => {
                                        if (error) {
                                            console.log("Failed to send Button message: ", error);
                                            callbackFunction('Failed to send Button message');
                                        } else {
                                            redirectId = scriptData.redirectId;
                                            let waitTime = scriptData.waitTime;
                                            if (waitTime !== null && waitTime > 0) {
                                                setTimeout(processScript, waitTime);
                                            } else {
                                                callbackFunction(null, "Success");
                                            }
                                        }
                                    });
                                } else {
                                    callbackFunction("Not Found buttonOrListData")
                                }
                            } else if (scriptData.messageType === "API_DATA") {
                                let bodyParams = scriptData.bodyParams;
                                let keys = []
                                if (bodyParams) {
                                    Object.keys(bodyParams).forEach((key) => {
                                        keys.push(bodyParams[key])
                                    })
                                } else {
                                    keys.push("")
                                }

                                const resultInputData = await userInputData.find({ botId: botId, mobileNo: userMobileNo, variableName: { $in: keys } }).select({ selectedValue: 1, variableName: 1, _id: 0 })
                                Object.keys(bodyParams).forEach((key) => {
                                    for (let i = 0; i < resultInputData.length; i++) {
                                        const element = resultInputData[i];
                                        if (bodyParams[key] === element.variableName) {
                                            bodyParams[key] = element.selectedValue
                                        }
                                    }
                                })

                                const newObject = {
                                    ...bodyParams,
                                    ...limitObject
                                }
                                const requestOptions = {
                                    url: scriptData.apiUrl,
                                    method: scriptData.method,
                                    headers: scriptData.headerParams,
                                    body: newObject,
                                    json: true
                                }
                                request(requestOptions, async (error, response, body) => {
                                    if (error) {
                                        console.log("Error in request", error);
                                        callbackFunction("Failed to Request API Data")
                                    } else {
                                        if (response.statusCode === 200) {
                                            let dataKey = scriptData?.sampleDataKey?.data,
                                                dataId = scriptData?.sampleDataKey?.id,
                                                dataName = scriptData?.sampleDataKey?.name,
                                                dataDesc = scriptData?.sampleDataKey?.desc;
                                            fileUrl = scriptData?.sampleDataKey?.fileUrl;
                                            if (body[dataKey].length > 0) {
                                                if (scriptData.messageSubType === "TEXT") {
                                                    let messageContent = await translateLanguageFunc(scriptData.messageDraft, selectLanguage)
                                                    const keyData = await flattenCartData(body[dataKey], messageContent, dataName, dataId, "", "")
                                                    const insertAdminChatHistory = await userChatHistory.create({
                                                        botId: botId,
                                                        userId: userId,
                                                        userMobileNo: userMobileNo,
                                                        sender: "A",
                                                        messageContent: keyData.stringValue,
                                                        messageDatetime: new Date(),
                                                        mainRedirectId: null,
                                                        redirectId: scriptData.redirectId,
                                                        userInputSaveIn: scriptData.variableName,
                                                        validationType: scriptData.validationType,
                                                        prevRedirectId: scriptData.prevRedirectId,
                                                    })
                                                    if (!insertAdminChatHistory) {
                                                        callbackFunction("Failed to Insert Admin chat history")
                                                    } else {
                                                        mm.sendMSG(keyData.stringValue, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                                                            if (error) {
                                                                console.log("Error in get method: ", error);
                                                                callbackFunction('Failed to send message');
                                                            } else {
                                                                redirectId = scriptData.redirectId;
                                                                let waitTime = scriptData.waitTime;
                                                                if (waitTime !== null && waitTime > 0) {
                                                                    setTimeout(processScript, waitTime);
                                                                } else {
                                                                    callbackFunction(null, "Success");
                                                                }
                                                            }
                                                        });
                                                    }
                                                } else if (scriptData.messageSubType === "LIST") {
                                                    let messageContent = await translateLanguageFunc(scriptData.messageDraft, selectLanguage),
                                                        buttonText = await translateLanguageFunc(scriptData.listButtonName, selectLanguage),
                                                        listData = [],
                                                        manyInsertArray = []
                                                    for (let i = 0; i < body[dataKey].length; i++) {
                                                        const element = body[dataKey][i];

                                                        const object = {
                                                            botId: botId,
                                                            userId: userId,
                                                            userMobileNo: userMobileNo,
                                                            sender: "A",
                                                            messageContent: element[dataName],
                                                            messageDatetime: new Date(),
                                                            mainRedirectId: scriptData.redirectId + "_" + (i + 1),
                                                            redirectId: scriptData.redirectId + "_" + (i + 1),
                                                            userInputSaveIn: scriptData.variableName,
                                                            validationType: scriptData.validationType,
                                                            prevRedirectId: scriptData.prevRedirectId,
                                                        }
                                                        manyInsertArray.push(object)
                                                        const listObject = {
                                                            id: scriptData.redirectId + "_" + (i + 1),
                                                            optionName: await translateLanguageFunc(element[dataName], selectLanguage),
                                                            desc: await translateLanguageFunc(element[dataDesc], selectLanguage)
                                                        }
                                                        listData.push(listObject)
                                                    }

                                                    const insertAdminChatHistory = await userChatHistory.insertMany(manyInsertArray)
                                                    if (!insertAdminChatHistory) {
                                                        callbackFunction("Failed to Insert Admin chat history")
                                                    } else {
                                                        mm.sendInteractiveListMSGNew(messageContent, buttonText, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, listData, wpClientId, botId, userId, planId, (error, result) => {
                                                            if (error) {
                                                                console.log("Failed to send Button message: ", error);
                                                                callbackFunction('Failed to send Button message');
                                                            } else {
                                                                redirectId = scriptData.redirectId;
                                                                let waitTime = scriptData.waitTime;
                                                                if (waitTime !== null && waitTime > 0) {
                                                                    setTimeout(processScript, waitTime);
                                                                } else {
                                                                    callbackFunction(null, "Success");
                                                                }
                                                            }
                                                        });
                                                    }
                                                } else if (scriptData.messageSubType === "DOCUMENT") {

                                                    const keyData = await flattenCartData(body[dataKey], scriptData.messageDraft, dataName, dataId, fileUrl, "")


                                                    console.log("keyData", keyData);
                                                    let caption = await translateLanguageFunc(keyData.stringValue, selectLanguage),
                                                        mediaUrl = keyData.fileUrlValue,
                                                        filename = Date.now()
                                                    const insertAdminChatHistory = await userChatHistory.create({
                                                        botId: botId,
                                                        userId: userId,
                                                        userMobileNo: userMobileNo,
                                                        sender: "A",
                                                        messageContent: caption,
                                                        mediaUrl: mediaUrl,
                                                        messageDatetime: new Date(),
                                                        mainRedirectId: scriptData.redirectId,
                                                        redirectId: scriptData.redirectId,
                                                        userInputSaveIn: scriptData.variableName,
                                                        validationType: scriptData.validationType,
                                                        prevRedirectId: scriptData.prevRedirectId,
                                                    })
                                                    if (!insertAdminChatHistory) {
                                                        callbackFunction("Failed to Insert Admin chat history")
                                                    } else {
                                                        mm.sendDocumentMedia(caption, mediaUrl, filename, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planId, (error, result) => {
                                                            if (error) {
                                                                console.log("Failed to send Document message: ", error);
                                                                callbackFunction('Failed to send Document message');
                                                            } else {
                                                                redirectId = scriptData.redirectId;
                                                                let waitTime = scriptData.waitTime;
                                                                if (waitTime !== null && waitTime > 0) {
                                                                    setTimeout(processScript, waitTime);
                                                                } else {
                                                                    callbackFunction(null, "Success");
                                                                }
                                                            }
                                                        });
                                                    }
                                                } else {
                                                    callbackFunction("messageSubType not matched")
                                                }
                                            } else {
                                                callbackFunction("No Data Found")
                                            }

                                        } else {
                                            callbackFunction("Failed to send API Data")
                                        }
                                    }
                                })
                            } else {
                                callbackFunction("messageType not matched")
                            }
                        }

                    }

                    processScript()
                }
            }
        }
    } catch (error) {
        console.log(error);
        callbackFunction(error);
    }
}

//for API Nested key and values are in one single object
const flattenCartData = async (cartData, string, NAME, ID, FILE_URL, FILE_NAME) => {
    let NAME_VALUE = ''
    let ID_VALUE = ''
    let file = ''
    let fileName = ''
    cartData.forEach(cart => {
        const flatCart = {};
        Object.entries(cart).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach((product, index) => {
                    Object.entries(product).forEach(([productKey, productValue]) => {
                        if (typeof productValue === 'object' && productValue !== null) {
                            if (Array.isArray(productValue)) {
                                productValue.forEach((product2, index2) => {
                                    Object.entries(product2).forEach(([productKey1, productValue1]) => {
                                        console.log(`aaaaaa`, [flatCart[`${key}[${"index2"}].${productKey}[${"index2"}].${productKey1}`]]);
                                        flatCart[`${key}[${"index"}].${productKey}[${"index2"}].${productKey1}`] = productValue1;
                                    })
                                })
                            } else {
                                Object.entries(productValue).forEach(([nestedKey2, nestedValue2]) => {
                                    console.log(`aaaaaa1`, [flatCart[`${key}.${productKey}.${nestedKey2}`]]);
                                    flatCart[`${key}.${productKey}.${nestedKey2}`] = nestedValue2;
                                });
                            }
                        } else {
                            console.log(`aaaaaa111`, `${key}[${index}].${productKey}`);

                            string = string.replaceAll("index", index)
                            string = string.replaceAll("#" + `${key}[${index}].${productKey}` + "#", productValue)
                            if (NAME == `${key}[${index}].${productKey}`) {
                                NAME_VALUE = productValue
                            }
                            if (ID == `${key}[${index}].${productKey}`) {
                                ID_VALUE = productValue
                            }
                            flatCart[`${key}[${index}].${productKey}`] = productValue
                        }
                    });
                });
            } else if (typeof value === 'object' && value !== null) {
                Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                    if (typeof nestedValue === 'object' && nestedValue !== null) {
                        Object.entries(nestedValue).forEach(([nestedKey1, nestedValue1]) => {
                            if (typeof nestedValue1 === 'object' && nestedValue1 !== null) {
                                Object.entries(nestedValue1).forEach(([nestedKey2, nestedValue2]) => {
                                    flatCart[`${key}.${nestedKey}.${nestedKey1}.${nestedKey2}`] = nestedValue2;
                                });
                            } else {
                                string = string.replaceAll("#" + `${key}.${nestedKey}.${nestedKey1}` + "#", nestedValue1)
                                if (NAME == `${key}.${nestedKey}.${nestedKey1}`) {
                                    NAME_VALUE = nestedValue1
                                }


                                if (ID == `${key}.${nestedKey}.${nestedKey1}`) {
                                    ID_VALUE = nestedValue1
                                }

                                if (ID == `${key}.${nestedKey}.${nestedKey1}`) {
                                    ID_VALUE = nestedValue1
                                }

                                if (FILE_URL == `${key}.${nestedKey}.${nestedKey1}`) {
                                    file = nestedValue1
                                }
                                flatCart[`${key}.${nestedKey}.${nestedKey1}`] = nestedValue1;
                            }
                        });
                    } else {
                        console.log(`aaaaaa22`, `${key}.${nestedKey}`);
                        string = string.replaceAll("#" + `${key}.${nestedKey}` + "#", nestedValue)
                        if (NAME == `${key}.${nestedKey}`) {
                            NAME_VALUE = nestedValue
                        }



                        if (ID == `${key}.${nestedKey}`) {
                            ID_VALUE = nestedValue
                        }

                        if (FILE_URL == `${key}.${nestedKey}`) {
                            file = nestedValue
                        }

                        if (FILE_NAME == `${key}.${nestedKey}`) {
                            fileName = nestedValue
                        }


                        flatCart[`${key}.${nestedKey}`] = nestedValue;
                    }
                });
            } else {
                console.log(`aaaaaa2211`, `${key}`, FILE_URL, FILE_NAME);
                string = string.replaceAll("#" + `${key}` + "#", value)
                if (NAME == `${key}`) {
                    NAME_VALUE = value
                    // ID_VALUE = value
                }
                if (ID == `${key}`) {
                    ID_VALUE = value
                }
                if (FILE_URL == `${key}`) {
                    file = value
                }

                if (FILE_NAME == `${key}`) {
                    fileName = value
                }
                flatCart[key] = value;
            }
        });
    });

    return {
        stringValue: string,
        nameValue: NAME_VALUE,
        idValue: ID_VALUE,
        fileUrlValue: file,
        fileNameValue: fileName,
    };
}

exports.handleMessageSend = async (data) => {
    try {
        if (data.object) {
            console.log("data", data.entry[0].changes[0].value.messages[0]);
            console.log("START", new Date().getSeconds(), new Date().getMilliseconds());
            if (data.entry && data.entry[0].changes && data.entry[0].changes[0].value.messages && data.entry[0].changes[0].value.messages[0]) {
                let botPhoneNumber = data.entry[0].changes[0].value.metadata.display_phone_number,
                userMobileNo = data.entry[0].changes[0].value.messages[0].from,
                type = data.entry[0].changes[0].value.messages[0].type,
                userProfileName = data.entry[0].changes[0].value.contacts[0].profile.name,
                interactiveType = data?.entry[0]?.changes[0]?.value?.messages[0]?.interactive?.type

                const checkBotExist = await bot.aggregate([
                    {
                        $match: {
                            botMobileNo: botPhoneNumber
                        }
                    },
                    {
                        $lookup: {
                            from: "clientwpconfigs",
                            localField: "wpClientId",
                            foreignField: "wpClientId",
                            as: "clientData"
                        }
                    },
                    {
                        $unwind: {
                            path: "$clientData"
                        }
                    },
                    {
                        "$lookup": {
                            "from": "purchasedclientplans",
                            "let": { "wpClientId": "$wpClientId" },
                            "pipeline": [
                                {
                                    "$match": {
                                        "$expr": {
                                            "$and": [
                                                { "$eq": ["$wpClientId", "$$wpClientId"] },
                                                { "$eq": ["$isActive", true] }
                                            ]
                                        }
                                    }
                                }
                            ],
                            "as": "planData"
                        }
                    },
                    {
                        $unwind: {
                            path: "$planData"
                        }
                    }
                ])


                if (!checkBotExist) {
                    res.status(404).send({ status: false, message: "Bot Detail Not Found" });
                } else {
                    let botId = checkBotExist[0]._id,
                        triggerMsg = checkBotExist[0].triggerMessage,
                        phoneNumberId = checkBotExist[0].clientData.wpPhoneNoId,
                        permanentAccessToken = checkBotExist[0].clientData.wpPermanentToken,
                        apiVersion = checkBotExist[0].clientData.wpApiVersion,
                        wpClientId = checkBotExist[0].clientData.wpClientId,
                        planID = checkBotExist[0].planData._id,
                        userId = ""
                    let userLang = await getItem(`${botId}:${userMobileNo}`)
                    console.log("userLang", userLang);
                    if (userLang) selectLanguage = userLang
                    const findUser = await clientUserContacts.findOneAndUpdate(
                        { wpClientId: wpClientId, mobileNo: userMobileNo },
                        {
                            wpClientId: wpClientId,
                            mobileNo: userMobileNo,
                            name: userProfileName,
                            isSubscribed: 'subscribed'
                        },
                        { upsert: true }, { new: true }
                    )
                    if (!findUser) {
                        console.log("Failed to Find User Contact");
                    } else {
                        userId = findUser._id
                    }

                    if (type === "text") {
                        let userMessage = data.entry[0].changes[0].value.messages[0].text.body
                        let messageData = JSON.stringify({
                            TYPE: "TEXT",
                            BODY_TEXT: userMessage
                        })
                        const isGreet = isGreetingMessage(userMessage, triggerMsg)
                        const isBack = isBackMessage(userMessage)

                        if (isGreet) {
                            const UserObject = {
                                wpClientId: wpClientId,
                                planId: planID,
                                wpMessageId: data.entry[0].changes[0].value.messages[0].text.id,
                                mobileNumber: userMobileNo,
                                sender: "USER",
                                messageType: "SERVICE",
                                messageStatus: "received",
                                messageDateTime: new Date(),
                                userId: userId,
                                botId: botId,
                                messsageDetails: userMessage

                            }
                            const insertMessageHistory = await messageHistory.create(UserObject)
                            if (!insertMessageHistory) {
                                console.log("Failed to insert in Message History");
                            } else {
                                greetMessage(userMessage, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planID, (err, result) => {
                                    if (err) {
                                        console.log("Err", err);
                                    } else {
                                        console.log("result", result);
                                    }
                                })
                            }
                        } else if (isBack) {
                            const UserObject = {
                                wpClientId: wpClientId,
                                planId: planID,
                                wpMessageId: data.entry[0].changes[0].value.messages[0].text.id,
                                mobileNumber: userMobileNo,
                                sender: "USER",
                                messageType: "SERVICE",
                                messageStatus: "received",
                                messageDateTime: new Date(),
                                userId: userId,
                                botId: botId,
                                messsageDetails: userMessage
                            }
                            const insertMessageHistory = await messageHistory.create(UserObject)
                            if (!insertMessageHistory) {
                                console.log("Failed to insert in Message History");
                            } else {
                                backMessage(userMessage, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, triggerMsg, planID, (err, result) => {
                                    if (err) {
                                        console.log("Err", err);
                                    } else {
                                        console.log("result", result);
                                    }
                                })
                            }
                        } else {
                            const UserObject = {
                                wpClientId: wpClientId,
                                planId: planID,
                                wpMessageId: data.entry[0].changes[0].value.messages[0].text.id,
                                mobileNumber: userMobileNo,
                                sender: "USER",
                                messageType: "SERVICE",
                                messageStatus: "received",
                                messageDateTime: new Date(),
                                userId: userId,
                                botId: botId,
                                messsageDetails: userMessage

                            }
                            const insertMessageHistory = await messageHistory.create(UserObject)
                            if (!insertMessageHistory) {
                                console.log("Failed to insert in Message History");
                            } else {
                                textMessage(userMessage, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planID, (err, result) => {
                                    if (err) {
                                        console.log("Err", err);
                                    } else {
                                        console.log("result", result);
                                    }
                                })
                            }
                        }
                    } else if (type === "interactive" && interactiveType === "button_reply") {
                        const UserObject = {
                            wpClientId: wpClientId,
                            planId: planID,
                            wpMessageId: data.entry[0].changes[0].value.messages[0].interactive.id,
                            mobileNumber: userMobileNo,
                            sender: "USER",
                            messageType: "SERVICE",
                            messageStatus: "received",
                            messageDateTime: new Date(),
                            userId: userId,
                            botId: botId,
                            messsageDetails: data.entry[0].changes[0].value.messages[0].interactive.button_reply.title

                        }
                        const insertMessageHistory = await messageHistory.create(UserObject)
                        if (!insertMessageHistory) {
                            console.log("Failed to insert in Message History");
                        } else {
                            let redirectId = data.entry[0].changes[0].value.messages[0].interactive.button_reply.id
                            let selectedOptions = data.entry[0].changes[0].value.messages[0].interactive.button_reply.title
                            if (selectedOptions.toLowerCase() === 'english') {
                                selectLanguage = 'en'
                                await setItem(`${botId}:${userMobileNo}`, 'en')
                            }
                            if (selectedOptions.toLowerCase() === 'marathi') {
                                selectLanguage = 'mr'
                                await setItem(`${botId}:${userMobileNo}`, 'mr')
                            }
                            if (selectedOptions.toLowerCase() === 'hindi') {
                                selectLanguage = 'hi'
                                await setItem(`${botId}:${userMobileNo}`, 'hi')
                            }
                            buttonMessage(redirectId, selectedOptions, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planID, (err, result) => {
                                if (err) {
                                    console.log("Err", err);
                                } else {
                                    console.log("result", result);
                                }
                            })
                        }
                    } else if (type === "interactive" && interactiveType === "list_reply") {
                        const UserObject = {
                            wpClientId: wpClientId,
                            planId: planID,
                            wpMessageId: data.entry[0].changes[0].value.messages[0].interactive.id,
                            mobileNumber: userMobileNo,
                            sender: "USER",
                            messageType: "SERVICE",
                            messageStatus: "received",
                            messageDateTime: new Date(),
                            userId: userId,
                            botId: botId,
                            messsageDetails: data.entry[0].changes[0].value.messages[0].interactive.list_reply.title

                        }
                        const insertMessageHistory = await messageHistory.create(UserObject)
                        if (!insertMessageHistory) {
                            console.log("Failed to insert in Message History");
                        } else {
                            let redirectId = data.entry[0].changes[0].value.messages[0].interactive.list_reply.id
                            let selectedOptions = data.entry[0].changes[0].value.messages[0].interactive.list_reply.title
                            ListMessage(redirectId, selectedOptions, userMobileNo, phoneNumberId, permanentAccessToken, apiVersion, wpClientId, botId, userId, planID, (err, result) => {
                                if (err) {
                                    console.log("Err", err);
                                } else {
                                    console.log("result", result);
                                }
                            })
                        }
                    } else {
                        res.sendStatus(200);
                    }
                }
            }

            console.log("END", new Date().getSeconds(), new Date().getMilliseconds());
        }
    } catch (error) {
        console.log("Something Went in Message Handle Function", error);
    }
}