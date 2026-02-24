import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionCardProps {
  image: string;
  title: string;
  description: string;
  href: string;
  imageAlt?: string;
}

export default function SectionCard({
  image,
  title,
  description,
  href,
  imageAlt,
}: SectionCardProps) {
  return (
    <Link href={href} className="group block">
      <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-100">
        <Image
          src={image}
          alt={imageAlt || title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-[#0a2d5e]/40 group-hover:bg-[#0a2d5e]/50 transition-colors" />
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-1">{title}</h2>
          <p className="text-sm text-white/70 line-clamp-2 hidden sm:block">{description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between py-3 border-b border-gray-200 group-hover:border-[#0066B3] transition-colors">
        <span className="text-sm text-gray-500 group-hover:text-[#0066B3] transition-colors">
          바로가기
        </span>
        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#0066B3] group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}
