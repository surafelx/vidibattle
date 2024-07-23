const Ad = require("../models/ad.model"); // Import your Ad model
const { uploadToStorage, deleteFromStorage } = require("../services/storage"); // Assuming you have a storage service
const { Media } = require("../models/media.model");

// Get details of a specific ad
exports.getAdInfo = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }
    res.json(ad);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Create a new ad
exports.createAd = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { name, displayInterval, displayDuration, enabled } = JSON.parse(
      req.body.data
    );

    const imageBody =
      req.files && req.files["image"] && req.files["image"][0]
        ? req.files["image"][0]
        : null;
    const videoBody =
      req.files && req.files["video"] && req.files["video"][0]
        ? req.files["video"][0]
        : null;

    let imageMedia, videoMedia;

    if (imageBody) {
      imageMedia = new Media({
        filename: imageBody.filename,
        contentType: "image",
        type: "image",
        owner: userId,
      });
      await imageMedia.save();
    }

    if (videoBody) {
      videoMedia = new Media({
        filename: videoBody.filename,
        contentType: "video",
        type: "video",
        owner: userId,
      });
      await videoMedia.save();
    }

    const ad = new Ad({
      name,
      displayInterval,
      displayDuration,
      enabled,
      image: imageMedia ? [imageMedia._id] : undefined,
      video: videoMedia ? [videoMedia._id] : undefined,
    });

    await ad.save();
    res.status(201).json(ad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Update an existing ad
exports.updateAd = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    ad.title = title || ad.title;
    ad.description = description || ad.description;
    ad.category = category || ad.category;

    if (req.files.image) {
      if (ad.image) await deleteFromStorage(ad.image); // Remove old image if exists
      ad.image = await uploadToStorage(req.files.image[0]);
    }

    if (req.files.banner) {
      if (ad.banner) await deleteFromStorage(ad.banner); // Remove old banner if exists
      ad.banner = await uploadToStorage(req.files.banner[0]);
    }

    if (req.files.video) {
      if (ad.video) await deleteFromStorage(ad.video); // Remove old video if exists
      ad.video = await uploadToStorage(req.files.video[0]);
    }

    await ad.save();
    res.json(ad);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete an ad
exports.deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    if (ad.image) await deleteFromStorage(ad.image);
    if (ad.banner) await deleteFromStorage(ad.banner);
    if (ad.video) await deleteFromStorage(ad.video);

    await Ad.findByIdAndDelete(req.params.id);
    res.json({ message: "Ad deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getAdsList = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // await Ad.deleteMany({});
    const total = await Ad.countDocuments();

    let ads = await Ad.find()
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("image")
      .populate("video");

    res.status(200).json({
      data: ads,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
    });
  } catch (e) {
    next(e);
  }
};

// Get ad details for editing
exports.getAdForEdit = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }
    res.json(ad);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Search ads based on criteria
exports.searchAd = async (req, res) => {
  try {
    const { query } = req.query;
    const ads = await Ad.find({
      $text: { $search: query },
    });
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get ad statistics
exports.getAdStatistics = async (req, res) => {
  try {
    // Example statistics, adjust based on your data
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }
    // Assuming you have a way to get statistics, e.g., impressions, clicks
    const statistics = {
      impressions: ad.impressions,
      clicks: ad.clicks,
    };
    res.json(statistics);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get ad categories
exports.getAdCategories = async (req, res) => {
  try {
    // Example categories, adjust based on your data
    const categories = ["Technology", "Fashion", "Sports", "Entertainment"];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get top performing ads
exports.getTopPerformingAds = async (req, res) => {
  try {
    // Example to get top ads based on some metric, e.g., clicks
    const ads = await Ad.find().sort({ clicks: -1 }).limit(10);
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
