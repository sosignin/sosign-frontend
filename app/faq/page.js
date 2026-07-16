"use client";

import React, { useState, useEffect } from "react";
import { FaChevronDown, FaSearch, FaQuestionCircle, FaPenFancy, FaShieldAlt, FaHandHoldingHeart } from "react-icons/fa";
import Link from "next/link";

const faqData = [
  {
    question: "What is SoSign?",
    answer: "SoSign is India's leading digital platform for verified petitions and crowdfunding. We empower citizens, social workers, and organizations to start social movements, gather verified signatures via Aadhaar, and raise funds for public interest campaigns.",
    category: "general"
  },
  {
    question: "How does signature verification work on SoSign?",
    answer: "Unlike traditional platforms, SoSign integrates secure identity verification (such as Aadhaar, PAN, or Voter ID checks) to ensure that every signature represents a unique, verified citizen. This prevents spam signatures and significantly increases the credibility of petitions when submitted to government bodies or decision-makers.",
    category: "verification"
  },
  {
    question: "Is it free to start a petition?",
    answer: "Yes, starting a petition on SoSign is completely free for everyone. You can easily write your petition, add supporting images/documents, and publish it to start gathering signatures right away.",
    category: "petitions"
  },
  {
    question: "How do I launch a crowdfunding campaign?",
    answer: "If your petition or cause requires financial support (for healthcare, education, community relief, etc.), you can launch a crowdfunding campaign directly alongside your petition. Simply select the crowdfunding option in your dashboard, describe your fundraiser, and securely receive donations from supporters.",
    category: "crowdfunding"
  },
  {
    question: "How does Aadhaar KYC verify signatures safely?",
    answer: "Aadhaar KYC checks are performed securely through authorized, government-approved partner gateways. We verify the identity of the signer but never store sensitive details like Aadhaar numbers on our servers, ensuring absolute privacy and data security.",
    category: "verification"
  },
  {
    question: "Can I edit my petition after it is published?",
    answer: "You can edit non-critical details like description, goals, and images to keep your campaign updated. However, you cannot change the core title or main objective of the petition once signatures have started gathering, as that would be unfair to existing signers.",
    category: "petitions"
  },
  {
    question: "What happens when my petition reaches its signature goal?",
    answer: "Once your petition achieves its goal, we help you package and deliver the verified signatures, comments, and petition details to the designated decision-makers (such as ministers, commissioners, or local administrators) to initiate action.",
    category: "general"
  },
  {
    question: "Are donations to crowdfunding campaigns safe?",
    answer: "Yes, all donations are processed through leading, PCI-DSS compliant secure payment gateways. Funds are held securely and disbursed to the verified bank account of the campaign starter or beneficiary once verification checks are complete.",
    category: "crowdfunding"
  }
];

const categories = [
  { id: "all", label: "All Questions", icon: <FaQuestionCircle className="mr-2" /> },
  { id: "general", label: "General", icon: <FaQuestionCircle className="mr-2" /> },
  { id: "petitions", label: "Petitions", icon: <FaPenFancy className="mr-2" /> },
  { id: "verification", label: "Verification & KYC", icon: <FaShieldAlt className="mr-2" /> },
  { id: "crowdfunding", label: "Crowdfunding", icon: <FaHandHoldingHeart className="mr-2" /> }
];

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${backendUrl}/api/faqs`);
        if (!res.ok) throw new Error("Failed to fetch FAQs");
        const data = await res.json();
        if (data.success && data.faqs && data.faqs.length > 0) {
          setFaqs(data.faqs);
        }
      } catch (err) {
        console.error("Error loading dynamic FAQs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const activeFaqData = faqs.length > 0 ? faqs : faqData;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openIndexes, setOpenIndexes] = useState({});

  const toggleAccordion = (index) => {
    setOpenIndexes((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const filteredFaqs = activeFaqData.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Schema.org FAQPage Structured Data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": activeFaqData.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      {/* FAQ Schema for SEO indexing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="bg-[#f0f2f5] min-h-screen py-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#002050] to-[#2D3A8C] rounded-3xl p-8 md:p-12 mb-10 text-center shadow-xl text-white">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
              Find quick answers to common questions about setting up verified Aadhaar campaigns, signups, fundraisers, and creating an impact.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8 max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <FaSearch />
            </div>
            <input
              type="text"
              placeholder="Search questions or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F43676] focus:border-transparent transition-all shadow-md text-base"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setOpenIndexes({}); // Reset open accordions on category change
                }}
                className={`flex items-center px-4 py-2.5 rounded-full text-sm font-semibold transition-all shadow-xs ${
                  activeCategory === cat.id
                    ? "bg-[#F43676] text-white"
                    : "bg-white text-[#302d55] border border-gray-100 hover:bg-gray-50"
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => {
                const isOpen = !!openIndexes[index];
                return (
                  <div
                    key={index}
                    className="bg-white border border-gray-200/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleAccordion(index)}
                      className="w-full flex justify-between items-center px-6 py-5 text-left transition-colors duration-200 hover:bg-gray-50/50"
                    >
                      <span className="font-bold text-[#002050] text-base md:text-lg pr-4">
                        {faq.question}
                      </span>
                      <FaChevronDown
                        className={`text-gray-400 text-sm shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-[#F43676]" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-[500px] border-t border-gray-100 py-5 px-6" : "max-h-0"
                      } overflow-hidden bg-white`}
                    >
                      <p className="text-[#302d55] leading-relaxed text-sm md:text-base">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center bg-white border border-gray-200 rounded-2xl py-12 px-4 shadow-sm">
                <p className="text-gray-500 font-medium text-lg mb-2">No matching questions found.</p>
                <p className="text-gray-400 text-sm">Try using different search terms or select another category.</p>
              </div>
            )}
          </div>

          {/* Footer Call to Action */}
          <div className="mt-12 bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
            <h3 className="font-bold text-lg text-[#002050] mb-2">Still have questions?</h3>
            <p className="text-gray-500 text-sm mb-4">We are here to help you get the most out of SoSign.</p>
            <Link
              href="/contact"
              className="inline-block bg-gradient-to-r from-[#F43676] to-[#2D3A8C] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
