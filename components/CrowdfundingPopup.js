"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaHandHoldingHeart, FaCheck, FaXmark } from "react-icons/fa6";

export default function CrowdfundingPopup({ delay = 1200 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if user has already dismissed the popup in this session
    const hasSeen = sessionStorage.getItem("sosign_crowdfunding_popup_seen");
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    try {
      sessionStorage.setItem("sosign_crowdfunding_popup_seen", "true");
    } catch {
      // Handle private browsing storage limitations
    }
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50"
            onClick={handleClose}
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-7 z-10"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="crowdfunding-modal-title"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors cursor-pointer"
              aria-label="Close"
            >
              <FaXmark className="text-base" />
            </button>

            {/* Icon & Label */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#F43676] flex items-center justify-center shrink-0">
                <FaHandHoldingHeart className="text-lg" />
              </div>
              <span className="text-xs font-semibold text-[#F43676] uppercase tracking-wider">
                SoSign Crowdfunding
              </span>
            </div>

            {/* Heading & Subtext */}
            <h2
              id="crowdfunding-modal-title"
              className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug"
            >
              Need Financial Support for Your Cause?
            </h2>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              In addition to petitions, you can now launch a verified crowdfunding campaign to raise funds for medical emergencies, social welfare, or community projects.
            </p>

            {/* Value Points */}
            <div className="my-5 space-y-2.5 bg-pink-50/50 rounded-xl p-3.5 border border-pink-100">
              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
                <div className="w-4 h-4 rounded-full bg-pink-100 text-[#F43676] flex items-center justify-center shrink-0 mt-0.5">
                  <FaCheck className="text-[9px]" />
                </div>
                <span><strong>0% Platform Fee</strong> for genuine social and medical causes</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
                <div className="w-4 h-4 rounded-full bg-pink-100 text-[#F43676] flex items-center justify-center shrink-0 mt-0.5">
                  <FaCheck className="text-[9px]" />
                </div>
                <span><strong>Verified Campaigns</strong> with Aadhaar-backed trust</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
                <div className="w-4 h-4 rounded-full bg-pink-100 text-[#F43676] flex items-center justify-center shrink-0 mt-0.5">
                  <FaCheck className="text-[9px]" />
                </div>
                <span><strong>Simple 3-Minute Setup</strong> to start collecting donations</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-1">
              <Link
                href="/start-crowdfunding"
                onClick={handleClose}
                className="w-full block text-center bg-[#F43676] hover:bg-[#e02a60] text-white font-semibold py-3 px-5 rounded-xl text-sm transition-colors shadow-sm"
              >
                Start a Crowdfunding Campaign
              </Link>

              <div className="flex items-center justify-between pt-1 text-xs">
                <Link
                  href="/crowdfunding"
                  onClick={handleClose}
                  className="font-medium text-[#F43676] hover:text-[#e02a60] hover:underline"
                >
                  Explore active fundraisers →
                </Link>
                <button
                  onClick={handleClose}
                  className="font-medium text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
