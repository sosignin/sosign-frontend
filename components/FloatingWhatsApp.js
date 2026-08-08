"use client";

import React, { useState } from "react";
import { FaWhatsapp, FaTimes } from "react-icons/fa";

export default function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(true);

  // Phone number: +91 93236 77688
  const whatsappNumber = "919323677688";
  const defaultMessage = "Hello! I need help while creating a petition on SoSign.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 group pointer-events-auto">
      {/* Help Tooltip Banner */}
      {showTooltip && (
        <div className="relative bg-white text-slate-800 px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-100 flex items-center gap-3 text-xs font-semibold animate-bounce-subtle max-w-xs backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Need help creating a petition? Chat with us!</span>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full transition-colors cursor-pointer"
            aria-label="Close help message"
          >
            <FaTimes className="text-[10px]" />
          </button>
          {/* Arrow pointing down */}
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-emerald-100 rotate-45" />
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp for help creating a petition"
        className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-[#25D366] to-[#128C7E] text-white rounded-full shadow-2xl hover:shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all duration-300 group-hover:rotate-6 cursor-pointer"
      >
        {/* Pulse glow outer ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping pointer-events-none" />

        {/* WhatsApp Icon */}
        <FaWhatsapp className="text-3xl text-white drop-shadow-md relative z-10" />

        {/* Notification badge */}
        <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center border-2 border-white shadow-xs z-20">
          1
        </span>
      </a>
    </div>
  );
}
