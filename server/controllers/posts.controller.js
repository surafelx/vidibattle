const { Post } = require("../models/post.model");
const { default: mongoose } = require("mongoose");

module.exports.getFeed = async (req, res, next) => {
  const { userId, pageSize, lastDate, lastPostId } = req.query;

  try {
    const posts = await Post.feed({ lastDate, lastPostId, pageSize });

    let updatedLastDate = lastDate;
    let updatedLastPostId = lastPostId;

    if (posts.length > 0) {
      updatedLastDate = posts[posts.length - 1].createdAt.toISOString();
      updatedLastPostId = posts[posts.length - 1]._id.toString();
    }

    res.status(200).json({
      message: "Feed generated successfully",
      data: posts,
      pageSize,
      lastDate: updatedLastDate,
      lastPostId: updatedLastPostId,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.getTimeline = async (req, res, next) => {
  const { userId } = req.params;
  const { pageSize, lastDate, lastPostId } = req.query;

  try {
    const posts = await Post.timeline({
      author: userId,
      lastDate,
      lastPostId,
      pageSize,
    });

    let updatedLastDate = lastDate;
    let updatedLastPostId = lastPostId;

    if (posts.length > 0) {
      updatedLastDate = posts[posts.length - 1].createdAt.toISOString();
      updatedLastPostId = posts[posts.length - 1]._id.toString();
    }

    res.status(200).json({
      message: "posts retrieved successfully",
      data: posts,
      pageSize,
      lastDate: updatedLastDate,
      lastPostId: updatedLastPostId,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.create = async (req, res, next) => {
  // TODO: match author with the person making the request
  const { caption, media, author } = req.body;

  try {
    const post = new Post({
      caption,
      // media,
      author,
    });

    await post.save();

    res.status(201).json({ message: "post created successfully", data: post });
  } catch (error) {
    next(error);
  }
};
