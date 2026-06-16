"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FaTrophy, FaArrowRight, FaUsers } from "react-icons/fa";

export default function SuccessStories() {
    const { data: petitions = [], isLoading: loading } = useQuery({
        queryKey: ["successfulPetitions"],
        queryFn: async () => {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await fetch(`${backendUrl}/api/successful-petitions?sort=signatures&limit=4`);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            return data.successfulPetitions || [];
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    const formatSignatures = (num) => {
        if (!num) return "0";
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + "M";
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + "K";
        }
        return num.toLocaleString();
    };

    if (loading) {
        return (
            <section className="bg-[#f0f2f5] py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <FaTrophy className="text-2xl text-[#F43676]" />
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#002050]">
                            Success Stories
                        </h2>
                        <span className="w-3 h-3 bg-[#F43676] rounded-full animate-pulse"></span>
                    </div>
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#F43676] border-t-transparent"></div>
                        <p className="text-[#302d55] mt-4">Loading success stories...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (petitions.length === 0) {
        return null;
    }

    return (
        <section className="bg-[#f0f2f5] py-12 px-4 sm:px-6 lg:px-8">
            {/* White Card Container - matching YouHave.js */}
            <div className="max-w-7xl mx-auto bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">
                            Success Stories
                        </h2>
                        <span className="w-3 h-3 bg-[#F43676] rounded-full"></span>
                    </div>
                    <Link
                        href="/successfulpetitions"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F43676] text-white rounded-full font-medium hover:bg-[#e02a60] transition-all shadow-md hover:shadow-lg group"
                    >
                        <span>View All Victories</span>
                        <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Cards Grid - matching YouHave.js style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {petitions.map((petition) => (
                        <Link
                            key={petition._id}
                            href={`/successfulpetitions/${petition._id}`}
                            className="group relative rounded-2xl overflow-hidden aspect-square"
                        >
                            {/* Background Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                style={{
                                    backgroundImage: petition.image
                                        ? `url('${petition.image}')`
                                        : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
                                }}
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                            {/* Content */}
                            <div className="absolute inset-0 p-4 flex flex-col justify-end">
                                {/* Victory Badge */}
                                <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                    <FaTrophy className="text-yellow-300" />
                                    <span>Victory!</span>
                                </div>

                                {/* Signature Count Badge - only show for 1000+ signatures */}
                                {(petition.totalSignatures || 0) >= 1000 && (
                                <div className="absolute top-4 right-4 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                                    <FaUsers className="text-white" />
                                    {formatSignatures(petition.totalSignatures)}
                                </div>
                                )}

                                {/* Category Tag */}
                                {petition.category && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className="px-3 py-1 bg-[#fce4ec] text-[#F43676] rounded-full text-xs font-medium">
                                            {petition.category}
                                        </span>
                                    </div>
                                )}

                                {/* Title */}
                                <h3 className="text-white font-bold text-base leading-tight mb-3 group-hover:text-[#F43676] transition-colors line-clamp-2">
                                    {petition.petitionTitle}
                                </h3>

                                {/* Author Info */}
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="w-5 h-5 rounded-full bg-gray-400 overflow-hidden">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(petition.petitionStarterName || "Anonymous")}&background=random&size=24`}
                                            alt="User"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <span className="text-gray-300 text-xs truncate">
                                        {petition.petitionStarterName || "Anonymous"}
                                    </span>
                                    <span className="text-[#F43676] text-xs">•</span>
                                    <span className="text-gray-400 text-xs">
                                        {petition.location || "Global"}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
