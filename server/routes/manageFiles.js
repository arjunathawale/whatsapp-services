const express = require('express');
const router = express.Router();
const manageFilesService = require('../services/manageFiles');

router
    .post('/get', manageFilesService.get)
    .post('/create', manageFilesService.create)
    .put('/update', manageFilesService.update)
    .delete('/delete/:id', manageFilesService.delete)
    
module.exports = router;