"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PenTool } from "lucide-react";

export default function YouHave() {
  const { data: petitions = [], isLoading: loading } = useQuery({
    queryKey: ["youHaveMissedPetitions"],
    queryFn: async () => {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      // Use the dedicated popular endpoint (optimized on backend)
      const response = await fetch(`${backendUrl}/api/petitions/popular?limit=4`);

      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      return data.petitions || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (loading) {
    return (
      <section className="bg-[#f0f2f5] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">
              You May Have Missed
            </h2>
            <span className="w-3 h-3 bg-[#F43676] rounded-full"></span>
          </div>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#F43676] border-t-transparent"></div>
            <p className="text-gray-600 mt-4">Loading petitions...</p>
          </div>
        </div>
      </section>
    );
  }

  if (petitions.length === 0) {
    return null; // Don't show section if no petitions
  }

  return (
    <section className="bg-[#f0f2f5] py-12 px-4 sm:px-6 lg:px-8">
      {/* White Card Container */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm">
        {/* Section Title */}
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">
            You May Have Missed
          </h2>
          <span className="w-3 h-3 bg-[#F43676] rounded-full"></span>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {petitions.map((petition) => (
            <Link
              key={petition._id}
              href={`/currentpetitions/${petition.slug || petition._id}`}
              className="group relative rounded-2xl overflow-hidden aspect-square"
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{
                  backgroundImage: petition.petitionDetails?.image
                    ? `url('${petition.petitionDetails.image}')`
                    : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
                }}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 p-4 flex flex-col justify-end">
                {/* Signature Count Badge - only show for 1000+ signatures */}
                {(petition.numberOfSignatures || 0) >= 1000 && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                  <PenTool className="w-3 h-3" />
                  {petition.numberOfSignatures || 0}
                </div>
                )}

                {/* Category Tag */}
                {petition.category && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 bg-[#fce4ec] text-[#F43676] rounded-full text-xs font-medium">
                      {petition.category.charAt(0).toUpperCase() + petition.category.slice(1)}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h3 className="text-white font-bold text-base leading-tight mb-3 group-hover:text-[#F43676] transition-colors line-clamp-2">
                  {petition.title}
                </h3>

                {/* Author Info */}
                <div className="flex items-center gap-2 text-sm mb-3">
                  <div className="w-5 h-5 rounded-full bg-gray-400 overflow-hidden">
                    {petition.petitionStarter?.user?.photoURL ? (
                      <img
                        src={petition.petitionStarter.user.photoURL}
                        alt={petition.petitionStarter.user.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={`https://ui-avatars.com/api/?name=${petition.petitionStarter?.user?.name || petition.petitionStarter?.name || "Anonymous"}&background=random&size=24`}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <span className="text-gray-300 text-xs truncate">
                    {petition.petitionStarter?.user?.name || petition.petitionStarter?.name || "Anonymous"}
                  </span>
                  <span className="text-[#F43676] text-xs">•</span>
                  <span className="text-gray-400 text-xs">
                    {new Date(petition.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                {/* Sign This Petition Button */}
                <div className="inline-flex items-center gap-1 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white px-4 py-1.5 rounded-full font-semibold text-xs hover:shadow-lg transition-all duration-200">
                  <PenTool className="w-3 h-3" /> Sign Petition
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
