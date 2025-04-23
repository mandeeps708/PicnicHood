const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  preferences: {
    deliveryDay: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    deliveryTime: {
      type: String,
      // Format: "HH:MM" in 24-hour format
    }
  },
  location: {
    type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a geospatial index for location-based queries
// communitySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Community', communitySchema); 