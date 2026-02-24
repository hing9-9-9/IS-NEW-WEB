'use client';

import PageHeader from "@/components/ui/PageHeader";
import { useEffect, useState } from "react";
import { studentCouncilApi } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface StudentCouncilData {
  introduction: string;
  instagramUrl: string;
  image?: string;
  members: { name: string; role: string; image?: string }[];
}

const INSTAGRAM_USERNAME = 'hyu_infosys';
const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_USERNAME}/`;

const defaultData: StudentCouncilData = {
  introduction:
    '<p>정보시스템학과를 대표하는 정보시스템학과 학생회는 2010년 학과 창설 이래 정보시스템학과 학우들의 목소리를 가장 가까이에서 듣고 해결하는 학생 자치 조직입니다.</p><p>신입생 맞이, 학기 중 행사, 복지사업 등을 진행합니다.</p>',
  instagramUrl: INSTAGRAM_URL,
  image: '',
  members: [],
};

export default function StudentCouncilPage() {
  const [data, setData] = useState<StudentCouncilData>(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await studentCouncilApi.get();
        if (result) {
          setData(result);
        }
      } catch {
        // fallback to default
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <PageHeader
        title="학생회"
        subtitle="정보시스템학과 학생회를 소개합니다"
        breadcrumb={[
          { label: "홈", href: "/" },
          { label: "학생회", href: "/student-council" },
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner className="border-[#0066B3]" />
          </div>
        ) : (
          <div className="space-y-10">
            {/* Motto Heading */}
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0066B3] tracking-wide">
                애국한양 선봉공대 선진정보
              </h2>
            </div>

            {/* Image */}
            {data.image && (
              <div className="w-full overflow-hidden rounded-lg">
                <img
                  src={data.image}
                  alt="학생회"
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Introduction */}
            <div
              className="prose max-w-none text-gray-700 leading-relaxed text-base"
              dangerouslySetInnerHTML={{ __html: data.introduction }}
            />

            {/* Members */}
            {data.members && data.members.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">구성원</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {data.members.map((member, index) => (
                    <div key={index} className="text-center">
                      <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full overflow-hidden mb-2">
                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instagram Embed */}
            <div className="flex flex-col items-center">
              <iframe
                src={`https://www.instagram.com/${INSTAGRAM_USERNAME}/embed/`}
                width="400"
                height="480"
                frameBorder={0}
                scrolling="no"
                className="rounded-2xl shadow-sm max-w-full"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
