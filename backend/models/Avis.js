const mongoose = require('mongoose');

const avisSchema = new mongoose.Schema({
  treeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Tree' },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  ratings: {
    question1: { type: Number, required: true },
    question2: { type: Number, required: true },
    question3: { type: Number, required: true },
    question4: { type: Number, required: true },
    question5: { type: Number, required: true },
  }
}, { timestamps: true });

module.exports = mongoose.model('Avis', avisSchema);
