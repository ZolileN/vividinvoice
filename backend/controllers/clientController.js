const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Client = require('../models/Client');

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
exports.getClients = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Private
exports.getClient = asyncHandler(async (req, res, next) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    return next(
      new ErrorResponse(`Client not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is client owner
  if (client.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this client`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: client
  });
});

// @desc    Create new client
// @route   POST /api/clients
// @access  Private
exports.createClient = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const client = await Client.create(req.body);

  res.status(201).json({
    success: true,
    data: client
  });
});

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
exports.updateClient = asyncHandler(async (req, res, next) => {
  let client = await Client.findById(req.params.id);

  if (!client) {
    return next(
      new ErrorResponse(`Client not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is client owner
  if (client.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this client`,
        401
      )
    );
  }

  client = await Client.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: client
  });
});

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
exports.deleteClient = asyncHandler(async (req, res, next) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    return next(
      new ErrorResponse(`Client not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is client owner
  if (client.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this client`,
        401
      )
    );
  }

  // Check if client has invoices
  const invoiceCount = await mongoose.model('Invoice').countDocuments({
    client: client._id
  });

  if (invoiceCount > 0) {
    return next(
      new ErrorResponse(
        `Cannot delete client with ${invoiceCount} associated invoices`,
        400
      )
    );
  }

  await client.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get client statistics
// @route   GET /api/clients/statistics
// @access  Private
exports.getClientStatistics = asyncHandler(async (req, res, next) => {
  const stats = await Client.aggregate([
    // Match clients for the current user
    {
      $match: { user: mongoose.Types.ObjectId(req.user.id) }
    },
    // Group by status and count
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    // Add total count
    {
      $group: {
        _id: null,
        total: { $sum: '$count' },
        statuses: {
          $push: {
            status: '$_id',
            count: '$count'
          }
        }
      }
    },
    // Format the output
    {
      $project: {
        _id: 0,
        total: 1,
        statuses: 1
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: stats[0] || { total: 0, statuses: [] }
  });
});
