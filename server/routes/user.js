const express = require('express');
const router = express.Router();
const userService = require('../services/user');

router
    .get('/get', userService.get)
    .post('/create',  userService.create)
    .put('/update', userService.update)
    .delete('/delete', userService.delete)
    
    // .post('/loginUser',  userService.loginUser)

module.exports = router;