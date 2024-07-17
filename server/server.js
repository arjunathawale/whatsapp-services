const express = require('express');
const app = express();
const https = require('https');
const helmet = require('helmet');
exports.dotenv = require('dotenv').config();
const port = process.env.PORT || 4000;
const hostname = process.env.HOST_NAME;
const path = require('path');
const cors = require('cors');
const http = require('http')

const server = http.createServer(app);
const connectDB = require("./config/dbConnect");
//routes
const globalRoutes = require('./routes/global');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb', extended: true }));

app.use(cors());

app.use('/static', express.static("./uploads/"));

app.use('/', globalRoutes);

// app.use(helmet());
// app.disable('x-powered-by');


const startServer = async () => {
    try {
        await connectDB();
        server.listen(port, hostname, () => {
            console.log('Whatsapp Service listening on', hostname + ':' + port);
        });
        require('./services/Queues/BulkWorker').BulkWorker();
        require('./services/Queues/WebhookStatusWorker').statusWorker();
        require('./services/Queues/ChatBotWorker').chatBotWorker();
    } catch (error) {
        console.log(error);
    }
}

startServer()

