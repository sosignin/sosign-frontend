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
    sitemap: "https://www.sosign.in/sitemap.xml",
  };
}
