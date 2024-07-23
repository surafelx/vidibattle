const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const adSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    image: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    video: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    displayInterval: {
      type: Number,
      required: true,
    },
    displayDuration: {
      type: Number,
      required: true,
    },
    enabled: {
      type: Boolean,
      required: true,
      default: true,
    },
    impressions: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Ad", adSchema);
