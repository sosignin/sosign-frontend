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
  ChevronLeft,
  ChevronRight,
  Share2,
  Plus,
  TrendingUp,
  Play,
  Star,
  ExternalLink,
} from "lucide-react";

// Helper to extract YouTube video ID
const getYoutubeId = (url) => {
  if (!url || typeof url !== "string") return null;
  const regExp =
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
  const match = url.match(regExp);
  return match && match[1]?.length === 11 ? match[1] : null;
};

function ImageSlider({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;
  if (images.length === 1) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-900 w-full aspect-[4/3] md:aspect-[16/9] max-h-[350px] md:max-h-[450px]">
        <Image
          src={images[0]}
          alt="Update image"
          fill
          className="object-contain hover:scale-102 transition-transform duration-500"
        />
      </div>
    );
  }

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-900 w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] lg:aspect-[16/9] max-h-[350px] md:max-h-[450px] group">
      {/* Slides */}
      <div className="w-full h-full relative">
        <Image
          key={currentIndex}
          src={images[currentIndex]}
          alt={`Update image ${currentIndex + 1}`}
          fill
          className="object-contain transition-all duration-500 ease-in-out"
        />
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 z-20"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 z-20"
        aria-label="Next image"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Slide Indicators/Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 bg-black/30 px-2.5 py-1 rounded-full backdrop-blur-xs">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(i);
            }}
            className={`w-2 h-2 rounded-full transition-all ${currentIndex === i ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function VideoProductCard({ vUrl, vIdx, updateTitle, onPlay }) {
  const yId = getYoutubeId(vUrl);
  const thumbnailUrl = yId
    ? `https://img.youtube.com/vi/${yId}/hqdefault.jpg`
    : null;

  return (
    <div
      onClick={() => onPlay(vUrl)}
      className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer text-left"
    >
      {/* Top Image / Media Area */}
      <div className="relative w-full aspect-[4/3] bg-slate-950 overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`Video update ${vIdx + 1}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
            <Video className="w-10 h-10 text-gray-400" />
          </div>
        )}

        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10 opacity-75 group-hover:opacity-40 transition-opacity" />

        {/* Top-Left Trending Badge (Product Card Style) */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="w-7 h-7 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-md text-red-500 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-4 h-4 text-red-500" />
          </span>
        </div>

        {/* Top-Right HD Tag */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-bold text-white uppercase tracking-wider">
            HD Video
          </span>
        </div>

        {/* Center Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl group-hover:scale-115 group-hover:bg-red-700 transition-all duration-300">
            <Play className="w-5 h-5 ml-0.5 fill-white" />
          </div>
        </div>

        {/* Bottom-Left Rating-Style Pill Badge */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-[11px] font-bold text-gray-800 shadow-md">
            <span className="text-emerald-700 font-extrabold flex items-center gap-0.5">
              4.9 <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600">Video #{vIdx + 1}</span>
          </div>
        </div>
      </div>

      {/* Bottom Product-Style Details Area */}
      <div className="p-3.5 flex flex-col justify-between flex-1 bg-white">
        <div>
          {/* Brand/Heading line */}
          <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-tight group-hover:text-[#F43676] transition-colors truncate">
            {updateTitle ? `${updateTitle} - Part ${vIdx + 1}` : `Video Update #${vIdx + 1}`}
          </h4>
          {/* Subtitle / Category line */}
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
            Official Video • Progress Report
          </p>
        </div>

        {/* Action Link / Price-Style Row */}
        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xs sm:text-sm text-gray-900">
              Watch Now
            </span>
            <span className="text-[11px] font-bold text-[#F43676]">
              (Free HD)
            </span>
          </div>
          <span className="text-xs font-bold text-[#3650AD] group-hover:text-[#F43676] flex items-center gap-1 transition-colors">
            Play <Play className="w-3 h-3 fill-current" />
          </span>
        </div>
      </div>
    </div>
  );
}

function ProgressUpdateCard({ update, index, currentUserId, handleReact, getYoutubeId }) {
  const hasReacted = currentUserId && update.reactions?.some(r => r.user === currentUserId);
  const [selectedVideo, setSelectedVideo] = useState(null);

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
          <div className="mb-4">
            <ImageSlider images={update.images} />
          </div>
        )}

        {/* Documents */}
        {update.documents && update.documents.length > 0 && (
          <div className="space-y-2 mb-4">
            {update.documents.map((doc, i) => {
              const handleDownload = async (e) => {
                e.preventDefault();
                try {
                  const proxyUrl = `/api/download-document?url=${encodeURIComponent(doc.url)}&filename=${encodeURIComponent(doc.filename || 'document.pdf')}`;
                  const response = await fetch(proxyUrl);
                  if (!response.ok) throw new Error('Download failed');
                  const blob = await response.blob();
                  const blobUrl = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = blobUrl;
                  a.download = doc.filename || 'document.pdf';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(blobUrl);
                } catch (err) {
                  window.open(doc.url, '_blank');
                }
              };
              
              return (
                <button 
                  key={i} 
                  onClick={handleDownload}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors group w-full text-left cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{doc.filename}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">PDF Document • Click to Download</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Videos in Product Page Style Grid (with Gaps) */}
        {(() => {
          const allVideos = [];
          if (Array.isArray(update.videoUrls) && update.videoUrls.length > 0) {
            update.videoUrls.forEach((u) => {
              if (u && typeof u === "string" && u.trim() && !allVideos.includes(u.trim())) {
                allVideos.push(u.trim());
              }
            });
          }
          if (update.videoUrl && typeof update.videoUrl === "string") {
            const splitUrls = update.videoUrl.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
            splitUrls.forEach((u) => {
              if (!allVideos.includes(u)) allVideos.push(u);
            });
          }

          if (allVideos.length === 0) return null;

          return (
            <div className="mb-4">
              <div
                className={`grid gap-3.5 sm:gap-4 ${
                  allVideos.length === 1
                    ? "grid-cols-1 sm:grid-cols-2 max-w-xl"
                    : allVideos.length === 2
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                }`}
              >
                {allVideos.map((vUrl, vIdx) => (
                  <VideoProductCard
                    key={vIdx}
                    vUrl={vUrl}
                    vIdx={vIdx}
                    updateTitle={update.title}
                    onPlay={(url) => setSelectedVideo(url)}
                  />
                ))}
              </div>
            </div>
          );
        })()}

        {/* Video Player Modal */}
        <AnimatePresence>
          {selectedVideo && (
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedVideo(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25 }}
                className="relative w-full max-w-3xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 bg-slate-950/90 border-b border-slate-800 text-white">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    <h4 className="font-bold text-sm sm:text-base truncate">
                      {update.title || "Video Update"}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={selectedVideo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-gray-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>YouTube</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setSelectedVideo(null)}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      aria-label="Close video"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Video Player Embed */}
                <div className="w-full aspect-video bg-black">
                  {getYoutubeId(selectedVideo) ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${getYoutubeId(selectedVideo)}?autoplay=1`}
                      title="Update video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white">
                      <Video className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-sm font-semibold mb-3">External Video Link</p>
                      <a
                        href={selectedVideo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#F43676] text-white text-xs font-bold rounded-lg hover:bg-[#e02a60] transition-colors inline-flex items-center gap-1.5"
                      >
                        Open Video Link <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
}

export default function CampaignProgress({ petitionId, isCreator, petition }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const UPDATES_PER_PAGE = 2;

  const [targetSignatures, setTargetSignatures] = useState(Number(petition?.targetSignatures) || 0);
  const [targetInput, setTargetInput] = useState(petition?.targetSignatures ? String(petition.targetSignatures) : "");
  const [targetSubmitting, setTargetSubmitting] = useState(false);
  const [targetError, setTargetError] = useState("");
  
  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [updateType, setUpdateType] = useState("text");
  const [milestoneLabel, setMilestoneLabel] = useState("");
  const [videoUrls, setVideoUrls] = useState([""]);
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
      if (updateType === "video") {
        const validVideos = videoUrls
          .flatMap((u) => u.split(/[\n,]+/))
          .map((u) => u.trim())
          .filter((u) => u.length > 0);

        if (validVideos.length > 0) {
          formData.append("videoUrl", validVideos[0]);
          validVideos.forEach((v) => formData.append("videoUrls", v));
          formData.append("videoUrlsJson", JSON.stringify(validVideos));
        }
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

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to post update");
      }

      const newUpdate = await response.json();
      if (newUpdate.isApproved) {
        setUpdates((prev) => [newUpdate, ...prev]);
      }
      setCurrentPage(1);
      
      // Reset form
      setShowForm(false);
      setTitle("");
      setContent("");
      setUpdateType("text");
      setSelectedImages([]);
      setSelectedDocs([]);
      setMilestoneLabel("");
      setVideoUrls([""]);
      alert("Update posted successfully! It has been submitted for admin approval and will appear on the campaign once approved.");
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
        method: "POST",
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          "Content-Type": "application/json",
          "X-HTTP-Method-Override": "PUT",
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
        method: "POST",
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          "X-HTTP-Method-Override": "PUT",
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
            className="bg-gradient-to-br from-pink-50/60 via-white to-blue-50/50 border-2 border-pink-200/80 p-6 md:p-7 rounded-3xl overflow-hidden shadow-lg shadow-pink-500/5 mb-8"
          >
            {/* Form Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200/80 mb-5">
              <div>
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <span className="text-[#F43676]">📢</span> Post Campaign Update
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Keep your supporters updated with news, photos, videos, or milestone achievements.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Close form"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Type Selector Pills */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-2">
                  Select Update Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { type: "text", label: "General Text", icon: "📝" },
                    { type: "image", label: "Photos", icon: "📷" },
                    { type: "document", label: "PDF Document", icon: "📄" },
                    { type: "video", label: "YouTube Video", icon: "🎥" },
                    { type: "milestone", label: "Milestone", icon: "🏆" },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setUpdateType(item.type)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        updateType === item.type
                          ? "bg-[#F43676] text-white border-[#F43676] shadow-md shadow-pink-500/25 scale-102"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-1.5">
                  Update Headline / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., Meeting with Municipal Commissioner & High Court Petition Filed"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F43676]/30 focus:border-[#F43676] outline-none transition-all font-semibold text-sm text-gray-900"
                  required
                />
              </div>

              {/* Details Content */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-1.5">
                  Update Details & Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe what progress was achieved, upcoming steps, and how supporters can help..."
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F43676]/30 focus:border-[#F43676] outline-none transition-all min-h-[120px] resize-y text-sm text-gray-800"
                  required
                />
              </div>

              {/* Photo Upload */}
              {updateType === "image" && (
                <div className="pt-2 p-4 bg-white/80 rounded-2xl border border-gray-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700">
                      Upload Photos <span className="text-gray-400 font-medium">(Max 4 Images)</span>
                    </label>
                    <span className="text-[11px] font-bold text-gray-500">{selectedImages.length}/4 selected</span>
                  </div>
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
                      <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group shadow-xs">
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setSelectedImages(selectedImages.filter((_, idx) => idx !== i))}
                          className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    {selectedImages.length < 4 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 rounded-xl border-2 border-dashed border-pink-300 hover:border-[#F43676] bg-pink-50/40 hover:bg-pink-50 flex flex-col items-center justify-center text-pink-600 transition-all cursor-pointer"
                      >
                        <UploadCloud className="w-6 h-6 mb-1 text-[#F43676]" />
                        <span className="text-[10px] font-extrabold">+ Add Photo</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* PDF Document Upload */}
              {updateType === "document" && (
                <div className="pt-2 p-4 bg-white/80 rounded-2xl border border-gray-200/80">
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                    Official PDF Document
                  </label>
                  <input
                    type="file"
                    ref={docInputRef}
                    onChange={handleDocChange}
                    accept="application/pdf"
                    className="hidden"
                  />
                  <div className="flex flex-col gap-2">
                    {selectedDocs.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-gray-800 truncate">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedDocs(selectedDocs.filter((_, idx) => idx !== i))}
                          className="text-gray-400 hover:text-red-500 p-1.5 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {selectedDocs.length < 1 && (
                      <button
                        type="button"
                        onClick={() => docInputRef.current?.click()}
                        className="w-full p-5 rounded-xl border-2 border-dashed border-gray-300 hover:border-red-400 hover:bg-red-50/40 flex items-center justify-center gap-2 text-gray-600 hover:text-red-600 transition-all cursor-pointer"
                      >
                        <UploadCloud className="w-5 h-5 text-red-500" />
                        <span className="text-xs font-bold">Select PDF Document (Max 10MB)</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* YouTube Video Links */}
              {updateType === "video" && (
                <div className="pt-2 p-4 bg-white/80 rounded-2xl border border-gray-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700">
                      YouTube Video Links <span className="text-gray-400 font-medium">(Product-style video cards)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setVideoUrls([...videoUrls, ""])}
                      className="text-xs font-bold text-[#F43676] hover:text-[#d6255d] flex items-center gap-1 bg-pink-50 hover:bg-pink-100 px-3 py-1 rounded-lg transition-colors cursor-pointer border border-pink-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Another Video
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {videoUrls.map((url, idx) => {
                      const yId = getYoutubeId(url);
                      return (
                        <div key={idx} className="flex flex-col gap-1.5 p-3 bg-gray-50/90 rounded-xl border border-gray-200">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0">
                              {idx + 1}
                            </div>
                            <input
                              type="url"
                              value={url}
                              onChange={(e) => {
                                const updated = [...videoUrls];
                                updated[idx] = e.target.value;
                                setVideoUrls(updated);
                              }}
                              placeholder="Paste YouTube link (e.g. https://youtube.com/watch?v=... or https://youtu.be/...)"
                              className="flex-1 p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#F43676]/30 focus:border-[#F43676] outline-none"
                            />
                            {videoUrls.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setVideoUrls(videoUrls.filter((_, i) => i !== idx))}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                                title="Remove this video link"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Quick Live Detection Preview */}
                          {yId && (
                            <div className="flex items-center gap-2 mt-0.5 pl-8 text-xs text-emerald-700 bg-emerald-50/80 py-1 px-2.5 rounded-lg border border-emerald-100">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span className="font-medium truncate">Ready to embed (YouTube ID: {yId})</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Milestone Reached */}
              {updateType === "milestone" && (
                <div className="pt-2 p-4 bg-white/80 rounded-2xl border border-gray-200/80">
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                    Milestone Achievement Label
                  </label>
                  <input
                    type="text"
                    value={milestoneLabel}
                    onChange={(e) => setMilestoneLabel(e.target.value)}
                    placeholder="E.g., 25,000 Verified Citizens Joined the Mission"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F43676]/30 focus:border-[#F43676] outline-none text-sm font-semibold"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-gray-200/70 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#F43676] to-[#e02a60] hover:from-[#e02a60] hover:to-[#c41e50] text-white rounded-xl font-black text-xs shadow-md shadow-pink-500/25 hover:shadow-lg transition-all disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Posting Update...</span>
                    </>
                  ) : (
                    <>
                      <span>Post Update</span>
                      <TrendingUp className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Timeline Section */}
      <div id="campaign-progress-section" className="relative">
        {/* Vertical Line */}
        <div className="absolute left-[20px] md:left-[39px] top-4 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 via-gray-200 to-transparent"></div>

        {loading ? (
          <div className="pl-12 md:pl-20 py-8 text-gray-500 font-medium animate-pulse">Loading updates...</div>
        ) : error ? (
          <div className="pl-12 md:pl-20 py-8 text-red-500 font-medium flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        ) : updates.length === 0 ? (
          <div className="pl-12 md:pl-20 py-8 text-gray-500 italic">No progress updates posted yet.</div>
        ) : (
          <>
            {/* Paginated Updates List (2 updates per page) */}
            <div className="space-y-1">
              {updates
                .slice((currentPage - 1) * UPDATES_PER_PAGE, currentPage * UPDATES_PER_PAGE)
                .map((update, index) => (
                  <ProgressUpdateCard
                    key={update._id}
                    update={update}
                    index={index}
                    currentUserId={currentUserId}
                    handleReact={handleReact}
                    getYoutubeId={getYoutubeId}
                  />
                ))}
            </div>

            {/* Creation Node - Rendered at bottom of updates on the last page or when only 1 page */}
            {(currentPage === Math.ceil(updates.length / UPDATES_PER_PAGE) || updates.length <= UPDATES_PER_PAGE) && (
              <div className="relative pl-12 md:pl-20 py-4 mb-2 mt-4 opacity-75">
                <div className="absolute left-[13px] md:left-[32px] top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-300 border-4 border-white rounded-full z-10 shadow-sm"></div>
                <p className="font-semibold text-gray-700 text-sm">Petition Created</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(petition?.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            )}

            {/* Numbered Pagination (Displayed after 2 updates posted) */}
            {updates.length > UPDATES_PER_PAGE && (() => {
              const totalPages = Math.ceil(updates.length / UPDATES_PER_PAGE);
              const startIndex = (currentPage - 1) * UPDATES_PER_PAGE;
              const endIndex = startIndex + UPDATES_PER_PAGE;

              return (
                <div className="pl-6 md:pl-16 pt-6 pb-2 border-t border-gray-100 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-gray-500 font-semibold">
                    Showing <span className="text-gray-900 font-extrabold">{startIndex + 1}–{Math.min(endIndex, updates.length)}</span> of <span className="text-gray-900 font-extrabold">{updates.length}</span> updates
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Previous Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1);
                          const el = document.getElementById("campaign-progress-section");
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
                        }
                      }}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Prev</span>
                    </button>

                    {/* Page Number Buttons */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => {
                          setCurrentPage(pageNum);
                          const el = document.getElementById("campaign-progress-section");
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
                        }}
                        className={`w-8 h-8 rounded-xl text-xs font-black transition-all flex items-center justify-center cursor-pointer ${
                          currentPage === pageNum
                            ? "bg-[#F43676] text-white shadow-md shadow-pink-500/25 scale-105"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (currentPage < totalPages) {
                          setCurrentPage(currentPage + 1);
                          const el = document.getElementById("campaign-progress-section");
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
                        }
                      }}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}
