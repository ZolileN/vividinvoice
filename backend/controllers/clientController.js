const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Client = require('../models/Client');

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
exports.getClients = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Search clients
// @route   GET /api/clients/search
// @access  Private
exports.searchClients = asyncHandler(async (req, res, next) => {
  const { q } = req.query;
  
  if (!q) {
    return next(new ErrorResponse('Please provide a search query', 400));
  }

  const clients = await Client.find({
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { 'address.city': { $regex: q, $options: 'i' } },
      { 'address.country': { $regex: q, $options: 'i' } }
    ],
    user: req.user.id
  });

  res.status(200).json({
    success: true,
    count: clients.length,
    data: clients
  });
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

  // Update client
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
    {
      $match: { user: req.user._id }
    },
    {
      $lookup: {
        from: 'invoices',
        localField: '_id',
        foreignField: 'client',
        as: 'invoices'
      }
    },
    {
      $project: {
        name: 1,
        totalInvoices: { $size: '$invoices' },
        totalPaid: {
          $reduce: {
            input: '$invoices',
            initialValue: 0,
            in: {
              $add: [
                '$$value',
                { $cond: [{ $eq: ['$$this.status', 'paid'] }, '$$this.total', 0] }
              ]
            }
          }
        },
        totalOutstanding: {
          $reduce: {
            input: '$invoices',
            initialValue: 0,
            in: {
              $add: [
                '$$value',
                {
                  $cond: [
                    { $ne: ['$$this.status', 'paid'] },
                    '$$this.total',
                    0
                  ]
                }
              ]
            }
          }
        }
      }
    },
    {
      $sort: { totalOutstanding: -1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: stats
  });
});
