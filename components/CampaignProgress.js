"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Image as ImageIcon,
  FileText,
  Video,
  ThumbsUp,
  CheckCircle,
  AlertCircle,
  X,
  UploadCloud,
  Milestone,
  Target,
} from "lucide-react";

export default function CampaignProgress({ petitionId, isCreator, petition }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [targetSignatures, setTargetSignatures] = useState(Number(petition?.targetSignatures) || 0);
  const [targetInput, setTargetInput] = useState(petition?.targetSignatures ? String(petition.targetSignatures) : "");
  const [targetSubmitting, setTargetSubmitting] = useState(false);
  const [targetError, setTargetError] = useState("");
  
  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [updateType, setUpdateType] = useState("text");
  const [milestoneLabel, setMilestoneLabel] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);

  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);

  useEffect(() => {
    const nextTarget = Number(petition?.targetSignatures) || 0;
    setTargetSignatures(nextTarget);
    setTargetInput(nextTarget > 0 ? String(nextTarget) : "");
  }, [petition?.targetSignatures, petitionId]);

  const signatureCount = Number(petition?.numberOfSignatures) || 0;
  const targetNumber = Number(targetSignatures) || 0;
  const signatureProgressPercentage =
    targetNumber > 0 ? Math.min(Math.floor((signatureCount / targetNumber) * 100), 100) : 0;
  const remainingSignatures = targetNumber > 0 ? Math.max(targetNumber - signatureCount, 0) : 0;

  const fetchUpdates = useCallback(async () => {
    try {
      setLoading(true);
      // Determine if there is a logged in user to pass token for reaction status
      const userInfo = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) : null;
      const headers = userInfo ? { Authorization: `Bearer ${userInfo.token}` } : {};
      
      const response = await fetch(`/api/progress-updates/${petitionId}`, { headers });
      if (!response.ok) throw new Error("Failed to fetch updates");
      const data = await response.json();
      setUpdates(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [petitionId]);

  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 4); // Max 4
      setSelectedImages((prev) => [...prev, ...filesArray].slice(0, 4));
    }
  };

  const handleDocChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).filter(f => f.type === 'application/pdf').slice(0, 2); // Max 2
      setSelectedDocs((prev) => [...prev, ...filesArray].slice(0, 2));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setSubmitting(true);
      const userInfo = JSON.parse(localStorage.getItem("user"));
      const formData = new FormData();
      
      formData.append("title", title);
      formData.append("content", content);
      formData.append("updateType", updateType);
      
      if (updateType === "milestone" && milestoneLabel) {
        formData.append("milestoneLabel", milestoneLabel);
        formData.append("milestoneStatus", "completed");
      }
      if (updateType === "video" && videoUrl) {
        formData.append("videoUrl", videoUrl);
      }

      selectedImages.forEach((img) => formData.append("images", img));
      selectedDocs.forEach((doc) => formData.append("documents", doc));

      const response = await fetch(`/api/progress-updates/${petitionId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to post update");

      const newUpdate = await response.json();
      setUpdates([newUpdate, ...updates]);
      
      // Reset form
      setShowForm(false);
      setTitle("");
      setContent("");
      setUpdateType("text");
      setSelectedImages([]);
      setSelectedDocs([]);
      setMilestoneLabel("");
      setVideoUrl("");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTargetSubmit = async (e) => {
    e.preventDefault();
    const nextTarget = Number(targetInput);

    if (!Number.isInteger(nextTarget) || nextTarget < 1) {
      setTargetError("Enter a valid target signature count.");
      return;
    }

    const userInfo = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) : null;
    if (!userInfo?.token) {
      setTargetError("Please login to update the target.");
      return;
    }

    try {
      setTargetSubmitting(true);
      setTargetError("");

      const response = await fetch(`/api/progress-updates/${petitionId}/progress`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetSignatures: nextTarget }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update target signatures");
      }

      const savedTarget = Number(data.targetSignatures) || nextTarget;
      setTargetSignatures(savedTarget);
      setTargetInput(String(savedTarget));
    } catch (err) {
      setTargetError(err.message);
    } finally {
      setTargetSubmitting(false);
    }
  };

  const handleReact = async (updateId) => {
    const userInfo = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) : null;
    if (!userInfo) {
      alert("Please login to react");
      return;
    }

    try {
      const response = await fetch(`/api/progress-updates/update/${updateId}/react`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to react");
      
      const newReactions = await response.json();
      setUpdates(updates.map(u => u._id === updateId ? { ...u, reactions: newReactions } : u));
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to extract YouTube video ID
  const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const currentUserId = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user"))?._id : null;

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 md:p-8 mt-8 border border-gray-100 relative">
      {/* Decorative bg */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-[#F43676]/5 to-[#3650AD]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F43676]/10 to-[#F43676]/20 flex items-center justify-center border border-[#F43676]/20">
            <Milestone className="w-6 h-6 text-[#F43676]" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#1a1a2e] tracking-tight">Campaign Progress</h2>
            <p className="text-sm text-gray-500 font-medium mt-0.5">Track the impact and latest updates</p>
          </div>
        </div>
        
        {isCreator && (
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 flex items-center gap-2 ${showForm ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-gradient-to-r from-[#3650AD] to-[#F43676] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"}`}
          >
            {showForm ? "Cancel" : "Post Update"}
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-10 bg-gray-50 p-5 rounded-2xl border border-gray-100">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-3">
          <div>
            <span className="font-bold text-gray-700 text-sm uppercase tracking-wider">Signature Target Progress</span>
            <p className="text-sm text-gray-500 mt-1">
              {signatureCount.toLocaleString()} signatures
              {targetNumber > 0 ? ` of ${targetNumber.toLocaleString()} target` : " collected"}
            </p>
          </div>
          <span className="font-black text-2xl text-[#1a1a2e]">{signatureProgressPercentage}%</span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${signatureProgressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-[#3650AD] via-purple-500 to-[#F43676] rounded-full relative"
          >
            <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
          </motion.div>
        </div>

        {targetNumber > 0 && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-gray-500">
            <span>{remainingSignatures.toLocaleString()} signatures remaining to target</span>
            <span className="sm:text-right">Signing remains open after 100%</span>
          </div>
        )}

        {isCreator && (
          <form onSubmit={handleTargetSubmit} className="mt-5 pt-5 border-t border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Target Signatures</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={targetInput}
                  onChange={(e) => {
                    setTargetInput(e.target.value);
                    setTargetError("");
                  }}
                  placeholder="1000"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3650AD] focus:border-transparent font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={targetSubmitting}
                className="px-5 py-3 rounded-xl bg-[#3650AD] text-white font-bold hover:bg-[#2b4089] transition-colors disabled:opacity-70"
              >
                {targetSubmitting ? "Saving..." : "Save Target"}
              </button>
            </div>
            {targetError && (
              <p className="text-sm text-red-500 mt-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {targetError}
              </p>
            )}
          </form>
        )}
      </div>

      {/* Create Update Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            onSubmit={handleSubmit}
            className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl overflow-hidden"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Update Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., Met with municipal officer today"
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3650AD] focus:border-transparent transition-shadow font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Update Details</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share what happened..."
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3650AD] focus:border-transparent transition-shadow min-h-[120px] resize-y"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Type of Update</label>
                  <select
                    value={updateType}
                    onChange={(e) => setUpdateType(e.target.value)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3650AD] focus:border-transparent font-medium"
                  >
                    <option value="text">General Update (Text)</option>
                    <option value="image">Photo Update</option>
                    <option value="document">Official Document (PDF)</option>
                    <option value="video">Video Link (YouTube)</option>
                    <option value="milestone">Milestone Reached</option>
                  </select>
                </div>
              </div>

              {updateType === "image" && (
                <div className="pt-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Photos (Max 4)</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <div className="flex flex-wrap gap-3">
                    {selectedImages.map((file, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setSelectedImages(selectedImages.filter((_, idx) => idx !== i))}
                          className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    {selectedImages.length < 4 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-blue-400 hover:text-blue-500 transition-colors"
                      >
                        <UploadCloud className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-medium">Add Photo</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {updateType === "document" && (
                <div className="pt-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Upload PDF Document</label>
                  <input
                    type="file"
                    ref={docInputRef}
                    onChange={handleDocChange}
                    accept="application/pdf"
                    className="hidden"
                  />
                  <div className="flex flex-col gap-2">
                    {selectedDocs.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedDocs(selectedDocs.filter((_, idx) => idx !== i))}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {selectedDocs.length < 1 && (
                      <button
                        type="button"
                        onClick={() => docInputRef.current?.click()}
                        className="w-full p-4 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50 hover:border-red-400 hover:text-red-500 transition-colors"
                      >
                        <UploadCloud className="w-5 h-5" />
                        <span className="text-sm font-medium">Select PDF File</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {updateType === "video" && (
                <div className="pt-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">YouTube Video Link</label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3650AD] focus:border-transparent"
                  />
                </div>
              )}

              {updateType === "milestone" && (
                <div className="pt-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Milestone Reached</label>
                  <input
                    type="text"
                    value={milestoneLabel}
                    onChange={(e) => setMilestoneLabel(e.target.value)}
                    placeholder="E.g., 10,000 Signatures"
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3650AD] focus:border-transparent"
                  />
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-[#1a1a2e] text-white rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {submitting ? "Posting..." : "Post Update"}
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-[20px] md:left-[39px] top-4 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 via-gray-200 to-transparent"></div>
        
        {/* Creation Node - Always at the bottom */}
        <div className="relative pl-12 md:pl-20 py-4 mb-4 mt-8 opacity-70">
          <div className="absolute left-[13px] md:left-[32px] top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-300 border-4 border-white rounded-full z-10 shadow-sm"></div>
          <p className="font-semibold text-gray-600">Petition Created</p>
          <p className="text-xs text-gray-400 mt-1">{new Date(petition?.createdAt).toLocaleDateString()}</p>
        </div>

        {loading ? (
          <div className="pl-12 md:pl-20 py-8 text-gray-500 font-medium animate-pulse">Loading updates...</div>
        ) : error ? (
          <div className="pl-12 md:pl-20 py-8 text-red-500 font-medium flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        ) : updates.length === 0 ? (
          <div className="pl-12 md:pl-20 py-8 text-gray-500 italic">No progress updates yet.</div>
        ) : (
          <>
            <div className="flex flex-col-reverse">
              {(isExpanded ? updates : updates.slice(-3)).map((update, index) => {
                const hasReacted = currentUserId && update.reactions?.some(r => r.user === currentUserId);
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={update._id}
                  className="relative pl-12 md:pl-16 py-6 group"
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-[11px] md:left-[26px] top-8 w-[19px] h-[19px] bg-white border-4 border-[#3650AD] rounded-full z-10 shadow-[0_0_0_3px_white,0_0_8px_rgba(54,80,173,0.4)] group-hover:scale-125 group-hover:border-[#F43676] transition-all duration-300"></div>

                  {/* Update Card */}
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
                    
                    {/* Date badge - inline at top of card */}
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs font-bold text-gray-500 uppercase">
                        {new Date(update.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(update.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        {update.updateType === "milestone" && update.milestone && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider mb-2">
                            <CheckCircle className="w-3 h-3" />
                            Milestone Reached
                          </span>
                        )}
                        <h3 className="text-lg font-bold text-[#1a1a2e] leading-snug">
                          {update.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                            {update.author?.profilePicture ? (
                              <img src={update.author.profilePicture} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-700 text-[10px] font-bold">
                                {update.author?.name?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-medium text-gray-600">{update.author?.name}</span>
                        </div>
                      </div>
                      
                      {/* Icon based on type */}
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">
                        {update.updateType === "image" && <ImageIcon className="w-4 h-4" />}
                        {update.updateType === "document" && <FileText className="w-4 h-4" />}
                        {update.updateType === "video" && <Video className="w-4 h-4" />}
                        {update.updateType === "text" && <FileText className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed mb-4">
                      {update.content}
                    </p>

                    {/* Media content */}
                    {update.images && update.images.length > 0 && (
                      <div className={`grid gap-2 mb-4 ${update.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {update.images.map((img, i) => (
                          <div key={i} className={`relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 ${update.images.length === 1 ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>
                            <Image src={img} alt="Update image" fill className="object-cover hover:scale-105 transition-transform duration-500" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Documents */}
                    {update.documents && update.documents.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {update.documents.map((doc, i) => (
                          <a 
                            key={i} 
                            href={doc.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{doc.filename}</p>
                              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">PDF Document</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Video */}
                    {update.videoUrl && (
                      <div className="mb-4 rounded-xl overflow-hidden shadow-inner bg-black aspect-video">
                        {getYoutubeId(update.videoUrl) ? (
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${getYoutubeId(update.videoUrl)}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                            <a href={update.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#F43676] transition-colors">
                              <Video className="w-6 h-6" /> Watch Video
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                      <button 
                        onClick={() => handleReact(update._id)}
                        className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${hasReacted ? 'text-[#F43676]' : 'text-gray-500 hover:text-[#3650AD]'}`}
                      >
                        <div className={`p-1.5 rounded-full ${hasReacted ? 'bg-pink-50' : 'bg-gray-50 group-hover:bg-gray-100'}`}>
                          <ThumbsUp className={`w-4 h-4 ${hasReacted ? 'fill-[#F43676]' : ''}`} />
                        </div>
                        {update.reactions?.length || 0}
                      </button>
                    </div>

                  </div>
                </motion.div>
              );
            })}
            </div>
            
            {updates.length > 3 && (
              <div className="pl-12 md:pl-16 py-4 flex justify-center">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="px-6 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-full border border-gray-200 transition-colors shadow-sm"
                >
                  {isExpanded ? "Show less updates" : `View all ${updates.length} updates`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
