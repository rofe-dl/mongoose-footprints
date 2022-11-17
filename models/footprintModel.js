const mongoose = require('mongoose');

const footprintSchema = new mongoose.Schema(
  {
    modelName: String,
    documentId: mongoose.Schema.Types.ObjectId,
    oldDocument: {},
    updatedDocument: {},
    user: {
      type: String,
    },
    changes: [String],
    typeOfChange: {
      type: String,
      enum: ['Create', 'Update', 'Delete'],
      default: 'Update',
    },
    version: { type: Number, min: 1, default: 1 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('_Footprint', footprintSchema);
