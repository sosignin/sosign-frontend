"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { 
  FaPaw, 
  FaGamepad, 
  FaCouch, 
  FaSpa, 
  FaLaptopCode, 
  FaPlane, 
  FaLeaf, 
  FaGraduationCap, 
  FaTag, 
  FaSearch, 
  FaSpinner 
} from "react-icons/fa";
import {
  FaPersonRunning,
  FaHeartPulse,
  FaLandmarkDome,
  FaHandFist
} from "react-icons/fa6";

// Mapping category icon strings to actual React Icons
const iconMap = {
  FaPaw: FaPaw,
  FaGamepad: FaGamepad,
  FaCouch: FaCouch,
  FaSpa: FaSpa,
  FaPersonRunning: FaPersonRunning,
  FaLaptopCode: FaLaptopCode,
  FaPlane: FaPlane,
  FaLeaf: FaLeaf,
  FaGraduationCap: FaGraduationCap,
  FaHeartPulse: FaHeartPulse,
  FaLandmarkDome: FaLandmarkDome,
  FaHandFist: FaHandFist
};

const categoryMetadata = {
  animals: {
    description: "Support animal welfare, combat animal abuse, stop cruelty, and protect wildlife habitats.",
    gradient: "from-emerald-500/20 to-teal-600/20 border-emerald-200/50 hover:border-emerald-400 hover:shadow-emerald-100",
    colorTheme: "text-emerald-700 bg-emerald-50 border border-emerald-100",
    hoverIconColor: "group-hover:text-emerald-600"
  },
  environment: {
    description: "Combat climate change, reduce plastic pollution, protect forests, clean oceans, and support renewable energy.",
    gradient: "from-green-500/20 to-emerald-600/20 border-green-200/50 hover:border-green-400 hover:shadow-green-100",
    colorTheme: "text-green-700 bg-green-50 border border-green-100",
    hoverIconColor: "group-hover:text-green-600"
  },
  education: {
    description: "Advocate for school infrastructure, educational reform, student rights, tuition relief, and digital learning devices.",
    gradient: "from-blue-500/20 to-indigo-600/20 border-blue-200/50 hover:border-blue-400 hover:shadow-blue-100",
    colorTheme: "text-indigo-700 bg-indigo-50 border border-indigo-100",
    hoverIconColor: "group-hover:text-indigo-600"
  },
  health: {
    description: "Advocate for hospital infrastructure, public health awareness, critical care funding, and mental health resources.",
    gradient: "from-rose-500/20 to-pink-600/20 border-rose-200/50 hover:border-rose-400 hover:shadow-rose-100",
    colorTheme: "text-rose-700 bg-rose-50 border border-rose-100",
    hoverIconColor: "group-hover:text-rose-600"
  },
  politics: {
    description: "Advocate for policy reforms, state governance accountability, voting rights, and civic action.",
    gradient: "from-amber-500/20 to-orange-600/20 border-amber-200/50 hover:border-amber-400 hover:shadow-amber-100",
    colorTheme: "text-amber-700 bg-amber-50 border border-amber-100",
    hoverIconColor: "group-hover:text-amber-600"
  },
  human_rights: {
    description: "Fight for social justice, civil rights, gender equality, marginalized communities, and freedom of expression.",
    gradient: "from-purple-500/20 to-fuchsia-600/20 border-purple-200/50 hover:border-purple-400 hover:shadow-purple-100",
    colorTheme: "text-purple-700 bg-purple-50 border border-purple-100",
    hoverIconColor: "group-hover:text-purple-600"
  },
  sports: {
    description: "Advocate for public athletic facilities, school sports funding, and positive community recreation programs.",
    gradient: "from-cyan-500/20 to-blue-600/20 border-cyan-200/50 hover:border-cyan-400 hover:shadow-cyan-100",
    colorTheme: "text-cyan-700 bg-cyan-50 border border-cyan-100",
    hoverIconColor: "group-hover:text-cyan-600"
  },
  technology: {
    description: "Defend digital privacy, raise scam awareness, support rural broadband connectivity, and fight internet censorship.",
    gradient: "from-violet-500/20 to-purple-600/20 border-violet-200/50 hover:border-violet-400 hover:shadow-violet-100",
    colorTheme: "text-violet-700 bg-violet-50 border border-violet-100",
    hoverIconColor: "group-hover:text-violet-600"
  },
  travel: {
    description: "Advocate for sustainable eco-tourism, improved public transport safety, and local community infrastructure.",
    gradient: "from-sky-500/20 to-cyan-600/20 border-sky-200/50 hover:border-sky-400 hover:shadow-sky-100",
    colorTheme: "text-sky-700 bg-sky-50 border border-sky-100",
    hoverIconColor: "group-hover:text-sky-600"
  },
  lifestyle: {
    description: "Promote healthy eating, sustainable green living, wellness accessibility, and mindfulness education.",
    gradient: "from-pink-500/20 to-rose-600/20 border-pink-200/50 hover:border-pink-400 hover:shadow-pink-100",
    colorTheme: "text-pink-700 bg-pink-50 border border-pink-100",
    hoverIconColor: "group-hover:text-pink-600"
  },
  game: {
    description: "Support digital safety in multiplayer environments, e-sports growth, and fair monetization practices.",
    gradient: "from-red-500/20 to-orange-600/20 border-red-200/50 hover:border-red-400 hover:shadow-red-100",
    colorTheme: "text-red-700 bg-red-50 border border-red-100",
    hoverIconColor: "group-hover:text-red-600"
  },
  interior: {
    description: "Advocate for urban beautification, public parks space designs, and standard accessible housing plans.",
    gradient: "from-stone-500/20 to-neutral-600/20 border-stone-200/50 hover:border-stone-400 hover:shadow-stone-100",
    colorTheme: "text-stone-700 bg-stone-50 border border-stone-100",
    hoverIconColor: "group-hover:text-stone-600"
  }
};

