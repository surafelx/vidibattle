const createHttpError = require("http-errors");
const { default: mongoose } = require("mongoose");

// generate feed for a user
module.exports.feed = function ({
  lastDate,
  lastPostId,
  pageSize,
  currentUser,
}) {
  let query = {
    is_deleted: false,
    $and: [
      { author: { $nin: currentUser.blocked_users } },
      { author: { $nin: currentUser.blocked_by } },
    ],
  }; // undeleted posts and posts by unblocked people

  const unblockedFollowings = [];

  currentUser.following.map((f) => {
    if (
      !currentUser?.blocked_users?.includes(f._id) &&
      !currentUser?.blocked_by?.includes(f._id)
    ) {
      unblockedFollowings.push(f._id);
    }
  });

  if (unblockedFollowings.length > 0) {
    unblockedFollowings.push(currentUser._id)
    query.author = { $in: unblockedFollowings };
  }

  if (lastDate) {
    query.$or = [
      { createdAt: { $lt: new Date(lastDate) } },
      {
        $and: [
          { createdAt: new Date(lastDate) },
          { _id: { $lt: new mongoose.Types.ObjectId(lastPostId) } },
        ],
      },
    ];
  }

  return this.find(
    query,
    "caption media likes_count comments_count createdAt updatedAt"
  )
    .sort({ createdAt: -1, _id: -1 })
    .limit(parseInt(pageSize))
    .populate("author", "first_name last_name profile_img username address")
    .populate({
      path: "media",
      populate: {
        path: "thumbnail",
      },
    })
    .populate({
      path: "likes",
      match: { _id: currentUser._id },
      select: "_id",
    });
};

// generate a timeline for a user
module.exports.timeline = function ({
  author,
  lastDate,
  lastPostId,
  pageSize,
}) {
  let query = { is_deleted: false, author };
  if (lastDate) {
    query.$or = [
      { createdAt: { $lt: new Date(lastDate) } },
      {
        $and: [
          { createdAt: new Date(lastDate) },
          { _id: { $lt: new mongoose.Types.ObjectId(lastPostId) } },
        ],
      },
    ];
  }

  return this.find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(parseInt(pageSize))
    .populate({
      path: "media",
      populate: {
        path: "thumbnail",
      },
    });
};

// like post
module.exports.like = async function (userId, postId) {
  const post = await this.findById(postId);
  if (!post) {
    throw createHttpError(404, "post not found");
  }

  if (!post.likes.includes(userId)) {
    post.likes.push(userId);
    post.likes_count += 1;
    return post.save();
  } else {
    return;
  }
};

// unlike post
module.exports.unlike = async function (userId, postId) {
  const post = await this.findById(postId);
  if (!post) {
    throw createHttpError(404, "post not found");
  }

  const likeIndex = post.likes.indexOf(userId);
  if (likeIndex > -1) {
    post.likes.splice(likeIndex, 1);
    post.likes_count -= 1;
    return post.save();
  } else {
    return;
  }
};
