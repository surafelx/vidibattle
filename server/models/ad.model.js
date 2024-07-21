const mongoose = require("mongoose");

// Define the schema for an ad
const adSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String, // URL or path to the image file
    },
    banner: {
      type: String, // URL or path to the banner file
    },
    video: {
      type: String, // URL or path to the video file
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

// Create a text index on title and description for search functionality
adSchema.index({ title: "text", description: "text" });

const Ad = mongoose.model("Ad", adSchema);

module.exports = Ad;
