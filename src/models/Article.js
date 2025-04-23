const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'g', 'l', 'ml', 'piece', 'pack'],
    default: 'piece'
  },
  category: {
    type: String,
    required: true,
    enum: ['fruits', 'vegetables', 'dairy', 'meat', 'bakery', 'beverages', 'snacks', 'household', 'other']
  },
  imageUrl: {
    type: String,
    trim: true
  },
  isAvailable: {
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
articleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Article', articleSchema); 