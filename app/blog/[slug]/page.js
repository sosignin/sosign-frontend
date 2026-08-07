import BlogDetailClient from "./BlogDetailClient";

// Fetch blog post on the server
async function getBlog(slug) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${backendUrl}/api/blogs/${slug}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching blog post on server:", error);
    return null;
  }
}

// Generate dynamic metadata for blog details
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  const baseUrl = "https://sosign.in";
  const blogUrl = `${baseUrl}/blog/${slug}`;

  if (!blog) {
    return {
      title: "Article Not Found | SoSign Blog",
      description: "The article you are looking for could not be found.",
    };
  }

  const title = blog.metaTitle || blog.title || "SoSign Blog Article";
  const rawDesc = blog.metaDescription || blog.excerpt || (blog.content ? blog.content.replace(/<[^>]*>/g, '') : '');
  const description = rawDesc || "Read this interesting article on the SoSign petition platform blog.";
  const image = blog.image || `${baseUrl}/blog-default-og.png`;

  const keywords = blog.metaKeywords || (blog.tags && blog.tags.length > 0 ? blog.tags.join(", ") : "");

  return {
    title: blog.metaTitle ? blog.metaTitle : `${title} | SoSign Blog`,
    description: description.substring(0, 160),
    keywords: keywords,
    openGraph: {
      title: title,
      description: description.substring(0, 160),
      url: blogUrl,
      siteName: "SoSign Blog",
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
      canonical: blogUrl,
    },
  };
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  let initialBlog = null;

  try {
    initialBlog = await getBlog(slug);
  } catch (error) {
    console.error("Error fetching initial blog for detail client:", error);
  }

  // Generate structured BlogPosting JSON-LD
  const jsonLd = initialBlog ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": initialBlog.title,
    "image": initialBlog.image || "https://sosign.in/blog-default-og.png",
    "editor": initialBlog.author || "SoSign Staff",
    "genre": initialBlog.category || "General",
    "keywords": "petitions, social change, crowdfunding, India, verified signatures",
    "url": `https://sosign.in/blog/${slug}`,
    "datePublished": initialBlog.createdAt,
    "dateCreated": initialBlog.createdAt,
    "dateModified": initialBlog.updatedAt || initialBlog.createdAt,
    "description": initialBlog.content ? initialBlog.content.replace(/<[^>]*>/g, '').substring(0, 200) : initialBlog.title,
    "author": {
      "@type": "Person",
      "name": initialBlog.author || "SoSign Staff"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SoSign",
      "logo": {
        "@type": "ImageObject",
        "url": "https://sosign.in/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://sosign.in/blog/${slug}`
    }
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BlogDetailClient initialBlog={initialBlog} />
    </>
  );
}
