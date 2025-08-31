const mongoose = require('mongoose');

const AvisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "L'utilisateur est requis"]
  },
  tree: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tree',
    required: [true, "L'arbre est requis"]
  },
  ratings: {
    airQuality: { type: Number, min: 1, max: 5 },
    cleanliness: { type: Number, min: 1, max: 5 },
    noiseLevel: { type: Number, min: 1, max: 5 },
    accessibility: { type: Number, min: 1, max: 5 },
    treeCondition: { type: Number, min: 1, max: 5 }
  },
  comment: {
    type: String,
    maxlength: [500, "Le commentaire ne doit pas dépasser 500 caractères"],
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
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

module.exports = mongoose.model('Avis', AvisSchema);