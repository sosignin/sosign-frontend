const BASE_URL = "https://sosign.in";

export default async function sitemap() {
  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://api.sosign.in";

  // Static pages
  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/guides`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/currentpetitions`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/successfulpetitions`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/crowdfunding`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/start-petition`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
  ];

  // Dynamic petition pages
  let petitionUrls = [];
  try {
    const res = await fetch(`${backendUrl}/api/petitions?limit=10000`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    if (res.ok) {
      const data = await res.json();
      const petitions = data.petitions || [];
      petitionUrls = petitions.map((petition) => ({
        url: `${BASE_URL}/currentpetitions/${petition.slug}`,
        lastModified: new Date(petition.updatedAt || petition.createdAt),
        changeFrequency: "weekly",
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error("Sitemap: Error fetching petitions:", error.message);
  }

  // Dynamic successful petition pages
  let successfulPetitionUrls = [];
  try {
    const res = await fetch(`${backendUrl}/api/successful-petitions?limit=10000`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const successfulPetitions = data.successfulPetitions || [];
      successfulPetitionUrls = successfulPetitions.map((sp) => ({
        url: `${BASE_URL}/successfulpetitions/${sp._id}`,
        lastModified: new Date(sp.successDate || sp.createdAt),
        changeFrequency: "monthly",
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error("Sitemap: Error fetching successful petitions:", error.message);
  }

  // Dynamic blog pages
  let blogUrls = [];
  try {
    const res = await fetch(`${backendUrl}/api/blogs?limit=10000`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const blogs = data.blogs || [];
      blogUrls = blogs.map((blog) => ({
        url: `${BASE_URL}/blog/${blog.slug}`,
        lastModified: new Date(blog.updatedAt || blog.createdAt),
        changeFrequency: "weekly",
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error("Sitemap: Error fetching blogs:", error.message);
  }

  return [...staticPages, ...petitionUrls, ...successfulPetitionUrls, ...blogUrls];
}
