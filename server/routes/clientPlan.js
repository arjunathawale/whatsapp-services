const express = require('express');
const router = express.Router();
const clientPlanService = require('../services/clientPlan');

router
    .get('/get', clientPlanService.get)
    .post('/create', clientPlanService.create)
    .put('/update', clientPlanService.update)
    .delete('/delete', clientPlanService.delete)
module.exports = router;