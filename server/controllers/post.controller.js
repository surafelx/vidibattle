const { Post } = require("../models/post.model");
const { Media } = require("../models/media.model");
const { User } = require("../models/user.model");
const { Competition, CompetingUser } = require("../models/competition.model");
const { getRandomSticker } = require("./sticker.controller");
const {
  addStickerToVideo,
  storeFileFromLocalToGridFS,
  deleteFile,
} = require("./media.controller");

module.exports.getFeed = async (req, res, next) => {
  try {
    let {
      pageSize,
      lastDate,
      lastPostId,
      competitionId,
      lastLikesCount,
      round,
    } = req.query;
    const { _id: userId } = req.user;

    if (!pageSize) pageSize = 10;

    const currentUser = await User.findById(userId);
    if (!currentUser)
      return res.status(400).json({ message: "user not found" });

    const posts = await Post.feed({
      lastDate,
      lastPostId,
      pageSize,
      currentUser,
      competitionId: competitionId,
      allPosts: competitionId ? true : false,
      lastLikesCount: competitionId ? lastLikesCount : null,
      round: competitionId ? (round ? round : null) : null,
    });

    let updatedLastDate = lastDate;
    let updatedLastPostId = lastPostId;
    let updatedLastLikesCount;
    if (competitionId) updatedLastLikesCount = lastLikesCount;

    if (posts.length > 0) {
      updatedLastDate = posts[posts.length - 1].createdAt.toISOString();
      updatedLastPostId = posts[posts.length - 1]._id.toString();
      if (competitionId)
        updatedLastLikesCount = posts[posts.length - 1].likes_count.toString();
    }

    const response = {
      data: posts,
      pageSize,
      lastDate: updatedLastDate,
      lastPostId: updatedLastPostId,
    };
    if (competitionId) response.lastLikesCount = updatedLastLikesCount;

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports.getTimeline = async (req, res, next) => {
  try {
    const { username } = req.params;
    let { pageSize, lastDate, lastPostId } = req.query;

    if (!pageSize) pageSize = 10;

    const posts = await Post.timeline({
      author: username,
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
      data: posts,
      pageSize,
      lastDate: updatedLastDate,
      lastPostId: updatedLastPostId,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.getPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    let requestingUserId;
    if (req.user) {
      requestingUserId = req.user._id;
    }

    const post = await Post.findOne({ _id: postId, is_deleted: false });

    if (!post) {
      return res.status(404).json({ message: "post not found!" });
    }

    let is_liked = false;

    if (requestingUserId && !req.user.is_admin) {
      const requestingUser = await User.findById(requestingUserId);
      const author_is_blocked =
        requestingUser?.blocked_users?.includes(requestingUserId);
      const requesting_user_is_blocked = requestingUser?.blocked_by?.includes(
        post.author
      );

      if (author_is_blocked || requesting_user_is_blocked) {
        return res.status(403).json({ message: "can't access this post" });
      }

      is_liked = post.likes?.includes(requestingUserId);
    }

    await post.populate([
      {
        path: "author",
        select: "first_name last_name profile_img username",
      },
      {
        path: "media",
        populate: {
          path: "thumbnail",
        },
      },
      { path: "competition" },
    ]);

    const responsePost = { ...post.toObject(), is_liked };

    res.status(200).json({ data: responsePost });
  } catch (e) {
    next(e);
  }
};

module.exports.create = async (req, res, next) => {
  const { caption, author, type, competition, round } = req.body;
  const mainFile = req.files["file"][0];
  const thumbnailFile = req.files["thumbnail"]?.[0];

  const { _id } = req.user;

  // match author with the person making the request
  if (_id !== author) {
    return res
      .status(403)
      .json({ message: "can't create a post for the given author" });
  } else if (type !== "image" && type !== "video") {
    return res.status(400).json({ message: "invalid media type" });
  }

  try {
    let sticker = null;

    if (competition) {
      const competitionItem = await Competition.findOne({
        status: { $in: ["started", "scheduled"] },
        _id: competition,
        current_round: round ?? 1,
      });

      if (!competitionItem) {
        return res.status(400).json({ message: "competition not found" });
      } else if (
        round !== null &&
        parseInt(round) !== parseInt(competitionItem.current_round)
      ) {
        return res.status(400).json({ message: "can't post for this round" });
      } else if (!round && competition.current_round !== 1) {
        return res.status(400).json({ message: "can't post for this round" });
      }

      // get competitor info
      const competitor = await CompetingUser.findOne({
        user: _id,
        competition,
        status: "playing",
        current_round: parseInt(round ?? 1),
      });

      if (!competitor) {
        return res
          .status(400)
          .json({ message: "this person can't post in this round" });
      }

      // check if there is already a post for the current round, if so, delete it
      const existingPost = await Post.findOne({
        author,
        competition,
        round: parseInt(round) ?? 1,
      });

      if (existingPost) {
        const existingMedia = await Media.findById(existingPost.media);
        if (existingMedia) {
          const filename = existingMedia.filename;
          await deleteFile(filename);
          await Media.deleteOne({ _id: existingMedia._id });
        }
        await Post.deleteOne({ _id: existingPost._id });
      }

      // get a random sticker if the competition has stickers
      if (competitionItem.has_sticker) {
        const stickerObj = await getRandomSticker(
          competitionItem._id,
          type === "video"
        );
        sticker = stickerObj ? stickerObj._id : null;
        // add sticker to video
        if (stickerObj && type === "video") {
          // add sticker to video and save to temp folder
          const filePath = await addStickerToVideo(
            mainFile.filename,
            stickerObj
          );
          // delete old video file(the uploaded file)
          await deleteFile(mainFile.filename);
          // upload the new video with the sticker from temp folder
          await storeFileFromLocalToGridFS(
            filePath,
            mainFile.filename,
            mainFile.contentType
          );

          stickerObj.usage_count = stickerObj.usage_count + 1;
          await stickerObj.save();
        }
      }
    }

    // create the media document
    const media = new Media({
      filename: mainFile.filename,
      contentType: mainFile.contentType,
      type,
      owner: author,
    });

    if (thumbnailFile) {
      const thumbnail = new Media({
        filename: thumbnailFile.filename,
        contentType: thumbnailFile.contentType,
        type: "thumbnail",
        owner: author,
      });

      await thumbnail.save();

      media.thumbnail = thumbnail._id;
    }

    await media.save();

    const postData = {
      caption,
      media: [media._id],
      author,
    };

    if (competition) {
      postData.competition = competition;
      postData.round = parseInt(round) ?? 1;
      postData.sticker = sticker;
    }

    const post = new Post(postData);

    // update the user's post array
    await User.addPost(author, post._id);

    await post.save();

    res.status(201).json({ message: "post created successfully", data: post });
  } catch (error) {
    next(error);
  }
};

module.exports.likePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { _id } = req.user;

    if (!_id || !postId) {
      return res
        .status(400)
        .json({ message: "both userId and postId are required" });
    }

    await Post.like(_id, postId);
    res.status(200).json({ message: "post liked successfully" });
  } catch (e) {
    next(e);
  }
};

module.exports.unlikePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { _id } = req.user;

    if (!_id || !postId) {
      return res
        .status(400)
        .json({ message: "both userId and postId are required" });
    }

    await Post.unlike(_id, postId);
    res.status(200).json({ message: "post unliked successfully" });
  } catch (e) {
    next(e);
  }
};

module.exports.removePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findOneAndUpdate({ _id: id }, { is_deleted: true });

    if (!post) {
      return res.status(404).json({ message: "post not found" });
    }

    res.status(204).json({ message: "post removed" });
  } catch (e) {
    next(e);
  }
};
