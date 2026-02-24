'use client';

import PageHeader from "@/components/ui/PageHeader";
import { Calendar, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { academicSchedulesApi, AcademicSchedule } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Semester {
  label: string;
  upcoming: boolean;
  schedule: { item: string; date: string; highlight?: string }[];
}

const defaultSchedule: Semester[] = [
  {
    label: "2026학년도 1학기",
    upcoming: true,
    schedule: [
      { item: "전과 접수", date: "1/14~23 (수~금)" },
      { item: "전과 면접", date: "1/27~28 (화~수)" },
      { item: "1학기 수강신청", date: "2/9~13 (월~금)" },
      { item: "입학식", date: "2/25 (수)", highlight: "key" },
      { item: "신·편입생 수강신청", date: "2/27~3/3 (금~화)" },
    ],
  },
  {
    label: "2025학년도 2학기",
    upcoming: false,
    schedule: [
      { item: "개강", date: "9/1 (월)", highlight: "key" },
      { item: "조기졸업 신청", date: "9/1~5 (월~금)" },
      { item: "수강신청 최종 정정", date: "9/4~5 (목~금)" },
      { item: "중간 강의평가", date: "9/29~10/10 (월~금)" },
      { item: "졸업논문 제출", date: "10/10~15 (금~수)" },
      { item: "겨울계절학기 신청", date: "11/10~13 (월~목)" },
      { item: "기말 강의평가", date: "12/1~29 (월~월)" },
      { item: "성적입력 및 열람", date: "12/12~29 (금~월)" },
      { item: "종강", date: "12/20 (토)", highlight: "key" },
      { item: "겨울계절학기", date: "12/22~1/13 (월~화)" },
      { item: "동계방학", date: "12/22~2/28 (월~토)", highlight: "break" },
    ],
  },
];

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Semester[]>(defaultSchedule);
  const [activeType, setActiveType] = useState<string>("학부");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const data = await academicSchedulesApi.getAll({ type: activeType });
        if (data.length > 0) {
          setSchedules(data.map((s: AcademicSchedule, i: number) => ({
            label: s.semesterLabel,
            upcoming: i === 0,
            schedule: s.items.map(item => ({
              item: item.item,
              date: item.date,
              highlight: item.highlight || undefined,
            })),
          })));
        } else {
          setSchedules(defaultSchedule);
        }
      } catch {
        setSchedules(defaultSchedule);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [activeType]);

  return (
    <>
      <PageHeader
        title="학사 일정"
        subtitle="한양대학교 학사 일정 안내"
        breadcrumb={[
          { label: "홈", href: "/" },
          { label: "학사안내", href: "/academic" },
          { label: "학사 일정", href: "/academic/schedule" },
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        {/* Type Tabs */}
        <div className="flex gap-0 border-b border-gray-200">
          {["학부", "대학원"].map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeType === type
                  ? "border-[#0066B3] text-[#0066B3]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {type} 일정
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner className="border-[#0066B3]" />
          </div>
        ) : (
          schedules.map((semester) => (
            <section key={semester.label}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className={`w-4 h-4 ${semester.upcoming ? 'text-[#0066B3]' : 'text-gray-400'}`} />
                <h2 className={`text-base font-bold ${semester.upcoming ? 'text-gray-900' : 'text-gray-500'}`}>
                  {semester.label}
                </h2>
                {semester.upcoming && (
                  <span className="text-[11px] font-medium bg-[#0066B3] text-white px-1.5 py-0.5">예정</span>
                )}
              </div>

              <div className="border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className={semester.upcoming ? 'bg-[#0a2d5e]' : 'bg-gray-50'}>
                      <th className={`px-4 py-2.5 text-left text-sm font-medium ${semester.upcoming ? 'text-white' : 'text-gray-600'}`}>항목</th>
                      <th className={`px-4 py-2.5 text-left text-sm font-medium ${semester.upcoming ? 'text-white' : 'text-gray-600'}`}>일정</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {semester.schedule.map((entry, index) => (
                      <tr
                        key={index}
                        className={
                          entry.highlight === 'key'
                            ? 'bg-blue-50/50'
                            : entry.highlight === 'break'
                              ? 'bg-amber-50/50'
                              : 'hover:bg-gray-50/50'
                        }
                      >
                        <td className="px-4 py-2.5 text-sm">
                          <span className={entry.highlight === 'key' ? 'font-medium text-[#0066B3]' : 'text-gray-800'}>
                            {entry.item}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-sm text-gray-500">{entry.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))
        )}

        <div className="border-l-2 border-amber-300 pl-4 py-2 flex gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-500">
            학사 일정은 사정에 따라 변경될 수 있습니다. 최신 학사 일정은{" "}
            <a
              href="https://www.hanyang.ac.kr/web/www/cal_academic"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0066B3] hover:underline"
            >
              한양대학교 학사일정 페이지
            </a>
            를 확인하세요.
          </p>
        </div>
      </div>
    </>
  );
}
