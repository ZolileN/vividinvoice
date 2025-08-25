const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientStatistics
} = require('../controllers/clientController');

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Client = require('../models/Client');

// All routes are protected and require authentication
router.use(protect);

// Route for client statistics
router.get('/statistics', getClientStatistics);

router
  .route('/')
  .get(
    advancedResults(Client, [
      { path: 'user', select: 'name companyName' }
    ], {
      path: 'invoices',
      select: 'invoiceNumber total status'
    }),
    getClients
  )
  .post(createClient);

router
  .route('/:id')
  .get(getClient)
  .put(updateClient)
  .delete(deleteClient);

module.exports = router;
