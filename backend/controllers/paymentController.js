const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
exports.getPayments = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
    .populate('invoice', 'invoiceNumber total')
    .populate('client', 'companyName contactPerson');

  if (!payment) {
    return next(
      new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is payment owner
  if (payment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this payment`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: payment
  });
});

// @desc    Create new payment
// @route   POST /api/payments
// @access  Private
exports.createPayment = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;
  req.body.createdBy = req.user.id;

  const { invoice: invoiceId, amount, paymentMethod, paymentDate } = req.body;

  // Check if invoice exists and belongs to user
  const invoice = await Invoice.findOne({
    _id: invoiceId,
    user: req.user.id
  });

  if (!invoice) {
    return next(
      new ErrorResponse(`No invoice found with the id of ${invoiceId}`, 404)
    );
  }

  // Check if client exists and belongs to user
  const client = await Client.findOne({
    _id: req.body.client,
    user: req.user.id
  });

  if (!client) {
    return next(
      new ErrorResponse(`No client found with the id of ${req.body.client}`, 404)
    );
  }

  // Create payment
  const payment = await Payment.create({
    ...req.body,
    client: client._id,
    invoice: invoice._id,
    currency: invoice.currency || 'ZAR',
    isVATInclusive: true, // Assuming VAT is included in the amount
    vatAmount: (amount * 15) / 115 // Calculate VAT amount (15% of the total)
  });

  // Update invoice status if fully paid
  const payments = await Payment.find({
    invoice: invoice._id,
    status: 'completed'
  });

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  
  if (totalPaid >= invoice.total) {
    invoice.status = 'paid';
    invoice.paymentDetails.paid = true;
    invoice.paymentDetails.paymentDate = paymentDate || Date.now();
    invoice.paymentDetails.paymentMethod = paymentMethod;
    await invoice.save();
  }

  res.status(201).json({
    success: true,
    data: payment
  });
});

// @desc    Update payment
// @route   PUT /api/payments/:id
// @access  Private
exports.updatePayment = asyncHandler(async (req, res, next) => {
  let payment = await Payment.findById(req.params.id)
    .populate('invoice', 'total status')
    .populate('client', 'companyName contactPerson');

  if (!payment) {
    return next(
      new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is payment owner
  if (payment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this payment`,
        401
      )
    );
  }

  // Update payment
  payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // If payment status is updated to completed, update invoice status
  if (req.body.status === 'completed') {
    const invoice = await Invoice.findById(payment.invoice);
    if (invoice) {
      const payments = await Payment.find({
        invoice: invoice._id,
        status: 'completed'
      });

      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      
      if (totalPaid >= invoice.total) {
        invoice.status = 'paid';
        invoice.paymentDetails.paid = true;
        invoice.paymentDetails.paymentDate = payment.paymentDate || Date.now();
        invoice.paymentDetails.paymentMethod = payment.paymentMethod;
        await invoice.save();
      }
    }
  }

  res.status(200).json({
    success: true,
    data: payment
  });
});

// @desc    Delete payment
// @route   DELETE /api/payments/:id
// @access  Private
exports.deletePayment = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(
      new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is payment owner
  if (payment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this payment`,
        401
      )
    );
  }

  await payment.remove();

  // Update invoice status if needed
  const invoice = await Invoice.findById(payment.invoice);
  if (invoice) {
    const payments = await Payment.find({
      invoice: invoice._id,
      status: 'completed'
    });

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    
    if (totalPaid < invoice.total) {
      invoice.status = invoice.dueDate < new Date() ? 'overdue' : 'sent';
      invoice.paymentDetails.paid = false;
      await invoice.save();
    }
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get payment statistics
// @route   GET /api/payments/statistics
// @access  Private
exports.getPaymentStatistics = asyncHandler(async (req, res, next) => {
  const stats = await Payment.aggregate([
    // Match payments for the current user
    {
      $match: { user: mongoose.Types.ObjectId(req.user.id) }
    },
    // Group by status and sum amounts
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    // Add totals
    {
      $group: {
        _id: null,
        totalPayments: { $sum: '$count' },
        totalAmount: { $sum: '$totalAmount' },
        statuses: {
          $push: {
            status: '$_id',
            count: '$count',
            amount: '$totalAmount'
          }
        }
      }
    },
    // Format the output
    {
      $project: {
        _id: 0,
        totalPayments: 1,
        totalAmount: 1,
        statuses: 1
      }
    }
  ]);

  // Get monthly payment data for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyStats = await Payment.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(req.user.id),
        paymentDate: { $gte: sixMonthsAgo },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$paymentDate' },
          month: { $month: '$paymentDate' }
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  const result = {
    ...(stats[0] || { totalPayments: 0, totalAmount: 0, statuses: [] }),
    monthlyStats
  };

  res.status(200).json({
    success: true,
    data: result
  });
});
