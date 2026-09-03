"use client";

import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import UserGrievancesDashboard from "../../components/UserGrievancesDashboard";
import SubmitStallReportModal from "../../components/SubmitStallReportModal";
import Link from "next/link";
import { FaChevronLeft, FaShieldAlt } from "react-icons/fa";

export default function MyGrievancesPage() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link
            href="/"
            className="hover:text-[#F43676] flex items-center gap-1 transition-colors"
          >
            <FaChevronLeft className="text-[9px]" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">My Reported Food Stalls</span>
        </div>

        {/* Complaints Dashboard */}
        <UserGrievancesDashboard
          onOpenReportModal={() => setIsReportModalOpen(true)}
          embedded={false}
        />
      </main>

      <Footer />

      {/* Report Modal */}
      {isReportModalOpen && (
        <SubmitStallReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          onSuccess={() => setIsReportModalOpen(false)}
        />
      )}
    </div>
  );
}
