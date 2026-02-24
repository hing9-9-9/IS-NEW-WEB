'use client';

import PageHeader from "@/components/ui/PageHeader";
import { Users, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { labsApi } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const defaultLabs = [
  { name: "Bio Informatics Lab", nameKr: "바이오인포매틱스 연구실", professor: "Arne Holger Kutzner 교수", description: "생물학적 데이터의 분석과 처리를 위한 알고리즘 및 소프트웨어 개발 연구", researchAreas: ["게놈 분석", "단백질 구조 예측", "생물학적 데이터베이스"] },
  { name: "Data and Business Intelligence Lab", nameKr: "데이터 및 비즈니스 인텔리전스 연구실", professor: "박현석 교수", description: "빅데이터 분석과 비즈니스 인사이트 도출을 위한 연구", researchAreas: ["데이터 분석", "비즈니스 인텔리전스", "데이터 시각화"] },
  { name: "Future Intelligence Lab", nameKr: "미래지능 연구실", professor: "원영준 교수", description: "인공지능과 머신러닝을 활용한 차세대 지능형 시스템 연구", researchAreas: ["딥러닝", "자연어처리", "추천시스템"] },
  { name: "Information System Lab", nameKr: "정보시스템 연구실", professor: "이욱 교수", description: "기업 정보시스템의 설계, 구현 및 관리에 관한 연구", researchAreas: ["ERP", "비즈니스 프로세스", "IT 거버넌스"] },
  { name: "Security and Privacy Lab", nameKr: "보안 및 프라이버시 연구실", professor: "김은찬 교수", description: "정보 보안 및 개인정보 보호를 위한 기술 연구", researchAreas: ["암호학", "네트워크 보안", "프라이버시 보호"] },
];

interface LabDisplay {
  name: string;
  nameKr?: string;
  nameEn?: string;
  professor: string;
  description?: string;
  researchAreas: string[];
  website?: string;
}

export default function LabsPage() {
  const [labs, setLabs] = useState<LabDisplay[]>(defaultLabs);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        setLoading(true);
        const data = await labsApi.getAll();
        if (data.length > 0) {
          const mapped = data.map(lab => ({
            name: lab.nameEn || lab.name,
            nameKr: lab.name,
            professor: lab.professor,
            description: lab.description,
            researchAreas: lab.researchAreas,
            website: lab.website,
          }));
          mapped.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
          setLabs(mapped);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '연구실 정보를 불러오지 못했습니다');
      } finally {
        setLoading(false);
      }
    };
    fetchLabs();
  }, []);

  return (
    <>
      <PageHeader
        title="연구실 소개"
        subtitle="정보시스템학과의 다양한 연구실을 소개합니다"
        breadcrumb={[
          { label: "홈", href: "/" },
          { label: "학과소개", href: "/about" },
          { label: "연구실 소개", href: "/about/labs" },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {error && (
          <div className="bg-red-50 border-l-2 border-red-400 p-4 text-red-700 text-sm mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner className="border-[#0066B3]" />
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {labs.map((lab) => (
              <div key={lab.name} className="py-8 first:pt-0">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
                  {/* Left: name */}
                  <div className="sm:w-64 flex-shrink-0">
                    <h3 className="text-base font-bold text-[#0a2d5e]">{lab.name}</h3>
                    {lab.nameKr && (
                      <p className="text-sm text-gray-400 mt-0.5">{lab.nameKr}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      {lab.professor}
                    </div>
                    {lab.website && (
                      <div className="mt-3">
                        <a
                          href={lab.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#0066B3] rounded-lg hover:bg-[#0052a3] transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Website
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Right: details */}
                  <div className="flex-1">
                    {lab.description && (
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{lab.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {lab.researchAreas.map((area) => (
                        <span
                          key={area}
                          className="text-xs px-2 py-0.5 bg-blue-50 text-[#0066B3]"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
