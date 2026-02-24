'use client';

import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Calendar, ChevronRight, ChevronLeft } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { noticesApi, Notice, Pagination } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatDate, getPaginationRange } from "@/lib/utils";

const categories = [
  { label: "학과 공지", value: "학과" },
  { label: "대학원 공지", value: "대학원" },
  { label: "자료실", value: "자료실" },
];

function NoticesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentCategory = searchParams.get("category") || "";
  const currentPage = parseInt(searchParams.get("page") || "1");

  const [notices, setNotices] = useState<Notice[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await noticesApi.getAll({
          category: currentCategory || undefined,
          page: currentPage,
          limit: 15,
        });
        setNotices(data.notices);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : '공지사항을 불러오지 못했습니다');
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, [currentCategory, currentPage]);

  const setCategory = (cat: string) => {
    const params = new URLSearchParams();
    if (cat) params.set("category", cat);
    router.push(`/notices?${params.toString()}`);
  };

  const setPage = (page: number) => {
    const params = new URLSearchParams();
    if (currentCategory) params.set("category", currentCategory);
    if (page > 1) params.set("page", String(page));
    router.push(`/notices?${params.toString()}`);
  };


  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Category Tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-8">
        <button
          onClick={() => setCategory("")}
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
            onClick={() => setCategory(cat.value)}
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
      ) : notices.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">공지사항이 없습니다</p>
        </div>
      ) : (
        <>
          {/* Notice List — table style */}
          <div className="border-t-2 border-[#0a2d5e]">
            {notices.map((notice) => (
              <Link
                key={notice._id}
                href={`/notices/${notice._id}`}
                className="flex items-center gap-4 px-3 py-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {notice.isPinned && (
                      <span className="px-1.5 py-0.5 bg-red-50 text-red-500 text-[11px] font-medium">
                        중요
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[11px] font-medium">
                      {notice.category}
                    </span>
                  </div>
                  <h3 className="text-[15px] text-gray-800 group-hover:text-[#0066B3] transition-colors truncate">
                    {notice.title}
                  </h3>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400 flex-shrink-0">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(notice.createdAt)}
                  </span>
                  <span className="w-12 text-right">조회 {notice.views}</span>
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
    </div>
  );
}

export default function NoticesPage() {
  return (
    <>
      <PageHeader
        title="공지사항"
        subtitle="정보시스템학과의 주요 공지사항입니다"
        breadcrumb={[
          { label: "홈", href: "/" },
          { label: "공지사항", href: "/notices" },
        ]}
      />
      <Suspense fallback={
        <div className="flex justify-center py-12">
          <LoadingSpinner className="border-[#0066B3]" />
        </div>
      }>
        <NoticesContent />
      </Suspense>
    </>
  );
}
