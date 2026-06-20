"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { safeFetch } from "../utils/apiUtils";
import { FileText, PenTool, MapPin } from "lucide-react";

// Export petitions array
export const petitions = [
  {
    name: "Aarav Kumar",
    role: "Student",
    message:
      "We are demanding safer roads near our schools. Every voice matters!",
    image:
      "https://web.archive.org/web/20160331044512im_/http://www.socialostracism.com/images/uploads/719_20160316111358.jpg",
    slug: "ban-single-use-plastics-nationwide",
    signatures: 1500,
    decisionMakers: ["Local Council", "School Board"],
    issue:
      "Road safety near schools, leading to accidents and concerns for student well-being.",
    started: "2023-01-15",
    starter: "Aarav Kumar",
    updates: "3 updates",
    location: "Mumbai, India",
    creatorId: "dummyUserId", // Add creatorId
  },
  {
    name: "Meera Joshi",
    role: "Parent",
    message:
      "It’s time to stop single-use plastics in our city. Join the petition today!",
    image:
      "https://web.archive.org/web/20160331044512im_/http://www.socialostracism.com/images/uploads/23_20160227084516.jpg",
    slug: "increase-funding-public-schools",
    signatures: 2200,
    decisionMakers: ["City Council", "Environmental Agency"],
    issue:
      "Excessive single-use plastic waste polluting the city and harming wildlife.",
    started: "2023-02-20",
    starter: "Meera Joshi",
    updates: "5 updates",
    location: "Delhi, India",
    creatorId: "dummyUserId", // Add creatorId
  },
  {
    name: "Kunal Sharma",
    role: "Environmentalist",
    message:
      "We are pushing for more green parks in urban areas for healthier living.",
    image:
      "https://web.archive.org/web/20160331044512im_/http://www.socialostracism.com/images/uploads/23_20160227092509.jpg",
    slug: "protect-endangered-tigers",
    signatures: 1800,
    decisionMakers: ["Urban Planning Department", "Parks and Recreation"],
    issue:
      "Lack of green spaces in crowded urban areas affecting public health and well-being.",
    started: "2023-03-10",
    starter: "Kunal Sharma",
    updates: "2 updates",
    location: "Bangalore, India",
    creatorId: "dummyUserId", // Add creatorId
  },
  {
    name: "Rina Kapoor",
    role: "Activist",
    message: "I successfully started my petition and got a lot of support!",
    image:
      "https://assets.change.org/photos/4/il/ck/OKILckhXytzcRsp-800x450-noPad.jpg?1685722554",
    slug: "improve-road-safety-regulations",
    signatures: 3000,
    decisionMakers: ["Various Government Bodies"],
    issue:
      "The general need for community engagement and support for local initiatives.",
    started: "2023-01-01",
    starter: "Rina Kapoor",
    updates: "10 updates",
    location: "Chennai, India",
    creatorId: "dummyUserId", // Add creatorId
  },
  {
    name: "Simran Kaur",
    role: "Volunteer",
    message:
      "Public transport needs to be improved for everyone. Sign and support!",
    image:
      "https://web.archive.org/web/20160331044512im_/http://www.socialostracism.com/images/uploads/176_20160318013231.jpg",
    slug: "safer-roads-near-schools",
    signatures: 2500,
    decisionMakers: ["Public Transport Authority", "City Mayor"],
    issue:
      "Inadequate public transport system leading to long commutes and limited accessibility.",
    started: "2023-04-05",
    starter: "Simran Kaur",
    updates: "4 updates",
    location: "Kolkata, India",
    creatorId: "dummyUserId", // Add creatorId
  },
  {
    name: "Rajat Mehta",
    role: "Community Member",
    message:
      "Better waste management is crucial for a cleaner and healthier city.",
    image:
      "https://web.archive.org/web/20160331044512im_/http://www.socialostracism.com/images/uploads/23_20160227084516.jpg",
    slug: "ban-single-use-plastics",
    signatures: 1900,
    decisionMakers: ["Waste Management Department", "Local Government"],
    issue:
      "Inefficient waste management practices causing environmental pollution and health hazards.",
    started: "2023-05-01",
    starter: "Rajat Mehta",
    updates: "6 updates",
    location: "Hyderabad, India",
    creatorId: "dummyUserId", // Add creatorId
  },
];

