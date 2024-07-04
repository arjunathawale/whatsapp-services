const express = require('express');
const router = express.Router();
const messageHistoryService = require('../services/messageHistory');

router
    .post('/get', messageHistoryService.get)
    .post('/create', messageHistoryService.create)
    .put('/update', messageHistoryService.update)
    .delete('/delete', messageHistoryService.delete)

module.exports = router;