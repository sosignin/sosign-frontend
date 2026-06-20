import Banner from "@/components/Banner";
import Testimonials from "@/components/Testimonials";
import CurrentPetitions from "@/components/CurrentPetitions";
import Achievements from "@/components/Achievements";
import Slider from "@/components/Slider";
import Video from "@/components/Video";
import FeaturedTopic from "@/components/FeaturedTopic";
import Content from "@/components/Content";
import YouHave from "@/components/YouHave";
import SuccessStories from "@/components/SuccessStories";

async function getPetitions() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Create an AbortController with timeout to prevent hanging during build
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const res = await fetch(`${backendUrl}/api/petitions?limit=20`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds (ISR)
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error("Failed to fetch petitions:", res.status, res.statusText);
      return { petitions: [], totalPages: 0, totalPetitions: 0 };
    }

    return await res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    // Log but don't crash - return empty data
    if (error.name === 'AbortError') {
      console.warn("Petition fetch timed out, using empty data");
    } else {
      console.error("Failed to fetch petitions:", error.message);
    }
    return { petitions: [], totalPages: 0, totalPetitions: 0 };
  }
}

export default async function Home() {
  const data = await getPetitions();
  const petitions = data.petitions || [];

  // Prepare pagination info for Content (initial state)
  const paginationInfo = {
    totalPages: data.totalPages || 1,
    totalPetitions: data.totalPetitions || 0,
    hasNextPage: data.hasNextPage || false,
    hasPrevPage: data.hasPrevPage || false,
  };

  return (
    <>
      <Banner initialPetitions={petitions} />
      {/* <Testimonials /> */}
      {/* <CurrentPetitions /> */}
      {/* <Achievements /> */}
      {/* <Slider /> */}
      {/* <Video /> */}
      {/* <FeaturedTopic /> */}
      <Content initialPetitions={petitions} initialPagination={paginationInfo} />
      <YouHave />
      <SuccessStories />
    </>
  );
}
