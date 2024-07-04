const express = require('express');
const router = express.Router();
const pricingPlanService = require('../services/pricingPlan');

router
    .get('/get', pricingPlanService.get)
    .post('/create', pricingPlanService.create)
    .put('/update', pricingPlanService.update)
    .delete('/delete', pricingPlanService.delete)
module.exports = router;