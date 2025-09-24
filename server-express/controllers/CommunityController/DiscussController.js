import Discuss from "../../models/Community/DiscussSchema.js";
import Post from "../../models/Community/PostSchema.js";

const DiscussController = {
  // ---------- Add Post ----------
  addPost: async (req, res, next) => {
    try {
      const { author_type, user_id, content, category } = req.body;

      const post = await Post.create({
        author_type,
        user_id,
        content,
        category,
      });

      const discuss = await Discuss.findOne();
      if (!discuss)
        return res.status(404).json({ message: "Discussion board not found" });

      discuss.posts.push(post._id);
      await discuss.save();

      res.status(201).json({ message: "Post created", post });
    } catch (error) {
      next(error);
    }
  },

  // ---------- Delete Post ----------
  deletePost: async (req, res, next) => {
    try {
      const { post_id } = req.params;

      await Post.findByIdAndDelete(post_id);

      const discuss = await Discuss.findOne();
      discuss.posts = discuss.posts.filter((id) => id.toString() !== post_id);
      await discuss.save();

      res.status(200).json({ message: "Post deleted" });
    } catch (error) {
      next(error);
    }
  },

  // ---------- Add Comment ----------
  addComment: async (req, res, next) => {
    try {
      const { post_id } = req.params;
      const { user_id, content } = req.body;

      const post = await Post.findById(post_id);

      if (!post) return res.status(404).json({ message: "Post not found" });

      if (post.comments.length >= 100) {
        return res.status(400).json({ message: "Comment limit reached" });
      }

      post.comments.push({
        user_id,
        content,
      });
      post.comments_count = post.comments.length;

      await post.save();
      res
        .status(201)
        .json({
          message: "Comment added",
          comments_count: post.comments_count,
        });
    } catch (error) {
      next(error);
    }
  },

  // ---------- Add Reply ----------
  addReply: async (req, res, next) => {
    try {
      const { post_id, comment_id } = req.params;
      const { user_id, content } = req.body;

      const post = await Post.findById(post_id);
      if (!post) return res.status(404).json({ message: "Post not found" });

      const comment = post.comments.id(comment_id);
      if (!comment)
        return res.status(404).json({ message: "Comment not found" });

      comment.replies.push({
        user_id,
        content,
      });

      await post.save();
      res.status(201).json({ message: "Reply added" });
    } catch (error) {
      next(error);
    }
  },
};

export default DiscussController;
