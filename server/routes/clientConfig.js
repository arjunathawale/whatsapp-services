const express = require('express');
const router = express.Router();
const clientConfigService = require('../services/clientConfig');

router
    .get('/get', clientConfigService.get)
    .post('/create', clientConfigService.create)
    .put('/update', clientConfigService.update)
    .delete('/delete', clientConfigService.delete)

    // .post('/getClientConfigInfo', clientConfigService.getClientConfigInfo)
module.exports = router;