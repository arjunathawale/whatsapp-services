const express = require('express');
const router = express.Router();
const templateService = require('../services/template');

router
    .post('/get', templateService.get)
    .post('/create', templateService.create)
    .put('/update', templateService.update)
    .delete('/delete/:id', templateService.delete)
    
    .post('/createTemplate', templateService.createTemplate)
    .post('/getFBTemplate', templateService.getFBTemplate)
    .post('/deleteTemplate', templateService.deleteTemplate)

module.exports = router;