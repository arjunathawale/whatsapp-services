const express = require('express');
const router = express.Router();
const bulkSenderDetail = require('../services/bulkSenderDetail');

router
    .post('/get', bulkSenderDetail.get)
    .post('/create', bulkSenderDetail.create)
    .put('/update', bulkSenderDetail.update)
    .delete('/delete/:id', bulkSenderDetail.delete)
    // .post('/getClientConfigInfo', bulkSender.getClientConfigInfo)


    
module.exports = router;