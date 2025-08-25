const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getTaxReport
} = require('../controllers/dashboardController');

const { protect } = require('../middleware/auth');

// All routes are protected and require authentication
router.use(protect);

// Get dashboard statistics
router.get('/', getDashboardStats);

// Get tax/VAT report
router.get('/tax-report', getTaxReport);

module.exports = router;
