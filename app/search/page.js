"use client";

import React, { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("Searching for:", query);

        // Fetch current petitions with retry logic
        const currentPetitionsData = await fetchWithRetry(
          `/api/petitions?search=${encodeURIComponent(query)}&limit=20`
        );
        console.log("Current petitions count:", currentPetitionsData.petitions?.length || 0);

        // Fetch successful petitions with retry logic
        const successfulPetitionsData = await fetchWithRetry(
          `/api/successful-petitions?search=${encodeURIComponent(query)}&limit=20`
        );
        console.log("Successful petitions count:", successfulPetitionsData.successfulPetitions?.length || 0);

        let allResults = [];

        // Process current petitions
        if (currentPetitionsData.petitions && Array.isArray(currentPetitionsData.petitions)) {
          const currentResults = currentPetitionsData.petitions.map((petition) => ({
            ...petition,
            type: "current",
            slug: petition._id,
          }));
          allResults = [...allResults, ...currentResults];
        }

        // Process successful petitions
        if (successfulPetitionsData.successfulPetitions && Array.isArray(successfulPetitionsData.successfulPetitions)) {
          const successfulResults = successfulPetitionsData.successfulPetitions.map((petition) => ({
            ...petition,
            type: "successful",
            slug: petition._id,
          }));
          allResults = [...allResults, ...successfulResults];
        }

        console.log("Total results:", allResults.length);
        setSearchResults(allResults);
      } catch (err) {
        console.error("Error fetching search results:", err);
        if (err.message.includes('429')) {
          setError("Too many requests. Please wait a moment and try again.");
        } else {
          setError("Failed to fetch search results. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }, 500), // 500ms debounce
    []
  );

  // Fetch with retry logic for rate limits
  const fetchWithRetry = async (url, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url);
        
        if (response.status === 429) {
          if (i === retries - 1) {
            throw new Error('Rate limit exceeded');
          }
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
          continue;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        if (i === retries - 1) {
          throw error;
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  };

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Show message if no search query
  if (!searchQuery.trim()) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Search Petitions</h1>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-lg text-gray-600 mb-2">
            Enter a search term to find petitions
          </p>
          <p className="text-sm text-gray-500">
            Use the search bar above to search for petitions by title, problem, or solution
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Search Results for &quot;{searchQuery}&quot;
        </h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Search Results for &quot;{searchQuery}&quot;
        </h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-center">
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Search Results for &quot;{searchQuery}&quot;
      </h1>
      
      {searchResults.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-lg text-gray-600 mb-2">
            No petitions found matching your search criteria.
          </p>
          <p className="text-sm text-gray-500">
            Try different keywords or check your spelling.
          </p>
        </div>
      ) : (
        <div className="mb-4 text-sm text-gray-600">
          Found {searchResults.length} petition{searchResults.length !== 1 ? "s" : ""}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {searchResults.map((petition, index) => (
          <motion.div
            key={petition._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={`/${
                petition.type === "current"
                  ? "currentpetitions"
                  : "successfulpetitions"
              }/${petition._id}`}
            >
              <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer h-full flex flex-col">
                {petition.petitionDetails?.image && (
                  <div className="mb-4 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={petition.petitionDetails.image}
                      alt={petition.title}
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover rounded-md"
                    />
                  </div>
                )}
                <h2 className="text-xl font-semibold mb-2 flex-grow">
                  {petition.title}
                </h2>
                <p className="text-gray-600 mb-4 text-sm">
                  {petition.petitionDetails?.problem?.substring(0, 100)}...
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500 mt-auto">
                  <span>
                    Signatures: {petition.numberOfSignatures || petition.totalSignatures || 0}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    petition.type === "successful" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {petition.type === "successful" ? "Successful" : "Active"}
                  </span>
                </div>
                {petition.country && (
                  <p className="text-xs md:text-sm text-gray-500 mt-2">
                    📍 {petition.country}
                  </p>
                )}
                <div className="text-xs text-gray-400 mt-2">
                  Created: {new Date(petition.createdAt).toLocaleDateString()}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const SearchResultsPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          Loading...
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
};

export default SearchResultsPage;
