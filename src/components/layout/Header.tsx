"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";
import { navigation, NavItem } from "@/data/navigation";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/logo/full-logo-s-blue.svg"
              alt="한양대학교 정보시스템학과"
              width={260}
              height={36}
              className="h-18 lg:h-18 w-auto cursor-pointer select-none"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center">
            {navigation.map((item) => (
              <NavDropdown
                key={item.href}
                item={item}
                isActive={activeDropdown === item.href}
                onMouseEnter={() => setActiveDropdown(item.href)}
                onMouseLeave={() => setActiveDropdown(null)}
              />
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 -mr-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="메뉴 열기"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-3 space-y-1">
            {navigation.map((item) => (
              <MobileNavItem
                key={item.href}
                item={item}
                onClose={() => setMobileMenuOpen(false)}
              />
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function NavDropdown({
  item,
  isActive,
  onMouseEnter,
  onMouseLeave,
}: {
  item: NavItem;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link
        href={item.href}
        className={`flex items-center px-4 py-2 text-[15px] font-medium transition-colors ${
          isActive ? "text-[#0066B3]" : "text-gray-700 hover:text-[#0066B3]"
        }`}
      >
        {item.label}
        {hasChildren && (
          <ChevronDown
            className={`ml-0.5 w-3.5 h-3.5 transition-transform ${
              isActive ? "rotate-180" : ""
            }`}
          />
        )}
      </Link>

      {hasChildren && isActive && (
        <div className="absolute top-full left-0 w-52 bg-white shadow-lg border border-gray-100 py-1">
          <div className="h-0.5 bg-[#0066B3]" />
          {item.children!.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#0066B3] transition-colors"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileNavItem({
  item,
  onClose,
}: {
  item: NavItem;
  onClose: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="border-b border-gray-50 last:border-0">
      <div className="flex items-center justify-between">
        <Link
          href={item.href}
          className="block px-2 py-2.5 text-[15px] text-gray-800 font-medium"
          onClick={onClose}
        >
          {item.label}
        </Link>
        {hasChildren && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-400"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </div>

      {hasChildren && isOpen && (
        <div className="pb-2 pl-4">
          {item.children!.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className="block px-2 py-2 text-sm text-gray-500 hover:text-[#0066B3]"
              onClick={onClose}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
