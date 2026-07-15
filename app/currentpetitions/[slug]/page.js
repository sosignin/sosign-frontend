import { notFound } from "next/navigation";
import PetitionDetailClient from "./PetitionDetailClient";
import Breadcrumb from "../../../components/Breadcrumb";

// Helper to strip HTML tags from text
function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Safe JSON-LD serialization (prevents XSS via script injection)
function safeJsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

// Fetch petition data for metadata and SSR
async function getPetition(slug) {
  try {
    // Use production backend URL for server-side fetching
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.sosign.in";
    const response = await fetch(`${backendUrl}/api/petitions/${slug}`, {
      next: {
        revalidate: 300, // Cache for 5 minutes (ISR)
      },
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

  // Strip HTML tags from description before using in meta tags
  const rawDescription = petition.petitionDetails?.problem ||
    petition.petitionDetails?.solution ||
    `Support this important cause by signing the petition on SoSign. ${petition.numberOfSignatures || 0} people have already signed.`;
  const description = stripHtml(rawDescription).slice(0, 155);

  const image = petition.petitionDetails?.image || `${baseUrl}/og-image.png`;

  return {
    title: `${title} | SoSign`,
    description,
    openGraph: {
      title: title,
      description,
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
      description,
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

  const initialPetition = await getPetition(slug);

  if (!initialPetition) {
    notFound();
  }

  const baseUrl = "https://sosign.in";
  const petitionUrl = `${baseUrl}/currentpetitions/${slug}`;
  const petitionImage = initialPetition.petitionDetails?.image || `${baseUrl}/og-image.png`;
  const category = initialPetition.categories?.[0] || null;

  const petitionStarter =
    initialPetition.petitionStarter?.user?.name ||
    initialPetition.petitionStarter?.name ||
    "Anonymous";

  // Article JSON-LD (replaces old "Campaign" type)
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": initialPetition.title,
    "description": stripHtml(initialPetition.petitionDetails?.problem)?.substring(0, 200) || initialPetition.title,
    "image": petitionImage,
    "datePublished": initialPetition.createdAt,
    "dateModified": initialPetition.updatedAt || initialPetition.createdAt,
    "author": {
      "@type": "Person",
      "name": petitionStarter,
    },
    "publisher": {
      "@type": "Organization",
      "name": "SoSign",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`,
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": petitionUrl,
    },
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/LikeAction",
      "userInteractionCount": initialPetition.numberOfSignatures || 0,
    },
  };

  // BreadcrumbList JSON-LD
  const breadcrumbItems = [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
    { "@type": "ListItem", "position": 2, "name": "Petitions", "item": `${baseUrl}/currentpetitions` },
  ];

  if (category) {
    breadcrumbItems.push({
      "@type": "ListItem",
      "position": 3,
      "name": category,
      "item": `${baseUrl}/category/${encodeURIComponent(category.toLowerCase())}`,
    });
    breadcrumbItems.push({
      "@type": "ListItem",
      "position": 4,
      "name": initialPetition.title,
    });
  } else {
    breadcrumbItems.push({
      "@type": "ListItem",
      "position": 3,
      "name": initialPetition.title,
    });
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems,
  };

  return (
    <>
      {/* Article JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }}
      />

      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />

      {/* ===== SERVER-RENDERED SEO CONTENT ===== */}
      {/* Google crawls this <article> for indexing. Visually hidden */}
      {/* so the styled client component is what users see. */}
      <article
        className="sr-only"
        aria-hidden="true"
        itemScope
        itemType="https://schema.org/Article"
      >
        <h1 itemProp="headline">{initialPetition.title}</h1>

        {initialPetition.petitionDetails?.problem && (
          <section>
            <h2>Problem</h2>
            <p itemProp="description">
              {stripHtml(initialPetition.petitionDetails.problem)}
            </p>
          </section>
        )}

        {initialPetition.petitionDetails?.solution && (
          <section>
            <h2>Proposed Solution</h2>
            <p>{stripHtml(initialPetition.petitionDetails.solution)}</p>
          </section>
        )}

        {category && (
          <p>
            Category:{" "}
            <span itemProp="articleSection">{category}</span>
          </p>
        )}

        <p>
          Started by:{" "}
          <span itemProp="author">{petitionStarter}</span>
        </p>

        <p>Signatures: {initialPetition.numberOfSignatures || 0}</p>

        {initialPetition.createdAt && (
          <time
            itemProp="datePublished"
            dateTime={initialPetition.createdAt}
          >
            Created: {new Date(initialPetition.createdAt).toLocaleDateString()}
          </time>
        )}

        {initialPetition.decisionMakers?.length > 0 && (
          <section>
            <h2>Decision Makers</h2>
            <ul>
              {initialPetition.decisionMakers.map((dm, i) => (
                <li key={i}>{dm.name || dm}</li>
              ))}
            </ul>
          </section>
        )}

        {initialPetition.country && <p>Country: {initialPetition.country}</p>}
      </article>

      {/* Visible Breadcrumb Navigation */}
      <div className="max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8 pt-4">
        <Breadcrumb petition={initialPetition} />
      </div>

      {/* Interactive client component — renders the full styled UI */}
      <PetitionDetailClient initialPetition={initialPetition} />
    </>
  );
}

