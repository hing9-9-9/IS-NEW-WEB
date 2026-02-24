'use client';

import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Building2, Calendar, Eye, ArrowLeft, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { jobsApi, Job } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatDateLong } from "@/lib/utils";

export default function JobDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const data = await jobsApi.getById(id);
        setJob(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '채용 정보를 불러오지 못했습니다');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchJob();
  }, [id]);


  return (
    <>
      <PageHeader
        title="취업 게시판"
        subtitle="정보시스템학과 학생을 위한 채용 정보입니다"
        breadcrumb={[
          { label: "홈", href: "/" },
          { label: "취업 게시판", href: "/jobs" },
          { label: "상세보기", href: "#" },
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0066B3] mb-8 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          목록으로
        </Link>

        {error && (
          <div className="bg-red-50 border-l-2 border-red-400 p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner className="border-[#0066B3]" />
          </div>
        ) : job ? (
          <article>
            <div className="border-b-2 border-[#0a2d5e] pb-5 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-1.5 py-0.5 text-[11px] font-medium ${
                    job.category === "채용"
                      ? "bg-green-50 text-green-600"
                      : job.category === "인턴"
                      ? "bg-purple-50 text-purple-600"
                      : job.category === "공모전"
                      ? "bg-orange-50 text-orange-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {job.category}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {job.company}
                </span>
                {job.deadline && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    마감: {formatDateLong(job.deadline)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  조회 {job.views}
                </span>
              </div>
              {job.link && (
                <a
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0a2d5e] text-white text-sm hover:bg-[#0066B3] transition-colors"
                >
                  지원하기
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            <div
              className="prose prose-sm max-w-none min-h-[200px] text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: job.content || '' }}
            />
          </article>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">채용 정보를 찾을 수 없습니다</p>
          </div>
        )}
      </div>
    </>
  );
}
