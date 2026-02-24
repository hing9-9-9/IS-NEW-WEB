'use client';

import { useEffect, useState, useCallback } from 'react';
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Course {
  HAKSU_NO: string;
  GWAMOK_NM: string;
  GWAMOK_ENM: string;
  HAKJEOM: number;
  IRON_SIGAN: number;
  SILS_SIGAN: number;
  ISU_GB_NM: string;
  ISU_GRADE: string | null;
  ISU_TERM: string;
  GYGJ_CD: string;
  START_YEAR: string;
  END_YEAR: string;
  BIGO: string | null;
}

function parseCurriculumYears(gygjCd: string): { start: string; end: string } | null {
  const match = gygjCd.match(/(\d{4})(\d{4})/);
  if (match) return { start: match[1], end: match[2] };
  return null;
}

function parseCurriculumLabel(gygjCd: string): string {
  const years = parseCurriculumYears(gygjCd);
  if (years) return `${years.start}~${years.end}`;
  return gygjCd;
}

function stripSuffix(value: string): string {
  return value.trim().replace(/[가-힣]+$/g, '');
}

function abbreviateType(value: string): string {
  if (value.length >= 3) return value[0] + value[2];
  return value;
}

const KNOWN_CURRICULA = [
  'GG20262027',
  'GG20242025',
  'GG20222023',
  'GG20202021',
  'GG20182019',
];

const isugubunColor: Record<string, string> = {
  '연구필수': 'bg-red-50 text-red-700',
  '전공선택': 'bg-blue-50 text-blue-700',
  '연구선택': 'bg-purple-50 text-purple-700',
};

export default function GraduateCurriculumPage() {
  const curriculumOptions = KNOWN_CURRICULA.map(code => ({
    label: parseCurriculumLabel(code),
    value: code,
  }));

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gygjCd, setGygjCd] = useState<string>(KNOWN_CURRICULA[0]);
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const fetchCurriculum = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/curriculum?gygj_cd=${gygjCd}&slg_sosok_cd=H0000712`);
      if (!response.ok) throw new Error('Failed to fetch curriculum data');
      const data = await response.json();
      setCourses(data.result?.list || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load curriculum');
    } finally {
      setLoading(false);
    }
  }, [gygjCd]);

  useEffect(() => {
    fetchCurriculum();
  }, [fetchCurriculum]);

  const handleGygjChange = (value: string) => {
    setGygjCd(value);
    setSelectedSemester('all');
    setSelectedType('all');
  };

  const filteredCourses = courses.filter(course => {
    if (selectedSemester !== 'all' && course.ISU_TERM.trim() !== selectedSemester) return false;
    if (selectedType !== 'all' && course.ISU_GB_NM !== selectedType) return false;
    return true;
  });

  const semesters = [...new Set(courses.map(c => c.ISU_TERM.trim()))].sort();
  const types = [...new Set(courses.map(c => c.ISU_GB_NM))];

  return (
    <>
      <PageHeader
        title="대학원 교과과정"
        subtitle="정보시스템학과 대학원 교과과정 안내"
        breadcrumb={[
          { label: "홈", href: "/" },
          { label: "교과안내", href: "/curriculum" },
          { label: "대학원", href: "/curriculum/graduate" },
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Curriculum selector */}
        <div className="flex gap-0 border-b border-gray-200 mb-6">
          {curriculumOptions.map(item => (
            <button
              type="button"
              key={item.value}
              onClick={() => handleGygjChange(item.value)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                gygjCd === item.value
                  ? 'border-[#0066B3] text-[#0066B3]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="filter-semester" className="block text-xs font-medium text-gray-500 mb-1">학기</label>
              <select
                id="filter-semester"
                title="학기 필터"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 focus:ring-1 focus:ring-[#0066B3] focus:border-[#0066B3] outline-none"
              >
                <option value="all">전체</option>
                {semesters.map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filter-type" className="block text-xs font-medium text-gray-500 mb-1">이수구분</label>
              <select
                id="filter-type"
                title="이수구분 필터"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 focus:ring-1 focus:ring-[#0066B3] focus:border-[#0066B3] outline-none"
              >
                <option value="all">전체</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner className="border-[#0066B3]" />
          </div>
        ) : error ? (
          <div className="text-center py-16 border border-gray-200">
            <p className="text-gray-700 text-sm font-medium mb-1">교과과정 데이터를 불러올 수 없습니다.</p>
            <p className="text-gray-400 text-sm mb-4">HY-IN 포털에서 확인해 주세요.</p>
            <button type="button" onClick={fetchCurriculum} className="text-xs text-[#0066B3] hover:underline">다시 시도</button>
          </div>
        ) : (
          <>
            <div className="mb-3 text-xs text-gray-500">
              총 <span className="font-medium text-[#0066B3]">{filteredCourses.length}</span>개 과목
            </div>

            <div className="border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#0a2d5e] text-white">
                      <th className="px-3 py-2.5 text-center text-xs font-medium">학수번호</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium">과목명</th>
                      <th className="px-2 py-2.5 text-center text-xs font-medium">학점</th>
                      <th className="px-2 py-2.5 text-center text-xs font-medium">이론</th>
                      <th className="px-2 py-2.5 text-center text-xs font-medium">실습</th>
                      <th className="px-3 py-2.5 text-center text-xs font-medium">이수구분</th>
                      <th className="px-2 py-2.5 text-center text-xs font-medium">학기</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCourses.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">
                          조건에 맞는 과목이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      filteredCourses.map((course, index) => (
                        <tr key={`${course.HAKSU_NO}-${index}`} className="hover:bg-gray-50/50">
                          <td className="px-3 py-2.5 text-xs text-center text-gray-500 font-mono">{course.HAKSU_NO}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-900">
                            <span className="font-medium">{course.GWAMOK_NM}</span>
                            <span className="block text-[11px] text-gray-400 mt-0.5">{course.GWAMOK_ENM}</span>
                          </td>
                          <td className="px-2 py-2.5 text-xs text-center text-gray-600">{course.HAKJEOM}</td>
                          <td className="px-2 py-2.5 text-xs text-center text-gray-600">{course.IRON_SIGAN}</td>
                          <td className="px-2 py-2.5 text-xs text-center text-gray-600">{course.SILS_SIGAN}</td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`inline-block px-1.5 py-0.5 text-[11px] ${
                              isugubunColor[course.ISU_GB_NM] || 'bg-gray-100 text-gray-600'
                            }`}>
                              <span className="hidden sm:inline">{course.ISU_GB_NM}</span>
                              <span className="sm:hidden">{abbreviateType(course.ISU_GB_NM)}</span>
                            </span>
                          </td>
                          <td className="px-2 py-2.5 text-xs text-center text-gray-600">
                            {stripSuffix(course.ISU_TERM) || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              {Object.entries(isugubunColor).map(([label, cls]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`inline-block w-2.5 h-2.5 ${cls.split(' ')[0]}`} />
                  <span className="text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
