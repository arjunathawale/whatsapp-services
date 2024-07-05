const jwt = require('jsonwebtoken');
const express = require('express');
exports.dotenv = require('dotenv').config();
const moment = require("moment");


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

// exports.getSystemDate = function () {
//     let date_ob = new Date();
//     // current date
//     // adjust 0 before single digit date
//     let date = ("0" + date_ob.getDate()).slice(-2);
//     // current month
//     let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);


//     // current year
//     let year = date_ob.getFullYear();


//     // current hours
//     let hours = ("0" + date_ob.getHours()).slice(-2);


//     // current minutes
//     let minutes = ("0" + date_ob.getMinutes()).slice(-2);


//     // current seconds
//     let seconds = ("0" + date_ob.getSeconds()).slice(-2);
//     // prints date & time in YYYY-MM-DD HH:MM:SS format
//     //console.log(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
//     date_cur = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
//     return date_cur;
// }

exports.getCurrentDate = function () {
    // console.log(moment().utcOffset("+05:30").format("YYYY-MM-DDTHH:mm:ss Z"));
    return moment().utcOffset("+05:30").format("YYYY-MM-DDTHH:mm:ss Z")
}

const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const { generateMetaMediaId } = require('./template');
const { log } = require('async');

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
                        generateMetaMediaId(res, newPath, file_length,mime_type, wpClientId)
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


// function calculateDateTimeDifference(date) {
//     const providedDateTime = moment(date);
//     const currentDateTime = moment().utcOffset("+05:30");;
//     const timeDifference = Math.abs(currentDateTime - providedDateTime);
//     const seconds = Math.floor((timeDifference / 1000) % 60);
//     const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
//     const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
//     const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
//     return { days, hours, minutes, seconds }
// }


// console.log(calculateDateTimeDifference("2024-02-19T12:00:00+05:30"));