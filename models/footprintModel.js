const mongoose = require('mongoose');

const footprintSchema = new mongoose.Schema(
  {
    modelName: String,
    documentId: mongoose.Schema.Types.ObjectId,
    oldDocument: {},
    newDocument: {},
    user: mongoose.Schema.Types.Mixed,
    changes: [String],
    typeOfChange: {
      type: String,
      enum: ['Create', 'Update', 'Delete'],
      default: 'Update',
    },
    version: { type: Number, min: 1, default: 1 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model('_Footprint', footprintSchema);
