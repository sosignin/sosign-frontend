"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { X, ZoomIn, ZoomOut, Check, Crop, Maximize, Square, RectangleHorizontal } from "lucide-react";

export default function ImageCropper({ imageFile, onCrop, onCancel }) {
  const [imgSrc, setImgSrc] = useState("");
  const [zoom, setZoom] = useState(1);
  const [aspectRatio, setAspectRatio] = useState(16 / 9); // Default to 16:9

  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => setImgSrc(reader.result);
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  // Reset zoom and position when aspect ratio changes
  useEffect(() => {
    setZoom(1);
    dragX.set(0);
    dragY.set(0);
  }, [aspectRatio, dragX, dragY]);

  const handleCrop = () => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // We want the output to be high resolution
    const targetWidth = 1200;
    const targetHeight = aspectRatio ? 1200 / aspectRatio : 1200 * (img.naturalHeight / img.naturalWidth);
    
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Calculate source rect from the current view
    const rect = img.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();

    // Scale between display size and natural size
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

    // Origin of the container relative to the image
    const sx = (contRect.left - rect.left) * scaleX;
    const sy = (contRect.top - rect.top) * scaleY;
    const sw = contRect.width * scaleX;
    const sh = contRect.height * scaleY;

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const croppedFile = new File([blob], imageFile.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          onCrop(croppedFile);
        }
      },
      "image/jpeg",
      0.85
    );
  };

  const aspectPresets = [
    { label: "16:9", value: 16 / 9, icon: <RectangleHorizontal className="w-4 h-4" /> },
    { label: "4:3", value: 4 / 3, icon: <RectangleHorizontal className="w-4 h-4 scale-x-75" /> },
    { label: "1:1", value: 1, icon: <Square className="w-4 h-4" /> },
    { label: "Free", value: null, icon: <Maximize className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-pink-100 p-2.5 rounded-2xl">
              <Crop className="w-6 h-6 text-[#F43676]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight">Edit Photo</h3>
              <p className="text-xs text-gray-500 font-medium">Pan and zoom to frame your cause</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2.5 hover:bg-gray-100 rounded-2xl transition-all duration-200">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Cropping Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div 
            className="relative w-full overflow-hidden rounded-3xl bg-gray-100 shadow-inner flex items-center justify-center"
            style={{ aspectRatio: aspectRatio || (imgRef.current?.naturalWidth / imgRef.current?.naturalHeight) || 16/9 }}
          >
            <div 
              ref={containerRef}
              className="absolute inset-0 z-10 pointer-events-none border-2 border-white/50 border-dashed m-2 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"
            ></div>
            
            <div className="absolute inset-0 z-0 bg-[#0a0a0f] flex items-center justify-center">
               {imgSrc && (
                 <motion.img
                   key={`${imgSrc}-${aspectRatio}`}
                   ref={imgRef}
                   src={imgSrc}
                   alt="Crop preview"
                   drag
                   dragMomentum={false}
                   style={{ 
                     scale: zoom,
                     x: dragX,
                     y: dragY,
                     cursor: "move",
                     touchAction: "none"
                   }}
                   className="max-w-none select-none"
                   onLoad={(e) => {
                     const img = e.target;
                     const container = containerRef.current.parentElement.getBoundingClientRect();
                     const imgRatio = img.naturalWidth / img.naturalHeight;
                     const contRatio = container.width / container.height;
                     
                     if (imgRatio > contRatio) {
                       img.style.height = "100%";
                       img.style.width = "auto";
                     } else {
                       img.style.width = "100%";
                       img.style.height = "auto";
                     }
                   }}
                 />
               )}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-8">
            {/* Aspect Ratio Selector */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Aspect Ratio</span>
              <div className="flex gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                {aspectPresets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setAspectRatio(preset.value)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                      aspectRatio === preset.value 
                        ? "bg-white text-[#F43676] shadow-sm border border-pink-100" 
                        : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                    }`}
                  >
                    {preset.icon}
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zoom Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center ml-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Zoom Level</span>
                <span className="text-xs font-bold text-[#F43676] bg-pink-50 px-2 py-0.5 rounded-md">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-4 px-2">
                <button onClick={() => setZoom(z => Math.max(1, z - 0.2))} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
                  <ZoomOut className="w-5 h-5" />
                </button>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#F43676]"
                />
                <button onClick={() => setZoom(z => Math.min(4, z + 0.2))} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
                  <ZoomIn className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 border-t flex gap-4 sticky bottom-0">
          <button
            onClick={onCancel}
            className="flex-1 py-4 px-6 border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-white hover:border-gray-300 transition-all duration-200 active:scale-[0.98]"
          >
            Discard
          </button>
          <button
            onClick={handleCrop}
            className="flex-2 py-4 px-8 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-pink-200 transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <Check className="w-6 h-6" />
            Apply Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}
