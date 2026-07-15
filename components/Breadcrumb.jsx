import Link from "next/link";

export default function Breadcrumb({ petition }) {
  const category = petition.categories?.[0] || null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap"
    >
      <Link
        href="/"
        className="hover:text-[#F43676] transition-colors font-medium"
      >
        Home
      </Link>

      <span className="text-gray-300">/</span>

      <Link
        href="/currentpetitions"
        className="hover:text-[#F43676] transition-colors font-medium"
      >
        Petitions
      </Link>

      {category && (
        <>
          <span className="text-gray-300">/</span>
          <Link
            href={`/category/${encodeURIComponent(category.toLowerCase())}`}
            className="hover:text-[#F43676] transition-colors font-medium"
          >
            {category}
          </Link>
        </>
      )}

      <span className="text-gray-300">/</span>

      <span className="text-[#1a1a2e] font-semibold truncate max-w-[200px] sm:max-w-[300px]">
        {petition.title}
      </span>
    </nav>
  );
}
