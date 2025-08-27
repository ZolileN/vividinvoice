const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientStatistics,
  searchClients
} = require('../controllers/clientController');

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Client = require('../models/Client');

// All routes are protected and require authentication
router.use(protect);

// Route for client statistics
router.get('/statistics', getClientStatistics);

// Search clients
router.get('/search', searchClients);

router
  .route('/')
  .get(
    advancedResults(Client, [
      { path: 'user', select: 'name' },
      { 
        path: 'invoices', 
        select: 'invoiceNumber total status dueDate',
        match: { status: { $ne: 'paid' } }
      }
    ]),
    getClients
  )
  .post(createClient);

router
  .route('/:id')
  .get(getClient)
  .put(updateClient)
  .delete(deleteClient);

module.exports = router;
