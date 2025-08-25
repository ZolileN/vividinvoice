const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  invoice: {
    type: mongoose.Schema.ObjectId,
    ref: 'Invoice',
    required: [true, 'Payment must be associated with an invoice']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Payment must be associated with a user']
  },
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: [true, 'Payment must be associated with a client']
  },
  amount: {
    type: Number,
    required: [true, 'Please add a payment amount'],
    min: [0.01, 'Amount must be greater than 0']
  },
  currency: {
    type: String,
    default: 'ZAR',
    uppercase: true
  },
  paymentDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'cash', 'payfast', 'yoco', 'other'],
    required: [true, 'Please select a payment method']
  },
  reference: {
    type: String,
    required: [true, 'Please add a payment reference']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  isVATInclusive: {
    type: Boolean,
    default: true
  },
  vatAmount: {
    type: Number,
    default: 0
  },
  paymentGatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
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
paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update invoice status when payment is completed
paymentSchema.post('save', async function(doc) {
  if (doc.status === 'completed') {
    const Invoice = mongoose.model('Invoice');
    const invoice = await Invoice.findById(doc.invoice);
    
    if (invoice) {
      const payments = await mongoose.model('Payment').find({
        invoice: doc.invoice,
        status: 'completed'
      });
      
      const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
      
      invoice.paymentDetails.paid = totalPaid >= invoice.total;
      invoice.paymentDetails.paymentDate = doc.paymentDate;
      invoice.paymentDetails.paymentMethod = doc.paymentMethod;
      invoice.status = invoice.paymentDetails.paid ? 'paid' : 'partially_paid';
      
      await invoice.save();
    }
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
