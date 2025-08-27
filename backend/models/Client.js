const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a client name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    trim: true
  },
  vatNumber: {
    type: String,
    trim: true
  },
  registrationNumber: {
    type: String,
    trim: true
  },
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    }
  },
  paymentTerms: {
    type: Number,
    default: 30
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Reverse populate with virtuals
clientSchema.virtual('invoices', {
  ref: 'Invoice',
  localField: '_id',
  foreignField: 'client',
  justOne: false
});

// Cascade delete invoices when a client is deleted
clientSchema.pre('remove', async function(next) {
  await this.model('Invoice').deleteMany({ client: this._id });
  next();
});

module.exports = mongoose.model('Client', clientSchema);
