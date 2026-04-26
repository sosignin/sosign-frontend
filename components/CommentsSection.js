"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import LoginModal from "./LoginModal";
import config from "../config/api";
import { Clock, ThumbsUp } from "lucide-react";

const CommentsSection = ({ petitionId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { user } = useAuth();

  // Fetch comments
  const fetchComments = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      console.log(
        `Fetching comments for petition ${petitionId}, page ${pageNum}`
      );
      console.log("API URL:", config.API_BASE_URL);

      const response = await fetch(
        `${config.API_BASE_URL}/api/comments/petition/${petitionId}?page=${pageNum}&limit=10`
      );

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        if (append) {
          setComments((prev) => [...prev, ...(data.comments || [])]);
        } else {
          setComments(data.comments || []);
        }
        setHasMore(data.hasNextPage || false);
      } else {
        setError(data.message || "Failed to fetch comments");
      }
    } catch (err) {
      setError("Failed to fetch comments");
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (petitionId) {
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petitionId]);

  // Scroll to specific comment if hash is present in URL
  useEffect(() => {
    if (!loading && comments.length > 0) {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#comment-')) {
        const commentId = hash.replace('#comment-', '');
        const commentElement = document.getElementById(`comment-${commentId}`);
        if (commentElement) {
          // Wait a bit for the page to fully render
          setTimeout(() => {
            commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add highlight effect
            commentElement.classList.add('ring-2', 'ring-[#F43676]', 'ring-offset-2');
            setTimeout(() => {
              commentElement.classList.remove('ring-2', 'ring-[#F43676]', 'ring-offset-2');
            }, 3000);
          }, 300);
        }
      }
    }
  }, [loading, comments]);

  // Submit new comment
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      console.log("Submitting comment...");

      let userInfo = null;
      try {
        const stored = localStorage.getItem("user");
        userInfo = stored ? JSON.parse(stored) : null;
        console.log(
          "User info from localStorage:",
          userInfo ? "Found" : "Not found"
        );
      } catch (err) {
        console.error("Error parsing user data from localStorage:", err);
        setError("Authentication error. Please log in again.");
        return;
      }

      if (!userInfo?.token) {
        console.error("No token found in user info");
        setError("Authentication error. Please log in again.");
        return;
      }

      console.log("Making API call to submit comment");
      const response = await fetch(`${config.API_BASE_URL}/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({
          petitionId,
          content: newComment.trim(),
        }),
      });

      console.log("Submit comment response status:", response.status);
      const data = await response.json();
      console.log("Submit comment response data:", data);

      if (data.success) {
        setNewComment("");
        fetchComments(); // Refresh comments
      } else {
        setError(data.message || "Failed to submit comment");
      }
    } catch (err) {
      setError("Failed to submit comment");
      console.error("Error submitting comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Edit comment
  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      let userInfo = null;
      try {
        const stored = localStorage.getItem("user");
        userInfo = stored ? JSON.parse(stored) : null;
      } catch (err) {
        console.error("Error parsing user data from localStorage:", err);
        setError("Authentication error. Please log in again.");
        return;
      }

      if (!userInfo?.token) {
        setError("Authentication error. Please log in again.");
        return;
      }

      const response = await fetch(
        `${config.API_BASE_URL}/api/comments/${commentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
          },
          body: JSON.stringify({
            content: editContent.trim(),
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setEditingComment(null);
        setEditContent("");
        fetchComments(); // Refresh comments
      } else {
        setError(data.message || "Failed to update comment");
      }
    } catch (err) {
      setError("Failed to update comment");
      console.error("Error updating comment:", err);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      let userInfo = null;
      try {
        const stored = localStorage.getItem("user");
        userInfo = stored ? JSON.parse(stored) : null;
      } catch (err) {
        console.error("Error parsing user data from localStorage:", err);
        setError("Authentication error. Please log in again.");
        return;
      }

      if (!userInfo?.token) {
        setError("Authentication error. Please log in again.");
        return;
      }

      const response = await fetch(
        `${config.API_BASE_URL}/api/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchComments(); // Refresh comments
      } else {
        setError(data.message || "Failed to delete comment");
      }
    } catch (err) {
      setError("Failed to delete comment");
      console.error("Error deleting comment:", err);
    }
  };

  // Toggle like
  const handleToggleLike = async (commentId) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    try {
      let userInfo = null;
      try {
        const stored = localStorage.getItem("user");
        userInfo = stored ? JSON.parse(stored) : null;
      } catch (err) {
        console.error("Error parsing user data from localStorage:", err);
        setError("Authentication error. Please log in again.");
        return;
      }

      if (!userInfo?.token) {
        setError("Authentication error. Please log in again.");
        return;
      }

      const response = await fetch(
        `${config.API_BASE_URL}/api/comments/${commentId}/like`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        // Update the comment in the state
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentId
              ? {
                ...comment,
                likes: data.isLiked
                  ? [
                    ...(comment.likes || []),
                    { user: { _id: user._id, name: user.name } },
                  ]
                  : (comment.likes || []).filter(
                    (like) => like?.user?._id !== user._id
                  ),
              }
              : comment
          )
        );
      } else {
        setError(data.message || "Failed to toggle like");
      }
    } catch (err) {
      setError("Failed to toggle like");
      console.error("Error toggling like:", err);
    }
  };

  // Submit reply
  const handleSubmitReply = async (commentId) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!replyContent.trim()) return;

    try {
      let userInfo = null;
      try {
        const stored = localStorage.getItem("user");
        userInfo = stored ? JSON.parse(stored) : null;
      } catch (err) {
        console.error("Error parsing user data from localStorage:", err);
        setError("Authentication error. Please log in again.");
        return;
      }

      if (!userInfo?.token) {
        setError("Authentication error. Please log in again.");
        return;
      }

      const response = await fetch(
        `${config.API_BASE_URL}/api/comments/${commentId}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
          },
          body: JSON.stringify({
            content: replyContent.trim(),
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setReplyingTo(null);
        setReplyContent("");
        fetchComments(); // Refresh comments
      } else {
        setError(data.message || "Failed to submit reply");
      }
    } catch (err) {
      setError("Failed to submit reply");
      console.error("Error submitting reply:", err);
    }
  };

  // Load more comments
  const loadMoreComments = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchComments(nextPage, true);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const isLikedByUser = (comment) => {
    if (!user || !comment?.likes) return false;
    return comment.likes.some((like) => like?.user?._id === user._id);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Comments</h2>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-medium">Error: {error}</p>
        </div>
      )}

      {/* Add Comment Form */}
      <div className="mb-8">
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts about this petition..."
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="4"
            maxLength="1000"
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {newComment.length}/1000 characters
            </span>
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="bg-[#3650AD] text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {loading && comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">
              No comments yet. Be the first to comment!
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {comments
              .filter((comment) => {
                // Show approved comments to everyone
                // Show unapproved comments only to the owner
                const isOwner = user && user._id === comment?.user?._id;
                return comment.isApproved || isOwner;
              })
              .map((comment) => {
                const isOwner = user && user._id === comment?.user?._id;

                return (
                  <motion.div
                    key={comment._id}
                    id={`comment-${comment._id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`border border-gray-200 rounded-lg p-4 transition-all duration-300 ${!comment.isApproved ? 'bg-yellow-50 border-yellow-200' : ''}`}
                  >
                    {/* Comment Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#3650AD] rounded-full flex items-center justify-center text-white font-medium">
                          {comment?.user?.name
                            ? comment.user.name.charAt(0).toUpperCase()
                            : "?"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {comment?.user?.name || "Unknown User"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {comment?.user?.designation || "Citizen"} •{" "}
                            {formatDate(comment.createdAt)}
                            {comment.isEdited && (
                              <span className="text-gray-400 ml-1">(edited)</span>
                            )}
                          </p>
                        </div>
                        {/* Pending Approval Badge */}
                        {!comment.isApproved && (
                          <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pending Approval
                          </span>
                        )}
                      </div>
                      {user && user._id === comment?.user?._id && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingComment(comment._id);
                              setEditContent(comment.content);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Comment Content */}
                    {editingComment === comment._id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows="3"
                          maxLength="1000"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditComment(comment._id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingComment(null);
                              setEditContent("");
                            }}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-800 mb-3">{comment?.content || ""}</p>
                    )}

                    {/* Comment Actions */}
                    <div className="flex items-center space-x-4 text-sm">
                      <button
                        onClick={() => handleToggleLike(comment._id)}
                        className={`flex items-center space-x-1 ${isLikedByUser(comment)
                          ? "text-blue-600"
                          : "text-gray-500 hover:text-blue-600"
                          }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{(comment?.likes || []).length}</span>
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(
                            replyingTo === comment._id ? null : comment._id
                          );
                          setReplyContent("");
                        }}
                        className="text-gray-500 hover:text-blue-600"
                      >
                        Reply
                      </button>
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment._id && (
                      <div className="mt-4 pl-8 border-l-2 border-gray-200">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmitReply(comment._id);
                          }}
                          className="space-y-3"
                        >
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows="2"
                            maxLength="500"
                          />
                          <div className="flex space-x-2">
                            <button
                              type="submit"
                              disabled={!replyContent.trim()}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                            >
                              Reply
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyContent("");
                              }}
                              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Replies */}
                    {comment?.replies && comment.replies.length > 0 && (
                      <div className="mt-4 pl-8 border-l-2 border-gray-200 space-y-3">
                        {comment.replies.map((reply) => (
                          <div
                            key={reply._id}
                            className="bg-gray-50 rounded-lg p-3"
                          >
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                {reply?.user?.name
                                  ? reply.user.name.charAt(0).toUpperCase()
                                  : "?"}
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-900">
                                  {reply?.user?.name || "Unknown User"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(reply.createdAt)}
                                  {reply.isEdited && (
                                    <span className="text-gray-400 ml-1">
                                      (edited)
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-800">
                              {reply?.content || ""}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
          </AnimatePresence>
        )}

        {/* Load More Button */}
        {hasMore && comments.length > 0 && (
          <div className="text-center pt-4">
            <button
              onClick={loadMoreComments}
              disabled={loading}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition duration-300 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load More Comments"}
            </button>
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default CommentsSection;
