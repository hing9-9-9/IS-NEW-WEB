import Link from "next/link";
import Image from "next/image";
import { navigation, contactInfo } from "@/data/navigation";

interface FooterManager {
  role: string;
  name: string;
  email: string;
}

async function getFooterManagers(): Promise<FooterManager[]> {
  try {
    const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:8070';
    const res = await fetch(`${apiUrl}/api/settings/footer_managers`, {
      next: { revalidate: 300, tags: ['footer_managers'] },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data.value)) return data.value;
  } catch {
    // ignore
  }
  return [];
}

export default async function Footer() {
  const managers = await getFooterManagers();
  return (
    <footer className="bg-[#0a2d5e] text-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo & Contact */}
          <div className="lg:col-span-2">
            <Link href="/">
              <Image
                src="/images/logo/full-logo-s-white.svg"
                alt="한양대학교 정보시스템학과"
                width={260}
                height={36}
                className="h-15 w-auto mb-5"
              />
            </Link>
            <address className="not-italic text-sm space-y-1.5 text-gray-400 leading-relaxed">
              <p>{contactInfo.address}</p>
              <p>
                TEL (학부) {contactInfo.telUndergrad} | (대학원){" "}
                {contactInfo.telGrad}
              </p>
              <p>FAX {contactInfo.fax}</p>
            </address>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3 tracking-wide">바로가기</h3>
            <ul className="space-y-2 text-sm">
              {navigation.slice(0, 5).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3 tracking-wide">담당자</h3>
            <ul className="space-y-2.5 text-sm">
              {managers.map((manager) => (
                <li key={manager.email} className="text-gray-400">
                  <span className="text-gray-500 text-xs">{manager.role}</span>
                  <br />
                  <span className="text-gray-300">{manager.name}</span>{" "}
                  <a
                    href={`mailto:${manager.email}`}
                    className="text-blue-300/70 hover:text-blue-200 transition-colors"
                  >
                    {manager.email}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-white/10 text-center text-xs text-gray-500">
          Copyright &copy; {new Date().getFullYear()} Hanyang University
          Department of Information Systems. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
