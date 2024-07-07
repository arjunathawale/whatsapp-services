const express = require('express');
const router = express.Router();
const purchaseClientPlanService = require('../services/purchaseClientPlan');

router
    .post('/get', purchaseClientPlanService.get)
    .post('/create', purchaseClientPlanService.create)
    .put('/update', purchaseClientPlanService.update)
    .delete('/delete', purchaseClientPlanService.delete)

module.exports = router;