const defaultMetadata = {
  description: "Join hands with others to make a positive impact and drive change in this category.",
  gradient: "from-gray-500/10 to-slate-600/10 border-gray-200/50 hover:border-gray-400 hover:shadow-gray-100",
  colorTheme: "text-gray-700 bg-gray-50 border border-gray-100",
  hoverIconColor: "group-hover:text-gray-600"
};

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories = [], isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/categories`);
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      return data.categories || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#f0f2f5] min-h-screen py-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-[#002050] to-[#1C2A69] rounded-3xl p-8 md:p-12 mb-10 text-center shadow-xl text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(244,54,118,0.15),transparent)]"></div>
          <div className="relative z-10">
            <span className="bg-[#F43676] text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-4 inline-block">
              Campaign Topics
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
              Explore Petition Categories
            </h1>
            <p className="text-base md:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Find and support verified petitions that align with your passions. Choose a category below to see active campaigns, or launch your own movement today.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-12 max-w-xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <FaSearch />
          </div>
          <input
            type="text"
            placeholder="Search petition categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-[#302d55] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F43676] transition-all shadow-md text-base font-medium"
          />
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <FaSpinner className="animate-spin text-4xl text-[#F43676]" />
            <p className="text-gray-500 font-semibold">Loading petition topics...</p>
          </div>
        ) : isError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-center shadow-sm max-w-lg mx-auto">
            <p className="font-semibold">Unable to load categories. Please check your connection and try again.</p>
          </div>
        ) : (
          <div>
            {filteredCategories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category) => {
                  const keySlug = category.slug.toLowerCase().replace(/[-\s_]+/g, "_");
                  const metadata = categoryMetadata[keySlug] || defaultMetadata;
                  const Icon = iconMap[category.icon] || FaTag;

                  return (
                    <Link
                      key={category._id}
                      href={`/category/${category.slug}`}
                      className="group bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                    >
                      {/* Gradient Backdrop Accent */}
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${metadata.gradient} rounded-bl-full opacity-60 group-hover:scale-110 transition-transform duration-300`}></div>
                      
                      <div className="relative z-10">
                        {/* Icon Container */}
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300 ${metadata.colorTheme} text-xl`}>
                          <Icon className={`transition-colors duration-300 ${metadata.hoverIconColor}`} />
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-bold text-[#002050] group-hover:text-[#F43676] transition-colors mb-2">
                          {category.name}
                        </h2>

                        {/* Description */}
                        <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                          {metadata.description}
                        </p>
                      </div>

                      {/* Footer Info */}
                      <div className="relative z-10 flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Active Petitions
                        </span>
                        <span className="text-sm font-extrabold bg-pink-50 text-[#F43676] px-3.5 py-1 rounded-full group-hover:bg-[#F43676] group-hover:text-white transition-colors duration-300">
                          {category.petitionCount || 0}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-xl mx-auto p-8">
                <p className="text-gray-500 font-semibold text-lg mb-2">No categories found</p>
                <p className="text-gray-400 text-sm">Try searching for another topic name.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
