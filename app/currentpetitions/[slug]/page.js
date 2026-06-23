import PetitionDetailClient from "./PetitionDetailClient";

// Fetch petition data for metadata
async function getPetition(slug) {
  try {
    // Use production backend URL for server-side fetching
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://sosign-backend.onrender.com";
    const response = await fetch(`${backendUrl}/api/petitions/${slug}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching petition for metadata:", error);
    return null;
  }
}

// Generate dynamic metadata for each petition page
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const petition = await getPetition(slug);

  const baseUrl = "https://sosign.in";
  const petitionUrl = `${baseUrl}/currentpetitions/${slug}`;

  if (!petition) {
    return {
      title: "Petition Not Found | SoSign",
      description: "The petition you are looking for could not be found.",
    };
  }

  const title = petition.title || "Sign this Petition";
  const description = petition.petitionDetails?.problem ||
    petition.petitionDetails?.solution ||
    `Support this important cause by signing the petition on SoSign. ${petition.numberOfSignatures || 0} people have already signed.`;
  const image = petition.petitionDetails?.image || `${baseUrl}/og-image.png`;

  return {
    title: `${title} | SoSign`,
    description: description.substring(0, 160),
    openGraph: {
      title: title,
      description: description.substring(0, 160),
      url: petitionUrl,
      siteName: "SoSign",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "article",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description.substring(0, 160),
      images: [image],
    },
    alternates: {
      canonical: petitionUrl,
    },
    other: {
      "fb:app_id": "966242223397117",
    },
  };
}

export default async function PetitionDetailPage({ params }) {
  const { slug } = await params;

  // Optionally fetch petition on server for faster initial load
  // The client component will handle the display and interactions
  let initialPetition = null;

  try {
    initialPetition = await getPetition(slug);
  } catch (error) {
    console.error("Error fetching initial petition:", error);
  }

  return <PetitionDetailClient initialPetition={initialPetition} />;
}
