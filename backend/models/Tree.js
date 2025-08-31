const mongoose = require("mongoose");

// Schéma pour le compteur auto-incrémenté
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

const treeSchema = new mongoose.Schema({
  code: { 
    type: String, 
    unique: true,
    immutable: true, // Empêche toute modification après création
  },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  genus: { type: String, trim: true, maxlength: 100 },
  species: { type: String, required: true, trim: true, maxlength: 100 },
  family: { type: String, trim: true, maxlength: 100 },
  order: { type: String, trim: true, maxlength: 100 },
  type: { type: String, trim: true, maxlength: 100 },
  greenSpace: { type: String, trim: true, maxlength: 100 },
  district: { type: String, required: true, trim: true, maxlength: 100 },
  neighborhood: { type: String, trim: true, maxlength: 100 },
  plantingDate: { type: Date },
  age: { type: Number, min: 1, max: 2000 },
  height: { type: Number, min: 0.1, max: 150 },
  circumference: { type: Number, min: 0.1 },
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
        validator: coords => coords.length === 2,
        message: "Coordonnées GPS invalides"
      }
    }
  },
  images: [{ type: String, required: true }],
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isVerified: { type: Boolean, default: false },
  verificationDate: { type: Date, default: null },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
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

// Middleware pour générer le code auto-incrémenté
treeSchema.pre('save', async function(next) {
  if (this.isNew && !this.code) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'treeCode' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.code = `TREE-${counter.seq.toString().padStart(6, '0')}`;
      next();
    } catch (error) {
      next(error);
    }
  } else if (this.isModified('code')) {
    next(new Error("Le code ne peut pas être modifié"));
  } else {
    next();
  }
});

// Bloque les mises à jour directes du code
treeSchema.pre('findOneAndUpdate', function(next) {
  if (this._update.code) {
    next(new Error("Le code ne peut pas être modifié"));
  } else {
    next();
  }
});

treeSchema.index({ location: '2dsphere' });
treeSchema.index({ code: 1 }); // Index pour les recherches par code

module.exports = mongoose.model("Tree", treeSchema);