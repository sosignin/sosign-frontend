export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/my-profile",
        "/my-campaigns",
        "/my-comments",
        "/wallet",
        "/reset-password",
        "/api/",
        "/kyc-callback",
      ],
    },
    sitemap: "https://sosign.in/sitemap.xml",
  };
}
