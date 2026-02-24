'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Mail, Phone, Globe, MapPin } from 'lucide-react';
import { labsApi, Lab } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function LabsAdminPage() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLabs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await labsApi.getAll();
      setLabs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load labs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await labsApi.delete(id);
      fetchLabs();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">연구실 관리</h1>
          <p className="text-gray-600 mt-1">연구실 정보를 관리합니다</p>
        </div>
        <Link
          href="/admin/labs/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>새 연구실</span>
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : labs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">등록된 연구실이 없습니다</p>
          <Link
            href="/admin/labs/new"
            className="inline-block mt-4 text-blue-600 hover:underline"
          >
            첫 연구실 추가하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {labs.map((lab) => (
            <div
              key={lab._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{lab.name}</h3>
                  {lab.nameEn && (
                    <p className="text-sm text-gray-500">{lab.nameEn}</p>
                  )}
                  <p className="text-sm text-blue-600 mt-1">지도교수: {lab.professor}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/labs/edit/${lab._id}`}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(lab._id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {lab.description && (
                <p className="text-sm text-gray-600 mt-3 line-clamp-2">{lab.description}</p>
              )}

              {lab.researchAreas && lab.researchAreas.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {lab.researchAreas.map((area, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded text-xs"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-sm">
                {lab.location && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin size={14} />
                    <span className="truncate">{lab.location}</span>
                  </div>
                )}
                {lab.email && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Mail size={14} />
                    <span className="truncate">{lab.email}</span>
                  </div>
                )}
                {lab.phone && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Phone size={14} />
                    <span>{lab.phone}</span>
                  </div>
                )}
                {lab.website && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Globe size={14} />
                    <a href={lab.website} target="_blank" rel="noopener noreferrer" className="truncate hover:text-blue-600">
                      {lab.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
