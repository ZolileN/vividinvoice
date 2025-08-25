const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
exports.getInvoices = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoice = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('user', 'name email companyName vatNumber')
    .populate('client', 'companyName contactPerson vatNumber address');

  if (!invoice) {
    return next(
      new ErrorResponse(`Invoice not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the invoice
  if (invoice.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this invoice`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: invoice
  });
});

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private
exports.createInvoice = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // Check if client exists and belongs to user
  const client = await Client.findOne({
    _id: req.body.client,
    user: req.user.id
  });

  if (!client) {
    return next(
      new ErrorResponse(`No client with the id of ${req.body.client}`, 404)
    );
  }

  // Calculate totals and VAT
  let subtotal = 0;
  let vatTotal = 0;

  req.body.items.forEach(item => {
    const itemTotal = item.quantity * item.unitPrice;
    const itemVat = item.isVATInclusive 
      ? (itemTotal * item.vatRate) / (100 + item.vatRate)
      : (itemTotal * item.vatRate) / 100;
    
    item.total = itemTotal;
    item.vatAmount = itemVat;
    
    subtotal += itemTotal;
    vatTotal += itemVat;
  });

  req.body.subtotal = subtotal;
  req.body.vatTotal = vatTotal;
  req.body.total = subtotal + vatTotal;

  // Set status to 'sent' if not provided
  if (!req.body.status) {
    req.body.status = 'sent';
  }

  const invoice = await Invoice.create(req.body);

  res.status(201).json({
    success: true,
    data: invoice
  });
});

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
exports.updateInvoice = asyncHandler(async (req, res, next) => {
  let invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return next(
      new ErrorResponse(`Invoice not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is invoice owner
  if (invoice.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this invoice`,
        401
      )
    );
  }

  // Recalculate totals if items are being updated
  if (req.body.items) {
    let subtotal = 0;
    let vatTotal = 0;

    req.body.items.forEach(item => {
      const itemTotal = item.quantity * item.unitPrice;
      const itemVat = item.isVATInclusive 
        ? (itemTotal * item.vatRate) / (100 + item.vatRate)
        : (itemTotal * item.vatRate) / 100;
      
      item.total = itemTotal;
      item.vatAmount = itemVat;
      
      subtotal += itemTotal;
      vatTotal += itemVat;
    });

    req.body.subtotal = subtotal;
    req.body.vatTotal = vatTotal;
    req.body.total = subtotal + vatTotal;
  }

  invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: invoice
  });
});

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
exports.deleteInvoice = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return next(
      new ErrorResponse(`Invoice not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is invoice owner
  if (invoice.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this invoice`,
        401
      )
    );
  }

  await invoice.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Generate invoice PDF
// @route   GET /api/invoices/:id/pdf
// @access  Private
exports.getInvoicePDF = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('user', 'name email companyName vatNumber address')
    .populate('client', 'companyName contactPerson vatNumber address');

  if (!invoice) {
    return next(
      new ErrorResponse(`Invoice not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the invoice
  if (invoice.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this invoice`,
        401
      )
    );
  }

  // In a real implementation, we would generate a PDF here using a library like pdfkit
  // For now, we'll return the invoice data as JSON
  res.status(200).json({
    success: true,
    data: invoice
  });
});
