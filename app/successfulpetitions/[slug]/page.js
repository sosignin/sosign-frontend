import SuccessfulPetitionClient from "./SuccessfulPetitionClient";

async function getSuccessfulPetition(slug) {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${backendUrl}/api/successful-petitions/${slug}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.successfulPetition || null;
  } catch (error) {
    console.error("Error fetching successful petition:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const petition = await getSuccessfulPetition(slug);

  const baseUrl = "https://www.sosign.in";
  const petitionUrl = `${baseUrl}/successfulpetitions/${slug}`;

  if (!petition) {
    return {
      title: "Successful Petition Not Found | SoSign",
      description: "The successful petition you are looking for could not be found.",
    };
  }

  const title = petition.petitionTitle || "Successful Petition Victory";
  const description = petition.outcome || petition.issue ||
    `Victory achieved! Support from ${petition.totalSignatures || 0} changemakers made this petition successful on SoSign.`;
  const image = petition.image || `${baseUrl}/og-image.png`;

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
  const initialPetition = await getSuccessfulPetition(slug);

  return <SuccessfulPetitionClient initialPetition={initialPetition} />;
}
