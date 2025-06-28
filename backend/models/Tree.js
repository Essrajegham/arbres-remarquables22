const mongoose = require("mongoose");

const treeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  scientificName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  species: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  age: { 
    type: Number, 
    required: true,
    min: 1,
    max: 2000
  },
  height: {
    type: Number,
    min: 0.1,
    max: 150,
    required: true
  },
  circumference: {
    type: Number,
    min: 0.1,
    required: true
  },
  location: { 
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(coords) {
          return coords.length === 2;
        },
        message: "Coordonnées GPS invalides"
      }
    }
  },
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  district: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  images: [{
    type: String,
    required: true
  }],
  addedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDate: {
    type: Date,
    default: null
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  historicalSignificance: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  ecologicalValue: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  healthStatus: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'dead'],
    default: 'good'
  },
  conservationStatus: {
    type: String,
    enum: ['protected', 'endangered', 'vulnerable', 'common'],
    default: 'common'
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Index géospatial (utile même avec des coordonnées projetées)
treeSchema.index({ location: '2dsphere' });

module.exports = mongoose.model("Tree", treeSchema);
