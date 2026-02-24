import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; href: string }[];
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumb,
}: PageHeaderProps) {
  return (
    <div className="bg-[#0a2d5e] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {breadcrumb && (
          <nav className="flex items-center gap-1 text-sm mb-4 text-blue-200/70">
            {breadcrumb.map((item, index) => (
              <span key={item.href} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="w-3 h-3" />}
                {index < breadcrumb.length - 1 ? (
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-blue-100">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-sm sm:text-base text-blue-200/80 font-light">{subtitle}</p>
        )}
      </div>
      <div className="h-0.5 bg-gradient-to-r from-[#0066B3] via-[#FFD700] to-transparent" />
    </div>
  );
}
