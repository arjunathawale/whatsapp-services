const express = require('express');
const router = express.Router();
const clientUserContactsService = require('../services/clientUserContacts');

router
    .get('/get', clientUserContactsService.get)
    .post('/create', clientUserContactsService.create)
    .put('/update', clientUserContactsService.update)
    .delete('/delete', clientUserContactsService.delete)

module.exports = router;