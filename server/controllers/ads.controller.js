const Ad = require("../models/ad"); // Import your Ad model
const { uploadToStorage, deleteFromStorage } = require("../services/storage"); // Assuming you have a storage service

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
    const { title, description, category } = req.body;
    const ad = new Ad({
      title,
      description,
      category,
      image: req.files.image
        ? await uploadToStorage(req.files.image[0])
        : undefined,
      banner: req.files.banner
        ? await uploadToStorage(req.files.banner[0])
        : undefined,
      video: req.files.video
        ? await uploadToStorage(req.files.video[0])
        : undefined,
    });
    await ad.save();
    res.status(201).json(ad);
  } catch (error) {
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

// Get a list of all ads
exports.getAdsList = async (req, res) => {
  try {
    const ads = await Ad.find();
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
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
