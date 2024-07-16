const express = require('express');
const router = express.Router();
const clientService = require('../services/client');

router
    .post('/get', clientService.get)
    .post('/create', clientService.create)
    .put('/update', clientService.update)
    .delete('/delete/:id', clientService.delete)
    .post('/getClientConfigInfo', clientService.getClientConfigInfo)
    .post('/updatePassword', clientService.updatePassword)
    
    .post('/bookAppointment', clientService.bookAppointment)

    
module.exports = router;