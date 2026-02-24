'use client';

import PageHeader from "@/components/ui/PageHeader";
import { useEffect, useState } from "react";
import { graduationRequirementsApi } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function RequirementsPage() {
  const [activeType, setActiveType] = useState<string>("학부");
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setContent('');
    graduationRequirementsApi.getContent(activeType)
      .then((data) => setContent(data.content ?? ''))
      .catch(() => setContent(''))
      .finally(() => setLoading(false));
  }, [activeType]);

  return (
    <>
      <PageHeader
        title="졸업요건"
        subtitle="정보시스템학과 졸업요건 안내"
        breadcrumb={[
          { label: "홈", href: "/" },
          { label: "학사안내", href: "/academic" },
          { label: "졸업요건", href: "/academic/requirements" },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Type Tabs */}
        <div className="flex gap-0 border-b border-gray-200 mb-10">
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
              {type}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner className="border-[#0066B3]" />
          </div>
        ) : content ? (
          <div
            className="prose prose-sm max-w-none [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-gray-300 [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm [&_th]:border [&_th]:border-gray-300 [&_th]:px-3 [&_th]:py-2 [&_th]:text-sm [&_th]:font-medium [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_p]:my-1.5 [&_a]:text-[#0066B3] [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">졸업요건 정보가 없습니다</p>
          </div>
        )}
      </div>
    </>
  );
}
