import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "한양대학교 정보시스템학과",
  description:
    "한양대학교 공과대학 정보시스템학과 - Engineering-conscious Manager를 양성하는 미래지향적 학과입니다.",
  keywords: ["한양대학교", "정보시스템학과", "공과대학", "IT", "경영정보"],
  openGraph: {
    title: "한양대학교 정보시스템학과",
    description: "Engineering-conscious Manager를 양성하는 미래지향적 학과",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="antialiased">
        <LayoutWrapper footer={<Footer />}>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
