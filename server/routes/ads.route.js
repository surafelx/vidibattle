const express = require("express");
const {
  getAdInfo,
  createAd,
  updateAd,
  deleteAd,
  getAdsList,
  getAdForEdit,
  searchAd,
  getAdStatistics,
  getAdCategories,
  getTopPerformingAds,
} = require("../controllers/ad.controller");
const { authGuard, adminAuthGuard } = require("../services/authGuard");
const { upload } = require("../services/storage");
const router = express.Router();

// Get
router.get("/info/:id", getAdInfo);
router.get("/list/", getAdsList);
router.get("/admin/list", adminAuthGuard, getAdsList);
router.get("/edit/:id", adminAuthGuard, getAdForEdit);
router.get("/search", authGuard, searchAd);
router.get("/statistics/:id", adminAuthGuard, getAdStatistics);
router.get("/categories", authGuard, getAdCategories);
router.get("/top-performing", adminAuthGuard, getTopPerformingAds);

// Post
router.post(
  "/create",
  adminAuthGuard,
  upload.fields([
    { name: "image" },
    { name: "banner" },
    { name: "video" },
  ]),
  createAd
);

router.post("/delete/:id", adminAuthGuard, deleteAd);

// Put
router.put(
  "/update/:id",
  adminAuthGuard,
  upload.fields([
    { name: "image" },
    { name: "banner" },
    { name: "video" },
  ]),
  updateAd
);

module.exports = router;
