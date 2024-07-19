const express = require('express');
const router = express.Router();

router
   .post('/webhook', require('../services/webhookRes').handleWebhookRequests)
   .get('/webhook', require('../services/webhookRes').VerifyWebhook)
   .post('/upload/templateMedia', require('../services/global').templateMedia)
   .post('/upload/clientMediaFiles', require('../services/global').clientMediaFiles)
   .post('/client/clientLogin', require('../services/client').clientLogin)
   .post('/user/userLogin', require('../services/user').userLogin)
   // .use('*', require('../services/global').checkAuth)
   .use('/api', require('../services/global').checkToken)

   .use('/api/user', require('./user'))
   .use('/api/client', require('./client'))
   .use('/api/clientConfig', require('./clientConfig'))
   .use('/api/clientPlan', require('./clientPlan'))
   .use('/api/template', require('./template'))
   .use('/api/role', require('./role'))
   .use('/api/pricingPlan', require('./pricingPlan'))
   .use('/api/bulkSender', require('./bulkSender'))
   .use('/api/bulkSenderDetail', require('./bulkSenderDetail'))
   .use('/api/messageHistory', require('./messageHistory'))
   .use('/api/purchaseClientPlan', require('./purchaseClientPlan'))
   .use('/api/chatBotScript', require('./chatBotScript'))
   .use('/api/manageFiles', require('./manageFiles'))

module.exports = router;
