const express = require('express');
const router = express.Router();
const chatBotScript = require('../services/chatBotScript');

router
    .get('/get', chatBotScript.get)
    .post('/create', chatBotScript.create)
    .put('/update', chatBotScript.update)
    .delete('/delete', chatBotScript.delete)

module.exports = router;