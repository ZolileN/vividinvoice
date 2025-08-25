const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentStatistics
} = require('../controllers/paymentController');

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Payment = require('../models/Payment');

// All routes are protected and require authentication
router.use(protect);

// Route for payment statistics
router.get('/statistics', getPaymentStatistics);

router
  .route('/')
  .get(
    advancedResults(Payment, [
      { path: 'user', select: 'name companyName' },
      { path: 'client', select: 'companyName contactPerson' },
      { path: 'invoice', select: 'invoiceNumber total status' }
    ]),
    getPayments
  )
  .post(createPayment);

router
  .route('/:id')
  .get(getPayment)
  .put(updatePayment)
  .delete(deletePayment);

module.exports = router;
