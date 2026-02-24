'use client';

import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Building2, Calendar, ChevronRight, ChevronLeft } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { jobsApi, Job, Pagination } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatDate, getPaginationRange } from "@/lib/utils";

const categories = [
  { label: "채용", value: "채용" },
  { label: "인턴", value: "인턴" },
  { label: "공모전", value: "공모전" },
  { label: "기타", value: "기타" },
];

function JobsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentCategory = searchParams.get("category") || "";
  const currentPage = parseInt(searchParams.get("page") || "1");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await jobsApi.getAll({
          category: currentCategory || undefined,
          page: currentPage,
          limit: 15,
        });
        setJobs(data.jobs);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : '채용 정보를 불러오지 못했습니다');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [currentCategory, currentPage]);

  const setCategoryFilter = (cat: string) => {
    const params = new URLSearchParams();
    if (cat) params.set("category", cat);
    router.push(`/jobs?${params.toString()}`);
  };

  const setPage = (page: number) => {
    const params = new URLSearchParams();
    if (currentCategory) params.set("category", currentCategory);
    if (page > 1) params.set("page", String(page));
    router.push(`/jobs?${params.toString()}`);
  };


  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Category Tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-8">
        <button
          onClick={() => setCategoryFilter("")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            !currentCategory
              ? "border-[#0066B3] text-[#0066B3]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          전체
        </button>
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              currentCategory === cat.value
                ? "border-[#0066B3] text-[#0066B3]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border-l-2 border-red-400 p-4 text-red-700 text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner className="border-[#0066B3]" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">채용 정보가 없습니다</p>
        </div>
      ) : (
        <>
          <div className="border-t-2 border-[#0a2d5e]">
            {jobs.map((job) => (
              <Link
                key={job._id}
                href={`/jobs/${job._id}`}
                className="flex items-center gap-4 px-3 py-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
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
                    <span className="text-xs text-gray-400 flex items-center gap-0.5">
                      <Building2 className="w-3 h-3" />
                      {job.company}
                    </span>
                  </div>
                  <h3 className="text-[15px] text-gray-800 group-hover:text-[#0066B3] transition-colors truncate">
                    {job.title}
                  </h3>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400 flex-shrink-0">
                  {job.deadline && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      ~{formatDate(job.deadline)}
                    </span>
                  )}
                  <span className="w-12 text-right">조회 {job.views}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 mt-10">
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {getPaginationRange(currentPage, pagination.totalPages).map((p, i) =>
                p === '...'
                  ? <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-sm text-gray-400">…</span>
                  : <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 text-sm ${p === currentPage ? "bg-[#0a2d5e] text-white" : "text-gray-500 hover:bg-gray-100"}`}
                    >
                      {p}
                    </button>
              )}
              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= pagination.totalPages}
                className="p-2 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      <div className="mt-10 border-l-2 border-gray-300 pl-4 py-2">
        <p className="text-gray-500 text-sm">
          기업 채용 담당자께서는 정보시스템학과 사무실로 연락주시면 채용 공고를 게시해 드립니다.
          <br />
          연락처: 02-2220-3137 / 이메일: is@hanyang.ac.kr
        </p>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <>
      <PageHeader
        title="취업 게시판"
        subtitle="정보시스템학과 학생을 위한 채용 정보입니다"
        breadcrumb={[
          { label: "홈", href: "/" },
          { label: "취업 게시판", href: "/jobs" },
        ]}
      />
      <Suspense fallback={
        <div className="flex justify-center py-12">
          <LoadingSpinner className="border-[#0066B3]" />
        </div>
      }>
        <JobsContent />
      </Suspense>
    </>
  );
}
