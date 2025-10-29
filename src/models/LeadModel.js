import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  leadStatus: {
    type: String,
    enum: ['Hot', 'Warm', 'Cold', 'Converted', 'Lost'],
    default: 'Hot'
  },
  value: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum:['Cold Call','website','Referral','LinkedIn','Trade Show','Email Campaign','Social Media','Event','Organic Search','Paid Ads'],
    required: true
  },
  lastContact: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
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

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;