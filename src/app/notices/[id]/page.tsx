'use client';

import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Calendar, Eye, ArrowLeft, User, Paperclip, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { noticesApi, Notice } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatDateLong } from "@/lib/utils";

export default function NoticeDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        setLoading(true);
        const data = await noticesApi.getById(id);
        setNotice(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '공지사항을 불러오지 못했습니다');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchNotice();
  }, [id]);


  return (
    <>
      <PageHeader
        title="공지사항"
        subtitle="정보시스템학과의 주요 공지사항입니다"
        breadcrumb={[
          { label: "홈", href: "/" },
          { label: "공지사항", href: "/notices" },
          { label: "상세보기", href: "#" },
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Link
          href="/notices"
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
        ) : notice ? (
          <article>
            <div className="border-b-2 border-[#0a2d5e] pb-5 mb-6">
              <div className="flex items-center gap-2 mb-2">
                {notice.isPinned && (
                  <span className="px-1.5 py-0.5 bg-red-50 text-red-500 text-[11px] font-medium">
                    중요
                  </span>
                )}
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[11px] font-medium">
                  {notice.category}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                {notice.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                {notice.author && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {notice.author}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDateLong(notice.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  조회 {notice.views}
                </span>
              </div>
            </div>
            <div
              className="prose prose-sm max-w-none text-[15px] text-gray-700 leading-relaxed min-h-[200px]
                [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
                [&_li]:mb-1 [&_a]:text-[#0066B3] [&_a]:underline [&_strong]:font-semibold
                [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-bold
                [&_h3]:text-base [&_h3]:font-semibold [&_table]:w-full [&_table]:border-collapse
                [&_td]:border [&_td]:border-gray-200 [&_td]:px-3 [&_td]:py-2
                [&_th]:border [&_th]:border-gray-200 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-50 [&_th]:font-semibold
                [&_img.emoji]:inline [&_img.emoji]:w-[1em] [&_img.emoji]:h-[1em] [&_img.emoji]:align-middle [&_img.emoji]:max-w-none"
              dangerouslySetInnerHTML={{ __html: notice.content }}
            />

            {notice.attachments && notice.attachments.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4" />
                  첨부파일 ({notice.attachments.length})
                </h2>
                <ul className="space-y-2">
                  {notice.attachments.map((att) => (
                    <li key={att._id}>
                      <a
                        href={att.path}
                        download={att.originalName}
                        className="inline-flex items-center gap-2 text-sm text-[#0066B3] hover:underline"
                      >
                        <Download className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{att.originalName}</span>
                        <span className="text-gray-400 text-xs">
                          ({att.size < 1024 ? `${att.size} B` : att.size < 1024 * 1024 ? `${(att.size / 1024).toFixed(1)} KB` : `${(att.size / (1024 * 1024)).toFixed(1)} MB`})
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">공지사항을 찾을 수 없습니다</p>
          </div>
        )}
      </div>
    </>
  );
}
