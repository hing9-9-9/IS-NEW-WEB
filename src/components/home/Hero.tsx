"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { heroSlidesApi, HeroSlide } from "@/lib/api";

const defaultSlides = [
  {
    image: "/images/hero/building-1.jpg",
    title: "DEPARTMENT OF\nINFORMATION SYSTEMS",
    subtitle: "Engineering-conscious Manager",
    badge: "NO.1",
    link: "",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState(defaultSlides);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const data = await heroSlidesApi.getAll();
        if (data.length > 0) {
          setSlides(data.map((s: HeroSlide) => ({
            image: s.image,
            title: s.title,
            subtitle: s.subtitle,
            badge: s.badge,
            link: s.link,
          })));
        }
      } catch {
        // fallback to default slides
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative h-[480px] sm:h-[560px] lg:h-[640px] overflow-hidden bg-[#0a2d5e]">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.image}
            alt="한양대학교 캠퍼스"
            fill
            className="object-cover"
            priority={index === 0}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-[#0a2d5e]/60" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-xl">
                {slide.badge && (
                  <span className="inline-block text-white text-3xl sm:text-4xl font-bold mb-2 tracking-tight">
                    {slide.badge}
                  </span>
                )}
                {slide.subtitle && (
                  <p className="text-blue-100/80 text-base sm:text-lg mb-3 font-light tracking-wide">
                    {slide.subtitle}
                  </p>
                )}
                <h1 className="text-white text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight whitespace-pre-line tracking-tight">
                  {slide.title}
                </h1>
                {slide.link && (
                  <Link
                    href={slide.link}
                    className="inline-block mt-6 px-5 py-2.5 border border-white/30 hover:bg-white/10 text-white text-sm font-medium transition-colors"
                  >
                    자세히 보기
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/60 hover:text-white transition-colors"
            aria-label="이전 슬라이드"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/60 hover:text-white transition-colors"
            aria-label="다음 슬라이드"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-0.5 transition-all duration-300 ${
                index === currentSlide ? "w-8 bg-white" : "w-4 bg-white/40"
              }`}
              aria-label={`슬라이드 ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
