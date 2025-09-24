import React, { useState } from "react";
import {
  MessageSquare,
  Users,
  Briefcase,
  Trophy,
  MessageCircle,
  ChevronRight,
  ArrowLeft,
  User,
  Clock,
  Heart,
  Reply,
  Plus,
  Filter,
  Search,
  Bookmark,
  MoreVertical,
  Send,
} from "lucide-react";

export function DiscussPage() {
  const [activeTab, setActiveTab] = useState("platform");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPost, setSelectedPost] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [newReply, setNewReply] = useState("");

  // Sample data
  const platformPosts = [
    {
      id: 1,
      title: "New AI Interview Analysis Feature Released!",
      content:
        "# New Feature Update\n\nWe're excited to announce our latest **AI Interview Analysis** feature that provides real-time feedback on your interview performance.\n\n## Key Features:\n- Voice tone analysis\n- Facial expression tracking\n- Confidence scoring\n- Personalized recommendations\n\n*Try it out in your next practice session!*",
      author: "InterviewAI Team",
      avatar: "🤖",
      timestamp: "2 hours ago",
      commentCount: 15,
      likes: 42,
      comments: [
        {
          id: 1,
          author: "Sarah Chen",
          avatar: "👩‍💼",
          content:
            "This is amazing! The voice analysis really helped me identify my speaking patterns.",
          timestamp: "1 hour ago",
          likes: 5,
          replies: [
            {
              id: 1,
              author: "Mike Johnson",
              avatar: "👨‍💻",
              content: "I agree! The real-time feedback is a game-changer.",
              timestamp: "30 minutes ago",
              likes: 2,
            },
          ],
        },
      ],
    },
    {
      id: 2,
      title: "Platform Maintenance Scheduled - March 15th",
      content:
        "# Scheduled Maintenance\n\nWe will be performing routine maintenance on **March 15th from 2:00 AM to 4:00 AM UTC**.\n\n## What to expect:\n- Brief service interruption\n- Improved performance\n- Bug fixes\n\nThank you for your patience!",
      author: "InterviewAI Team",
      avatar: "🤖",
      timestamp: "1 day ago",
      commentCount: 8,
      likes: 23,
      comments: [],
    },
  ];

  const userPosts = [
    {
      id: 1,
      title: "How to ace technical interviews at FAANG companies?",
      content:
        "# Technical Interview Tips\n\nI've been preparing for technical interviews at big tech companies. Here's what I've learned:\n\n## Preparation Strategy:\n1. **Data Structures & Algorithms** - Master the fundamentals\n2. **System Design** - Understand scalability concepts\n3. **Behavioral Questions** - Use STAR method\n\n## Resources I recommend:\n- LeetCode for coding practice\n- System Design Primer\n- Mock interviews with peers\n\nWhat other tips do you have?",
      category: "career",
      author: "Alex Rodriguez",
      avatar: "👨‍💻",
      timestamp: "3 hours ago",
      commentCount: 24,
      likes: 67,
      comments: [
        {
          id: 1,
          author: "Emma Wilson",
          avatar: "👩‍💼",
          content:
            "Great tips! I'd also add practicing whiteboard coding and explaining your thought process clearly.",
          timestamp: "2 hours ago",
          likes: 8,
          replies: [],
        },
      ],
    },
    {
      id: 2,
      title: "Monthly Interview Challenge - March 2024",
      content:
        "# March Interview Challenge! 🏆\n\nLet's practice together this month with daily interview questions!\n\n## Challenge Rules:\n- One question per day\n- Share your solutions\n- Help others with feedback\n- Win prizes for participation\n\n## This Week's Focus:\n**Arrays and Strings** - fundamental concepts\n\nWho's in? Comment below to join!",
      category: "contest",
      author: "Contest Bot",
      avatar: "🏆",
      timestamp: "1 day ago",
      commentCount: 156,
      likes: 234,
      comments: [],
    },
    {
      id: 3,
      title: "Feedback on my mock interview performance",
      content:
        "# Mock Interview Feedback Request\n\nI just completed a mock interview for a **Product Manager** role and would love some feedback.\n\n## Interview Details:\n- Company: Mid-size tech startup\n- Role: Senior PM\n- Duration: 45 minutes\n\n## My Performance:\n- Felt confident with product sense questions\n- Struggled with technical architecture discussion\n- Could improve on stakeholder management scenarios\n\n**What areas should I focus on for improvement?**",
      category: "feedback",
      author: "Jessica Park",
      avatar: "👩‍💼",
      timestamp: "4 hours ago",
      commentCount: 12,
      likes: 18,
      comments: [],
    },
  ];

  const categories = [
    {
      id: "all",
      name: "All Posts",
      icon: MessageSquare,
      color: "text-purple-400",
    },
    { id: "career", name: "Career", icon: Briefcase, color: "text-blue-400" },
    { id: "contest", name: "Contest", icon: Trophy, color: "text-yellow-400" },
    {
      id: "feedback",
      name: "Feedback",
      icon: MessageCircle,
      color: "text-green-400",
    },
  ];

  const filteredUserPosts =
    selectedCategory === "all"
      ? userPosts
      : userPosts.filter((post) => post.category === selectedCategory);

  const renderMarkdown = (content) => {
    return content
      .replace(
        /^# (.*$)/gm,
        '<h1 class="text-2xl font-bold text-white mb-4">$1</h1>'
      )
      .replace(
        /^## (.*$)/gm,
        '<h2 class="text-xl font-semibold text-gray-200 mb-3">$1</h2>'
      )
      .replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-semibold text-white">$1</strong>'
      )
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-300">$1</em>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 text-gray-300 mb-1">$1</li>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 text-gray-300 mb-1">• $1</li>')
      .replace(/\n/g, "<br>");
  };

  const PostCard = ({ post, onClick }) => (
    <div
      className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-gray-700/50 p-6 hover:border-gray-600/50 transition-all duration-200 cursor-pointer hover:transform hover:scale-[1.02]"
      onClick={() => onClick(post)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{post.avatar}</div>
          <div>
            <h3 className="font-semibold text-white">{post.author}</h3>
            <p className="text-sm text-gray-400 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {post.timestamp}
            </p>
          </div>
        </div>
        {post.category && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              post.category === "career"
                ? "bg-blue-500/20 text-blue-400"
                : post.category === "contest"
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-green-500/20 text-green-400"
            }`}
          >
            {post.category.toUpperCase()}
          </span>
        )}
      </div>

      <h2 className="text-lg font-semibold text-white mb-4 line-clamp-2">
        {post.title}
      </h2>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <MessageSquare className="w-4 h-4" />
            <span>{post.commentCount} comments</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="w-4 h-4" />
            <span>{post.likes} likes</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );

  const CommentSection = ({ comments, postId }) => (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="text-lg">{comment.avatar}</div>
              <div>
                <h4 className="font-medium text-white">{comment.author}</h4>
                <p className="text-xs text-gray-400">{comment.timestamp}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <button className="flex items-center space-x-1 hover:text-red-400">
                <Heart className="w-3 h-3" />
                <span className="text-xs">{comment.likes}</span>
              </button>
              <button
                className="flex items-center space-x-1 hover:text-blue-400"
                onClick={() =>
                  setReplyTo(replyTo === comment.id ? null : comment.id)
                }
              >
                <Reply className="w-3 h-3" />
                <span className="text-xs">Reply</span>
              </button>
            </div>
          </div>

          <p className="text-gray-300 text-sm mb-3">{comment.content}</p>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-6 space-y-3 border-l-2 border-gray-700 pl-4">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="bg-slate-700/50 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="text-sm">{reply.avatar}</div>
                      <div>
                        <h5 className="text-sm font-medium text-white">
                          {reply.author}
                        </h5>
                        <p className="text-xs text-gray-400">
                          {reply.timestamp}
                        </p>
                      </div>
                    </div>
                    <button className="flex items-center space-x-1 text-gray-400 hover:text-red-400">
                      <Heart className="w-3 h-3" />
                      <span className="text-xs">{reply.likes}</span>
                    </button>
                  </div>
                  <p className="text-gray-300 text-sm">{reply.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Reply Input */}
          {replyTo === comment.id && (
            <div className="ml-6 mt-3">
              <div className="flex space-x-3">
                <div className="text-lg">👤</div>
                <div className="flex-1">
                  <textarea
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full p-3 bg-slate-700 border border-gray-600 rounded-lg text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="2"
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => setReplyTo(null)}
                      className="px-3 py-1 text-sm text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button className="px-4 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 flex items-center space-x-1">
                      <Send className="w-3 h-3" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add Comment */}
      <div className="bg-slate-800/30 rounded-lg p-4 border-2 border-dashed border-gray-600">
        <div className="flex space-x-3">
          <div className="text-2xl">👤</div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-3 bg-slate-700 border border-gray-600 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows="3"
            />
            <div className="flex justify-between items-center mt-3">
              <p className="text-xs text-gray-400">
                Be respectful and constructive
              </p>
              <button className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>Comment</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <div className="bg-slate-800 border-b border-gray-700 p-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedPost(null)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to discussions</span>
            </button>

            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{selectedPost.avatar}</div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {selectedPost.title}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span className="font-medium">{selectedPost.author}</span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {selectedPost.timestamp}
                    </span>
                    <span className="flex items-center">
                      <Heart className="w-3 h-3 mr-1" />
                      {selectedPost.likes} likes
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {selectedPost.commentCount} comments
                    </span>
                  </div>
                </div>
              </div>

              {selectedPost.category && (
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedPost.category === "career"
                      ? "bg-blue-500/20 text-blue-400"
                      : selectedPost.category === "contest"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {selectedPost.category.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-gray-700/50 p-8 mb-8">
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(selectedPost.content),
              }}
            />
          </div>

          {/* Comments Section */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Comments ({selectedPost.commentCount})
            </h3>
            <CommentSection
              comments={selectedPost.comments}
              postId={selectedPost.id}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center">
            <Users className="w-8 h-8 mr-3 text-purple-400" />
            Community Discussions
          </h1>
          <p className="text-xl text-gray-300">
            Connect, share experiences, and learn from fellow job seekers
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-slate-800 p-1 rounded-lg w-fit mx-auto">
          <button
            onClick={() => setActiveTab("platform")}
            className={`px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === "platform"
                ? "bg-purple-500 text-white"
                : "text-gray-400 hover:text-white hover:bg-slate-700"
            }`}
          >
            Platform Posts
          </button>
          <button
            onClick={() => setActiveTab("user")}
            className={`px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === "user"
                ? "bg-purple-500 text-white"
                : "text-gray-400 hover:text-white hover:bg-slate-700"
            }`}
          >
            User Posts
          </button>
        </div>

        {/* Platform Posts */}
        {activeTab === "platform" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <MessageSquare className="w-6 h-6 mr-2 text-blue-400" />
                Platform Updates & Announcements
              </h2>
            </div>

            <div className="space-y-4">
              {platformPosts.map((post) => (
                <PostCard key={post.id} post={post} onClick={setSelectedPost} />
              ))}
            </div>
          </div>
        )}

        {/* User Posts */}
        {activeTab === "user" && (
          <div className="space-y-6">
            {/* Categories and Create Button */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-md font-medium transition-all flex items-center space-x-2 ${
                        selectedCategory === category.id
                          ? "bg-slate-700 text-white"
                          : "text-gray-400 hover:text-white hover:bg-slate-700/50"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${category.color}`} />
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>

              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Create Post</span>
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button className="px-4 py-3 bg-slate-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {filteredUserPosts.length > 0 ? (
                filteredUserPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onClick={setSelectedPost}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No posts found in this category.</p>
                  <p className="text-sm mt-1">
                    Be the first to start a discussion!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