export default function CurrentPetitions() {
  const [visibleCount, setVisibleCount] = useState(5);

  const { data: petitions = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ["currentPetitions"],
    queryFn: async () => {
      const data = await safeFetch("/api/petitions?limit=100");
      if (data.success === false && data.rateLimited) {
        console.warn('Rate limit exceeded for current petitions, using fallback');
        return [];
      }
      return data.petitions || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Use query error if available, or keep existing error state logic if needed (but useQuery handles it better)
  // We can remove the local 'error' state and just use 'queryError' derived variable
  const error = queryError ? queryError.message : null;

  const handleLoadMore = () => {
    setVisibleCount(petitions.length);
  };

  const handleReadLess = () => {
    setVisibleCount(5);
  };

  if (loading) {
    return (
      <section className="py-6 px-6">
        <h2 className="text-3xl font-bold text-center mb-8 text-[#1a1a2e]">
          Current Petitions
        </h2>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#F43676] border-t-transparent"></div>
          <p className="text-gray-600 mt-4">Loading petitions...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-6 px-6">
        <h2 className="text-3xl font-bold text-center mb-8 text-[#1a1a2e]">
          Current Petitions
        </h2>
        <div className="text-center bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md mx-auto">
          <p className="text-red-600">Error loading petitions: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 px-6">
      <h2 className="text-3xl font-bold text-center mb-3 text-[#1a1a2e]">
        Current Petitions
      </h2>
      <p className="text-center text-gray-500 mb-8 max-w-2xl mx-auto">
        Browse and support active petitions making a difference in communities
      </p>

      {petitions.length === 0 ? (
        <div className="text-center bg-white rounded-3xl p-12 shadow-sm max-w-md mx-auto">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-[#F43676]" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Petitions Available</h3>
          <p className="text-gray-500">Check back soon for new petitions to support!</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {petitions.slice(0, visibleCount).map((petition, index) => (
            <Link key={petition._id} href={`/currentpetitions/${petition.slug || petition._id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-3xl shadow-md overflow-hidden flex flex-col cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border border-pink-100"
              >
                <div className="w-full h-36 md:h-48 bg-gradient-to-br from-pink-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                  {petition.petitionDetails?.image ? (
                    <Image
                      src={petition.petitionDetails.image}
                      alt={petition.title}
                      width={500}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-xs">No Image</p>
                    </div>
                  )}
                  {/* Signature Badge */}
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                    <PenTool className="w-3 h-3" />
                    {petition.numberOfSignatures || 0}
                  </div>
                </div>
                <div className="p-4 md:p-6 text-center flex-1 flex flex-col">
                  <p className="text-gray-700 text-sm md:text-base mb-3 line-clamp-3 flex-1">
                    &quot;
                    {petition.petitionDetails?.problem?.substring(0, 100) ||
                      petition.title}
                    &quot;
                  </p>
                  <div className="mt-auto">
                    <h3 className="font-bold text-base md:text-lg text-[#1a1a2e] mb-1">
                      {petition.petitionStarter?.user?.name ||
                        petition.petitionStarter?.name ||
                        "Anonymous"}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500 mb-2">
                      {petition.petitionStarter?.user?.designation ||
                        petition.petitionStarter?.designation ||
                        "Citizen"}
                    </p>
                    {petition.country && (
                      <p className="text-xs text-[#F43676] font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {petition.country}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-8 space-x-4">
        {visibleCount < petitions.length && (
          <button
            onClick={handleLoadMore}
            className="bg-gradient-to-r from-[#F43676] to-[#e02a60] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            Load More Petitions
          </button>
        )}
        {visibleCount === petitions.length && petitions.length > 5 && (
          <button
            onClick={handleReadLess}
            className="bg-white border-2 border-pink-200 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-pink-50 hover:border-[#F43676] transition-all duration-200"
          >
            Show Less
          </button>
        )}
      </div>
    </section>
  );
}
