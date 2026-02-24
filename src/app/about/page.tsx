'use client';

import PageHeader from "@/components/ui/PageHeader";
import { useEffect, useState } from "react";
import { siteSettingsApi } from "@/lib/api";

const defaultContent = {
  overview: "정보시스템은 기술과 사람, 데이터와 조직을 연결하는 가장 '현실적이고 실용적인 융합 학문'입니다. 컴퓨터 '시스템'을 통해 '데이터'를 가치있는 '정보'로 변환하고 이를 활용하는 학문으로, 인문·사회적 지식을 근간으로 경영·컴퓨터·정보시스템 세 분야를 복합적으로 다루는 차별화된 공학으로 평가받고 있습니다.",
  goals: [
    "컴퓨터공학·경영/관리·AI를 가로지르는 융합형 인재 양성",
    "디지털 전환(Digital Transformation) 및 AI 엔지니어 등 All-rounder 육성",
    "실무형 인재로 거듭나기 위한 체계적 교육과정 제공",
  ],
  features: [
    { title: "융합 전문가 교수진", desc: "이종 분야(컴퓨터공학·경영/관리·AI)를 가로지르는 융합 전문가로 구성되어 학생이 관심 있는 분야로 심화 학습과 연구 연계 가능" },
    { title: "실무 강조형 교과목", desc: "수업만으로도 실무형 인재로 거듭나기 위한 취업 준비가 되는 실무 중심 커리큘럼 운영" },
    { title: "다양한 진출 분야", desc: "IT·금융·컨설팅·공공기관 등 다채로운 분야로 성공적 진출, IT 직무부터 일반 경영관리 직군까지 All-rounder 배출" },
  ],
};

export default function AboutPage() {
  const [content, setContent] = useState(defaultContent);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await siteSettingsApi.get('about_content');
        if (data.value) {
          setContent(data.value as typeof defaultContent);
        }
      } catch {
        // use default content
      }
    };
    fetchContent();
  }, []);

  return (
    <>
      <PageHeader
        title="정보시스템학과 소개"
        subtitle="기술과 사람, 데이터와 조직을 연결하는 융합 학문"
        breadcrumb={[
          { label: "홈", href: "/" },
          { label: "학과소개", href: "/about" },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Overview */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#0066B3] inline-block" />
            학과 개요
          </h2>
          <div className="border-b border-gray-200 mb-6" />
          <p className="text-[15px] text-gray-600 leading-relaxed">
            {content.overview}
          </p>
        </section>

        {/* Goals */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#0066B3] inline-block" />
            교육 목표
          </h2>
          <div className="border-b border-gray-200 mb-6" />
          <ol className="space-y-4">
            {content.goals.map((goal, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#0a2d5e] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-[15px] text-gray-700">{goal}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Features */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#0066B3] inline-block" />
            학과 특징
          </h2>
          <div className="border-b border-gray-200 mb-6" />
          <div className="grid sm:grid-cols-2 gap-px bg-gray-200">
            {content.features.map((feature, i) => {
              const isOdd = content.features.length % 2 !== 0;
              const isLast = i === content.features.length - 1;
              return (
                <div
                  key={feature.title}
                  className={`bg-white p-6 ${isOdd && isLast ? 'sm:col-span-2' : ''}`}
                >
                  <h3 className="font-semibold text-gray-900 text-[15px] mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
