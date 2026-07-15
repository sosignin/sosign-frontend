export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/login",
        "/my-profile",
        "/my-petition",
        "/my-campaigns",
        "/my-comments",
        "/wallet",
        "/reset-password",
        "/kyc-callback",
        "/api/",
        "/petition-success",
        "/start-crowdfunding",
      ],
    },
    sitemap: "https://sosign.in/sitemap.xml",
  };
}
