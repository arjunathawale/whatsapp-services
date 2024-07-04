const express = require('express');
const router = express.Router();
const bulkSender = require('../services/bulkSender');

router
    .post('/get', bulkSender.get)
    .post('/create', bulkSender.create)
    .put('/update', bulkSender.update)
    .delete('/delete/:id', bulkSender.delete)
    // .post('/getClientConfigInfo', bulkSender.getClientConfigInfo)


    
module.exports = router;