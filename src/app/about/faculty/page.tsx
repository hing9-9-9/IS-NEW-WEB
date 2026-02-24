'use client';

import PageHeader from "@/components/ui/PageHeader";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { facultyApi } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface FacultyDisplay {
  name: string;
  nameEn?: string;
  position: string;
  category?: string;
  title?: string;
  image?: string;
  email?: string;
  phone?: string;
  office?: string;
  researchAreas: string[];
  labName?: string;
  labUrl?: string;
  homepage?: string;
}

const defaultFaculty: FacultyDisplay[] = [
  { name: "이욱", nameEn: "Wook Lee", position: "교수", category: "교수진", email: "ooklee@hanyang.ac.kr", phone: "02-2220-2381", office: "공업센터본관 503호", researchAreas: ["정보시스템", "비즈니스 인텔리전스"], labName: "정보시스템 연구실" },
  { name: "오현옥", nameEn: "Hyeonok Oh", position: "교수", category: "교수진", email: "ohoh@hanyang.ac.kr", phone: "02-2220-2382", office: "공업센터본관 503호", researchAreas: ["데이터베이스", "정보보안"], labName: "데이터베이스 연구실" },
  { name: "안종창", nameEn: "Jongchang Ahn", position: "교수", category: "교수진", email: "jcahn@hanyang.ac.kr", phone: "02-2220-2383", office: "공업센터본관 503호", researchAreas: ["소프트웨어 공학", "시스템 분석"], labName: "소프트웨어공학 연구실" },
  { name: "원영준", nameEn: "Youngjoon Won", position: "교수", category: "교수진", email: "yjwon@hanyang.ac.kr", phone: "02-2220-2384", office: "공업센터본관 503호", researchAreas: ["데이터 마이닝", "인공지능"], labName: "미래지능 연구실" },
  { name: "Arne Holger Kutzner", nameEn: "Arne Holger Kutzner", position: "교수", category: "교수진", email: "kutzner@hanyang.ac.kr", phone: "02-2220-2385", office: "공업센터본관 503호", researchAreas: ["바이오인포매틱스", "알고리즘"], labName: "바이오인포매틱스 연구실" },
  { name: "박현석", nameEn: "Hyunseok Park", position: "교수", category: "교수진", email: "hspark@hanyang.ac.kr", phone: "02-2220-2386", office: "공업센터본관 503호", researchAreas: ["정보시스템", "IT 전략"], labName: "데이터 및 비즈니스 인텔리전스 연구실" },
  { name: "김은찬", nameEn: "Eunchan Kim", position: "조교수", category: "교수진", email: "eckim@hanyang.ac.kr", phone: "02-2220-2387", office: "공업센터본관 503호", researchAreas: ["보안", "프라이버시"], labName: "보안 및 프라이버시 연구실" },
];

const tabs = [
  { key: '교수진', label: '교수진' },
  { key: '자문교수', label: '자문 교수' },
  { key: '명예교수', label: '명예 교수' },
] as const;

function FacultyCard({ prof }: { prof: FacultyDisplay }) {
  return (
    <article className="py-8 first:pt-0 flex flex-col sm:flex-row gap-6">
      {/* Photo */}
      <div className="flex-shrink-0">
        <div className="w-32 h-40 bg-gray-100 overflow-hidden">
          {prof.image ? (
            <img
              src={prof.image}
              alt={prof.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
              <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900">
            {prof.name}
            <span className="ml-2 text-sm font-normal text-gray-400">
              {prof.position}{prof.title ? ` / ${prof.title}` : ''}
            </span>
          </h3>
          {prof.nameEn && (
            <p className="text-sm text-gray-400 mt-0.5">{prof.nameEn}</p>
          )}
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm mb-4">
          {prof.office && (
            <>
              <dt className="text-gray-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
              </dt>
              <dd className="text-gray-600">{prof.office}</dd>
            </>
          )}
          {prof.phone && (
            <>
              <dt className="text-gray-400 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
              </dt>
              <dd className="text-gray-600">
                <a href={`tel:${prof.phone}`} className="hover:text-[#0066B3]">{prof.phone}</a>
              </dd>
            </>
          )}
          {prof.email && (
            <>
              <dt className="text-gray-400 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
              </dt>
              <dd className="text-gray-600">
                <a href={`mailto:${prof.email}`} className="hover:text-[#0066B3]">{prof.email}</a>
              </dd>
            </>
          )}
        </dl>

        {prof.researchAreas.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-400 mb-1.5">연구 분야</p>
            <div className="flex flex-wrap gap-1.5">
              {prof.researchAreas.map((area) => (
                <span key={area} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600">
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {prof.labName && (
          <div className="mb-2">
            {prof.labUrl ? (
              <a
                href={prof.labUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-[#0066B3] hover:underline"
              >
                {prof.labName}
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-sm text-gray-500">{prof.labName}</span>
            )}
          </div>
        )}

        {prof.homepage && (
          <div className="mt-3">
            <a
              href={prof.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#0066B3] rounded-lg hover:bg-[#0052a3] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Homepage
            </a>
          </div>
        )}
      </div>
    </article>
  );
}

export default function FacultyPage() {
  const [allFaculty, setAllFaculty] = useState<FacultyDisplay[]>(defaultFaculty);
  const [activeTab, setActiveTab] = useState<string>('교수진');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setLoading(true);
        const data = await facultyApi.getAll();
        if (data.length > 0) {
          setAllFaculty(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '교수진 정보를 불러오지 못했습니다');
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, []);

  const filteredFaculty = allFaculty.filter(
    (prof) => (prof.category || '교수진') === activeTab
  );

  // For 교수진 tab, separate regular and adjunct professors
  const regularFaculty = activeTab === '교수진'
    ? filteredFaculty.filter((prof) => prof.position !== '겸임교수')
    : filteredFaculty;
  const adjunctFaculty = activeTab === '교수진'
    ? filteredFaculty.filter((prof) => prof.position === '겸임교수')
    : [];

  return (
    <>
      <PageHeader
        title="교수진 소개"
        subtitle="정보시스템학과 교수진을 소개합니다"
        breadcrumb={[
          { label: "홈", href: "/" },
          { label: "학과소개", href: "/about" },
          { label: "교수진 소개", href: "/about/faculty" },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {error && (
          <div className="bg-red-50 border-l-2 border-red-400 p-4 text-red-700 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-[#0066B3] text-[#0066B3]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner className="border-[#0066B3]" />
          </div>
        ) : filteredFaculty.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            등록된 교수가 없습니다.
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {regularFaculty.map((prof) => (
                <FacultyCard key={prof.email || prof.name} prof={prof} />
              ))}
            </div>

            {adjunctFaculty.length > 0 && (
              <>
                <h2 className="text-lg font-bold text-[#0a2d5e] mt-12 mb-6 pb-3 border-b-2 border-[#0066B3]">
                  겸임교수진
                </h2>
                <div className="divide-y divide-gray-200">
                  {adjunctFaculty.map((prof) => (
                    <FacultyCard key={prof.email || prof.name} prof={prof} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
