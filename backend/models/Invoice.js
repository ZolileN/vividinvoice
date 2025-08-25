const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  quantity: {
    type: Number,
    required: [true, 'Please add a quantity'],
    min: [0.01, 'Quantity must be greater than 0']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Please add a unit price'],
    min: [0, 'Price must be 0 or more']
  },
  vatRate: {
    type: Number,
    default: 15, // Default South African VAT rate
    min: 0,
    max: 100
  },
  isVATInclusive: {
    type: Boolean,
    default: true
  },
  total: {
    type: Number,
    required: true
  },
  vatAmount: {
    type: Number,
    required: true
  }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: [true, 'Invoice number is required'],
    unique: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: [true, 'Please select a client']
  },
  issueDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Please add a due date']
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  vatTotal: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'ZAR',
    uppercase: true
  },
  notes: String,
  terms: String,
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDetails: {
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'annually'],
      required: function() { return this.isRecurring; }
    },
    startDate: {
      type: Date,
      required: function() { return this.isRecurring; }
    },
    endDate: Date,
    nextInvoiceDate: Date
  },
  paymentDetails: {
    paid: {
      type: Boolean,
      default: false
    },
    paymentDate: Date,
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'bank_transfer', 'cash', 'other', null],
      default: null
    },
    transactionId: String,
    notes: String
  },
  isTaxInvoice: {
    type: Boolean,
    default: true
  },
  sarsCompliant: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
invoiceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate invoice number before saving
invoiceSchema.pre('save', async function(next) {
  if (!this.isNew) return next();
  
  try {
    const count = await this.constructor.countDocuments();
    this.invoiceNumber = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(5, '0')}`;
    next();
  } catch (err) {
    next(err);
  }
});

// Calculate totals before saving
invoiceSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isNew) {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    this.vatTotal = this.items.reduce((sum, item) => sum + item.vatAmount, 0);
    this.total = this.subtotal + this.vatTotal;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
