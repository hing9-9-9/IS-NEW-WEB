'use client';

import { useEffect, useState } from 'react';
import PageHeader from "@/components/ui/PageHeader";
import { Briefcase, TrendingUp, Building2, GraduationCap, LucideIcon } from "lucide-react";
import { careersApi, CareerCategory, CareerStat, CareerPath } from "@/lib/api";

const iconMap: Record<string, LucideIcon> = {
  Building2: Building2,
  TrendingUp: TrendingUp,
  Briefcase: Briefcase,
  GraduationCap: GraduationCap,
};

const defaultStats = [
  { label: "IT 및 금융권 취업", value: "약 60%", description: "2017-2024 졸업생 기준" },
  { label: "취업률", value: "계열 내 상위권", description: "지속적 우수 성과" },
  { label: "대학원 진학률", value: "약 17%", description: "국내외 석·박사 과정" },
  { label: "주요 진출 분야", value: "4개 영역", description: "IT·금융·컨설팅·공공" },
];

const defaultPaths = [
  { title: "IT 직무 (기획, 개발, 관리, 보안)", description: "국내외 대기업 및 테크 기업에서 다양한 IT 직무 수행" },
  { title: "금융권 디지털 전략 및 핀테크", description: "은행, 증권, 보험 등 금융권의 디지털 전환 및 핀테크 서비스 개발" },
  { title: "경영컨설팅 및 회계", description: "IT 전략 컨설팅, 디지털 혁신 프로젝트 관리" },
  { title: "공공기관 및 공무원", description: "정부 출연 연구기관, 금융 당국, 공기업 등에서 정보시스템 업무 수행" },
  { title: "대학원 진학 및 연구", description: "AI, UI/UX, 블록체인, 정보보안, 핀테크 등 전문 분야 연구" },
  { title: "창업 및 스타트업", description: "디지털 전환 시대의 혁신적 비즈니스 모델 개발" },
];

const defaultCategories = [
  {
    title: "대기업 집단",
    icon: "Building2",
    description: "삼성, LG, SK, 현대, 한화 등 주요 대기업 그룹의 IT, 데이터, AI 직무",
    companies: ["삼성전자", "삼성증권", "삼성생명", "삼성물산", "LG전자", "LG CNS", "SK하이닉스", "SK C&C", "현대자동차", "현대오토에버", "한화그룹"],
  },
  {
    title: "테크 기업",
    icon: "TrendingUp",
    description: "국내 주요 IT 플랫폼 및 테크 스타트업에서 개발, 데이터 분석, 기획 직무",
    companies: ["네이버", "카카오", "토스", "쿠팡", "배달의민족", "당근마켓", "야놀자", "무신사", "직방", "왓챠"],
  },
  {
    title: "금융권",
    icon: "Briefcase",
    description: "은행, 증권, 보험 등 금융권의 디지털 전략 및 핀테크 직무",
    companies: ["신한은행", "국민은행", "IBK기업은행", "NH농협", "한국수출입은행", "KB금융", "하나금융", "삼성증권", "미래에셋", "한국투자증권"],
  },
  {
    title: "공공기관",
    icon: "GraduationCap",
    description: "정부 출연 연구기관, 금융 당국, 공기업 등 안정적 공공 부문",
    companies: ["KIST", "KETI", "KISDI", "한국은행", "금융감독원", "인천공항공사", "주택금융공사", "무역보험공사", "한국산업은행", "한국전력"],
  },
];

export default function CareersPage() {
  const [stats, setStats] = useState<CareerStat[] | typeof defaultStats>(defaultStats);
  const [paths, setPaths] = useState<CareerPath[] | typeof defaultPaths>(defaultPaths);
  const [categories, setCategories] = useState<CareerCategory[] | typeof defaultCategories>(defaultCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await careersApi.getAll();
        if (data.stats.length > 0) setStats(data.stats);
        if (data.paths.length > 0) setPaths(data.paths);
        if (data.categories.length > 0) setCategories(data.categories);
      } catch (err) {
        console.error('Failed to fetch careers data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <PageHeader
        title="졸업 후 진로"
        subtitle="2017-2024 졸업생 데이터 기반 진로 현황"
        breadcrumb={[
          { label: "홈", href: "/" },
          { label: "학과소개", href: "/about" },
          { label: "졸업 후 진로", href: "/about/careers" },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Employment Statistics */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#0066B3] inline-block" />
            취업 현황
          </h2>
          <div className="border-b border-gray-200 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200">
            {stats.map((stat, index) => (
              <div
                key={'_id' in stat ? stat._id : index}
                className="bg-white p-5 text-center"
              >
                <p className="text-2xl sm:text-3xl font-bold text-[#0a2d5e]">{stat.value}</p>
                <p className="text-sm font-medium text-gray-700 mt-1">{stat.label}</p>
                {stat.description && <p className="text-xs text-gray-400 mt-0.5">{stat.description}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Career Paths */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#0066B3] inline-block" />
            주요 진로 분야
          </h2>
          <div className="border-b border-gray-200 mb-6" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200">
            {paths.map((path, index) => (
              <div
                key={'_id' in path ? path._id : index}
                className="bg-white p-5"
              >
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  {path.title}
                </h3>
                {path.description && <p className="text-xs text-gray-500 leading-relaxed">{path.description}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Companies by Category */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#0066B3] inline-block" />
            졸업생 취업 기업
          </h2>
          <div className="border-b border-gray-200 mb-6" />
          <div className="space-y-6">
            {categories.map((category, index) => {
              const iconName = (category as { icon?: string }).icon || 'Building2';
              const Icon = iconMap[iconName] || Building2;
              return (
                <div
                  key={'_id' in category ? category._id : index}
                  className="border border-gray-200"
                >
                  <div className="bg-[#0a2d5e] px-5 py-3.5">
                    <div className="flex items-center gap-2.5 text-white">
                      <Icon className="w-5 h-5 text-blue-200/70" />
                      <h3 className="text-sm font-bold">{category.title}</h3>
                    </div>
                    {category.description && (
                      <p className="text-blue-200/60 text-xs mt-1 ml-7.5">{category.description}</p>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap gap-2">
                      {category.companies.map((company) => (
                        <span
                          key={company}
                          className="px-2.5 py-1 bg-gray-50 text-gray-600 text-sm border border-gray-100"
                        >
                          {company}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Notice */}
        <div className="mt-10 border-l-2 border-gray-300 pl-4 py-2">
          <p className="text-gray-500 text-sm">
            위 정보는 졸업생 진로 현황을 바탕으로 작성되었으며,
            실제 취업률 및 기업 목록은 매년 변동될 수 있습니다.
            자세한 진로 상담은 학과 사무실로 문의해 주시기 바랍니다.
          </p>
        </div>
      </div>
    </>
  );
}
