const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoicePDF
} = require('../controllers/invoiceController');

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Invoice = require('../models/Invoice');

// Re-route into other resource routers
// Example: router.use('/:invoiceId/payments', paymentRouter);

router
  .route('/')
  .get(
    protect,
    advancedResults(Invoice, [
      { path: 'user', select: 'name companyName' },
      { path: 'client', select: 'companyName contactPerson' }
    ]),
    getInvoices
  )
  .post(protect, createInvoice);

router
  .route('/:id')
  .get(protect, getInvoice)
  .put(protect, updateInvoice)
  .delete(protect, deleteInvoice);

// Generate PDF route
router.route('/:id/pdf').get(protect, getInvoicePDF);

module.exports = router;
