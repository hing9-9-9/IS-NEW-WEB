'use client';

import { useEffect, useState } from 'react';
import PageHeader from "@/components/ui/PageHeader";
import { Mail, Phone, MapPin } from "lucide-react";
import { staffApi, Staff } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const data = await staffApi.getAll();
        setStaff(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  return (
    <>
      <PageHeader
        title="행정직원 소개"
        subtitle="정보시스템학과 행정직원을 소개합니다"
        breadcrumb={[
          { label: "홈", href: "/" },
          { label: "학과소개", href: "/about" },
          { label: "행정직원 소개", href: "/about/staff" },
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner className="border-[#0066B3]" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-2 border-red-400 p-4 text-red-700 text-sm">
            {error}
          </div>
        ) : staff.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">등록된 직원이 없습니다.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#0a2d5e] text-white">
                    <th className="px-5 py-3 text-left text-sm font-medium">이름</th>
                    <th className="px-5 py-3 text-left text-sm font-medium">담당업무</th>
                    <th className="px-5 py-3 text-left text-sm font-medium">연락처</th>
                    <th className="px-5 py-3 text-left text-sm font-medium hidden md:table-cell">위치</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {staff.map((member) => (
                    <tr key={member._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-medium text-gray-900 text-sm">{member.name}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {member.duties && member.duties.length > 0
                          ? member.duties.join(', ')
                          : '-'
                        }
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {member.phone && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <a href={`tel:${member.phone}`} className="hover:text-[#0066B3]">
                                {member.phone}
                              </a>
                            </div>
                          )}
                          {member.email && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <a href={`mailto:${member.email}`} className="hover:text-[#0066B3]">
                                {member.email}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        {member.office && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {member.office}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="sm:hidden divide-y divide-gray-100">
              {staff.map((member) => (
                <div key={member._id + '-mobile'} className="py-4">
                  <p className="font-medium text-gray-900 text-sm mb-1.5">{member.name}</p>
                  <p className="text-xs text-gray-500 mb-2">
                    {member.duties && member.duties.length > 0 ? member.duties.join(', ') : ''}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    {member.phone && (
                      <a href={`tel:${member.phone}`} className="hover:text-[#0066B3]">{member.phone}</a>
                    )}
                    {member.email && (
                      <a href={`mailto:${member.email}`} className="hover:text-[#0066B3]">{member.email}</a>
                    )}
                    {member.office && <span>{member.office}</span>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
