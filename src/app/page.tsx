import Hero from "@/components/home/Hero";
import SectionCard from "@/components/home/SectionCard";

const sections = [
  {
    image: "/images/sections/intro.webp",
    title: "정보시스템학과 소개",
    description:
      "경영학과 전산학의 접목으로 이루어진 미래지향적 학문, Engineering-conscious Manager를 양성합니다.",
    href: "/about",
    imageAlt: "학과 소개 이미지",
  },
  {
    image: "/images/sections/faculty.webp",
    title: "교수진 소개",
    description:
      "정보시스템, 데이터 분석, 보안, 바이오인포매틱스 등 다양한 분야의 전문 교수진",
    href: "/about/faculty",
    imageAlt: "교수진 이미지",
  },
  {
    image: "/images/sections/labs.webp",
    title: "연구실 소개",
    description:
      "Bio Informatics, Future Intelligence, Security & Privacy 등 5개 연구실 운영",
    href: "/about/labs",
    imageAlt: "연구실 이미지",
  },
  {
    image: "/images/sections/location.jpg",
    title: "찾아오시는 길",
    description:
      "서울특별시 성동구 왕십리로 222 한양대학교 공업센터 본관 503호",
    href: "/about/location",
    imageAlt: "오시는 길 지도",
  },
];

export default function Home() {
  return (
    <>
      <Hero />

      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {sections.map((section) => (
              <SectionCard key={section.href} {...section} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
