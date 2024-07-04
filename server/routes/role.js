const express = require('express');
const router = express.Router();
const roleService = require('../services/role');

router
    .get('/get', roleService.get)
    .post('/create', roleService.create)
    .put('/update', roleService.update)
    .delete('/delete', roleService.delete)
module.exports = router;