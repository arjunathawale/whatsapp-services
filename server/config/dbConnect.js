const mongoose = require('mongoose');

const DB_URI = process.env.MONGO_URI;

const connectDatabase = () => {
    return mongoose.connect(DB_URI).then(() => {
        console.log("Database Connection Success");
    }).catch((error) => {
        console.log("Database Connection Failed", error);
    })
}

module.exports = connectDatabase;