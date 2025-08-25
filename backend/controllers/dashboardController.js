const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const Payment = require('../models/Payment');
const mongoose = require('mongoose');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  
  // Get current date and calculate date ranges
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get counts for cards
  const [
    totalInvoices,
    totalClients,
    totalRevenue,
    pendingInvoices,
    overdueInvoices,
    recentPayments,
    monthlyRevenue,
    clientDistribution,
    paymentMethods
  ] = await Promise.all([
    // Total invoices count
    Invoice.countDocuments({ user: userId }),
    
    // Total clients count
    Client.countDocuments({ user: userId }),
    
    // Total revenue (sum of all completed payments)
    Payment.aggregate([
      {
        $match: { 
          user: mongoose.Types.ObjectId(userId),
          status: 'completed' 
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]),
    
    // Pending invoices (status: sent)
    Invoice.countDocuments({ 
      user: userId, 
      status: 'sent',
      dueDate: { $gte: now }
    }),
    
    // Overdue invoices (status: sent and due date passed)
    Invoice.countDocuments({ 
      user: userId, 
      status: 'sent',
      dueDate: { $lt: now }
    }),
    
    // Recent payments (last 5)
    Payment.find({ 
      user: userId,
      status: 'completed'
    })
    .sort('-paymentDate')
    .limit(5)
    .populate('client', 'companyName')
    .populate('invoice', 'invoiceNumber'),
    
    // Monthly revenue for the current year
    Payment.aggregate([
      {
        $match: { 
          user: mongoose.Types.ObjectId(userId),
          status: 'completed',
          paymentDate: { $gte: startOfYear }
        }
      },
      {
        $group: {
          _id: { $month: '$paymentDate' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]),
    
    // Client distribution (top 5 clients by revenue)
    Payment.aggregate([
      {
        $match: { 
          user: mongoose.Types.ObjectId(userId),
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$client',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'client'
        }
      },
      {
        $unwind: '$client'
      },
      {
        $project: {
          _id: 0,
          client: {
            _id: '$client._id',
            companyName: '$client.companyName',
            contactPerson: '$client.contactPerson.name'
          },
          total: 1,
          count: 1
        }
      }
    ]),
    
    // Payment methods distribution
    Payment.aggregate([
      {
        $match: { 
          user: mongoose.Types.ObjectId(userId),
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          method: '$_id',
          total: 1,
          count: 1
        }
      }
    ])
  ]);

  // Format the response
  const result = {
    summary: {
      totalInvoices,
      totalClients,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingInvoices,
      overdueInvoices,
      currency: 'ZAR' // Default currency
    },
    recentPayments,
    monthlyRevenue: Array(12).fill(0).map((_, i) => {
      const month = monthlyRevenue.find(m => m._id === i + 1);
      return month ? month.total : 0;
    }),
    clientDistribution,
    paymentMethods,
    // Add VAT statistics
    vatStats: {
      currentQuarter: {
        collected: 0, // This would be calculated from payments
        owed: 0,      // This would be calculated from expenses
        net: 0,
        period: 'Q1 2023' // Dynamic based on current date
      },
      previousQuarter: {
        collected: 0,
        owed: 0,
        net: 0,
        period: 'Q4 2022'
      }
    }
  };

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get tax/VAT report
// @route   GET /api/dashboard/tax-report
// @access  Private
exports.getTaxReport = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { startDate, endDate } = req.query;
  
  // Default to current quarter if no dates provided
  const now = new Date();
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
  const quarterStart = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
  const quarterEnd = new Date(now.getFullYear(), currentQuarter * 3, 0);
  
  const start = startDate ? new Date(startDate) : quarterStart;
  const end = endDate ? new Date(endDate) : quarterEnd;
  
  // Get all invoices and payments within the date range
  const [invoices, payments] = await Promise.all([
    Invoice.find({
      user: userId,
      issueDate: { $gte: start, $lte: end }
    }),
    Payment.find({
      user: userId,
      paymentDate: { $gte: start, $lte: end },
      status: 'completed'
    })
  ]);
  
  // Calculate VAT collected (output tax)
  const vatCollected = invoices.reduce((sum, invoice) => {
    return sum + (invoice.vatTotal || 0);
  }, 0);
  
  // Calculate VAT on expenses (input tax) - this is a simplified example
  // In a real app, you would query an expenses collection
  const vatOnExpenses = 0; // This would be calculated from expenses
  
  // Calculate net VAT payable to SARS
  const netVat = vatCollected - vatOnExpenses;
  
  // Generate VAT 201 report data (simplified)
  const vatReport = {
    period: {
      start,
      end,
      submissionDeadline: new Date(end.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days after period end
    },
    vatCollected,
    vatOnExpenses,
    netVat,
    // Additional fields for VAT 201 form
    standardRatedSupplies: invoices.reduce((sum, invoice) => sum + (invoice.subtotal || 0), 0),
    zeroRatedSupplies: 0, // Would be calculated from zero-rated invoices
    exemptSupplies: 0,    // Would be calculated from exempt supplies
    // Add more fields as needed for the VAT 201 form
  };
  
  res.status(200).json({
    success: true,
    data: vatReport
  });
});
