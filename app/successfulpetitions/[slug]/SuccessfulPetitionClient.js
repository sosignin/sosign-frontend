"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  CheckCircle,
  Trophy,
  Users,
  Target,
  MapPin,
  Clock,
  Star,
  Share2,
  Copy,
  Calendar,
  Award,
} from "lucide-react";

// Helper function to transform backend petition data to frontend format
const transformPetition = (rawPetition) => {
  if (!rawPetition) return null;
  return {
    id: rawPetition._id,
    name: rawPetition.petitionStarterName,
    role: "Change Maker",
    message:
      rawPetition.outcome ||
      "Successfully achieved the petition goal!",
    image: rawPetition.image,
    signatures: rawPetition.totalSignatures || 0,
    decisionMakers:
      rawPetition.decisionMakers?.map((dm) => dm.name) || [],
    issue: rawPetition.issue,
    started: new Date(
      rawPetition.startedDate || rawPetition.createdAt
    ).toLocaleDateString(),
    starter: rawPetition.petitionStarterName,
    location: rawPetition.location,
    petitionTitle: rawPetition.petitionTitle,
    successDate: new Date(
      rawPetition.successDate || rawPetition.createdAt
    ).toLocaleDateString(),
    category: rawPetition.category || "Other",
  };
};

export default function SuccessfulPetitionClient({ initialPetition }) {
  const { slug } = useParams(); // This is the petition ID
  const [petition, setPetition] = useState(() => transformPetition(initialPetition));
  const [loading, setLoading] = useState(!initialPetition);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we already have initialPetition (which we transformed above), skip fetching
    if (initialPetition) {
      setLoading(false);
      return;
    }

    const fetchPetition = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/successful-petitions/${slug}`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Transform backend data to match frontend expectations
        const transformedPetition = transformPetition(data.successfulPetition);

        setPetition(transformedPetition);
        setError(null);
      } catch (err) {
        console.error("Error fetching petition:", err);
        setError(err.message);
        setPetition(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPetition();
    }
  }, [slug, initialPetition]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 md:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="bg-gray-300 h-12 w-3/4 mx-auto rounded mb-10"></div>
          <div className="flex flex-col md:flex-row gap-10 lg:gap-16">
            <div className="md:w-3/5 bg-gray-300 h-96 rounded-2xl"></div>
            <div className="md:w-2/5 space-y-6">
              <div className="bg-gray-300 h-24 rounded-2xl"></div>
              <div className="bg-gray-300 h-32 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 md:px-6 lg:px-8 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">
          Error Loading Petition
        </h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!petition) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 md:px-6 lg:px-8 text-center">
        <h1 className="text-2xl font-bold text-gray-600 mb-4">
          Successful Petition Not Found
        </h1>
        <p className="text-gray-500">
          The petition you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 md:px-6 lg:px-8 bg-white shadow-lg rounded-xl mt-8 mb-12">
      {/* Success Badge */}
      <div className="flex justify-center mb-6">
        <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2.5 rounded-full font-semibold text-lg inline-flex items-center gap-2 shadow-lg">
          <CheckCircle className="w-5 h-5" />
          Successfully Completed
        </span>
      </div>

      {/* Heading */}
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center text-gray-900 leading-tight">
        {petition.petitionTitle}
      </h1>

      <p className="text-xl text-gray-600 text-center mb-10 max-w-4xl mx-auto">
        {petition.message}
      </p>

      <div className="flex flex-col md:flex-row gap-10 lg:gap-16 h-[calc(100vh-200px)] overflow-hidden">
        {/* Left Side - Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="md:w-3/5 flex-shrink-0 aspect-video sticky top-0 md:h-full"
        >
          {petition.image ? (
            <Image
              src={petition.image}
              alt={petition.petitionTitle}
              width={1200}
              height={675}
              className="w-full h-full object-contain rounded-2xl shadow-xl border border-gray-200"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl shadow-xl border border-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-green-700 mb-2">
                  Success Story
                </h3>
                <p className="text-green-600">
                  This petition achieved its goal!
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Right Side - Cards */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="md:w-2/5 flex flex-col gap-6 overflow-y-auto pr-4"
        >
          {/* Total Signatures */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-6 text-center shadow-lg">
            <p className="text-lg font-medium">Total Signatures Achieved</p>
            <p className="text-3xl font-bold">
              {petition.signatures.toLocaleString()}
            </p>
          </div>

          {/* Success Date */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl p-6 text-center shadow-lg">
            <p className="text-lg font-medium">Victory Declared</p>
            <p className="text-xl font-bold">{petition.successDate}</p>
          </div>

          {/* Category */}
          {petition.category && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-6 text-center shadow-lg">
              <p className="text-lg font-medium">Category</p>
              <p className="text-xl font-bold">{petition.category}</p>
            </div>
          )}

          {/* Petition Starter Info */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
            <p className="text-lg font-semibold text-gray-800 mb-2">
              Victory Champion
            </p>
            <p className="text-xl font-bold text-gray-900">
              {petition.starter}
            </p>
            <p className="text-sm text-gray-600">{petition.role}</p>
          </div>
        </motion.div>
      </div>

      {/* Additional Petition Details */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Decision Makers */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg border border-green-200 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-lg text-green-800">
              Decision Makers Contacted
            </h3>
          </div>
          <div className="space-y-2">
            {petition.decisionMakers && petition.decisionMakers.length > 0 ? (
              petition.decisionMakers.map((maker, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 border border-green-100"
                >
                  <p className="text-green-700 font-medium">{maker}</p>
                </div>
              ))
            ) : (
              <p className="text-green-600">
                No specific decision makers listed
              </p>
            )}
          </div>
        </div>

        {/* Issue Resolved */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg border border-blue-200 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-lg text-blue-800">
              Issue Successfully Addressed
            </h3>
          </div>
          <p className="text-blue-700 leading-relaxed">{petition.issue}</p>
        </div>

        {/* Location Impact */}
        {petition.location && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border border-purple-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-md">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg text-purple-800">
                Impact Location
              </h3>
            </div>
            <p className="text-purple-700 text-lg font-medium">
              {petition.location}
            </p>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 shadow-lg border border-orange-200 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-lg text-orange-800">
              Success Timeline
            </h3>
          </div>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-3 border border-orange-100 flex items-center gap-3">
              <Calendar className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm text-orange-600">Started</p>
                <p className="text-orange-700 font-medium">{petition.started}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-orange-100 flex items-center gap-3">
              <Trophy className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm text-orange-600">Victory Achieved</p>
                <p className="text-orange-700 font-medium">
                  {petition.successDate}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Celebration Section */}
      <div className="mt-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-8 text-center border border-green-200 shadow-lg">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Award className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-green-800 mb-4">
          This petition was successful!
        </h2>
        <p className="text-green-700 text-lg mb-6">
          Thanks to {petition.signatures.toLocaleString()} supporters, this
          petition achieved its goal and made a real difference!
        </p>
        <div className="flex justify-center">
          <div className="bg-white rounded-lg p-4 shadow-md border border-green-200 inline-flex items-center gap-2">
            <Trophy className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-semibold">
              Champion: {petition.starter}
            </p>
          </div>
        </div>
      </div>

      {/* Share This Success Story */}
      <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
            <Star className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            Share This Success Story
          </h3>
        </div>
        <p className="text-gray-600 text-center mb-6">
          Inspire others by sharing this successful petition and showing that
          change is possible!
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => {
              const shareText = `🎉 Check out this successful petition: "${petition.petitionTitle
                }" - ${petition.signatures.toLocaleString()} people made a difference!`;
              const shareUrl = window.location.href;
              window.open(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  shareUrl
                )}&quote=${encodeURIComponent(shareText)}`,
                "_blank"
              );
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300 transform hover:-translate-y-0.5 shadow-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            Facebook
          </button>
          <button
            onClick={() => {
              const shareText = `🎉 Success! "${petition.petitionTitle
                }" achieved its goal with ${petition.signatures.toLocaleString()} signatures! ${window.location.href
                }`;
              window.open(
                `https://wa.me/?text=${encodeURIComponent(shareText)}`,
                "_blank"
              );
            }}
            className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition duration-300 transform hover:-translate-y-0.5 shadow-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            WhatsApp
          </button>
          <button
            onClick={() => {
              const shareText = `🎉 Success story: "${petition.petitionTitle
                }" - ${petition.signatures.toLocaleString()} people made change happen!`;
              window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  shareText
                )}&url=${encodeURIComponent(window.location.href)}`,
                "_blank"
              );
            }}
            className="bg-blue-400 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-500 transition duration-300 transform hover:-translate-y-0.5 shadow-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            Twitter
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied to clipboard!");
            }}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition duration-300 transform hover:-translate-y-0.5 shadow-md flex items-center gap-2"
          >
            <Copy className="w-5 h-5" />
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
}
