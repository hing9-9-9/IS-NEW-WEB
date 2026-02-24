'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Mail, Phone } from 'lucide-react';
import { facultyApi, Faculty } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const categories = [
  { key: '', label: '전체' },
  { key: '교수진', label: '교수진' },
  { key: '자문교수', label: '자문교수' },
  { key: '명예교수', label: '명예교수' },
];

export default function FacultyAdminPage() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = categoryFilter ? { category: categoryFilter } : undefined;
      const data = await facultyApi.getAllAdmin(params);
      setFaculty(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load faculty');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, [categoryFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await facultyApi.delete(id);
      fetchFaculty();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">교수진 관리</h1>
          <p className="text-gray-600 mt-1">교수진 정보를 관리합니다</p>
        </div>
        <Link
          href="/admin/faculty/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>새 교수</span>
        </Link>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategoryFilter(cat.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              categoryFilter === cat.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
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
      ) : faculty.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">등록된 교수진이 없습니다</p>
          <Link
            href="/admin/faculty/new"
            className="inline-block mt-4 text-blue-600 hover:underline"
          >
            첫 교수 추가하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {faculty.map((prof) => (
            <div
              key={prof._id}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${!prof.isActive ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {prof.image ? (
                    <img
                      src={prof.image}
                      alt={prof.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl text-gray-400">{prof.name[0]}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">
                    {prof.name}
                    {prof.title && <span className="ml-1 text-xs text-blue-600">({prof.title})</span>}
                  </h3>
                  {prof.nameEn && (
                    <p className="text-sm text-gray-500">{prof.nameEn}</p>
                  )}
                  <p className="text-sm text-blue-600">{prof.position}</p>
                  <p className="text-xs text-gray-400">{prof.category || '교수진'}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {prof.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={14} />
                    <span className="truncate">{prof.email}</span>
                  </div>
                )}
                {prof.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} />
                    <span>{prof.phone}</span>
                  </div>
                )}
                {prof.labName && (
                  <p className="text-sm text-gray-500">연구실: {prof.labName}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                <Link
                  href={`/admin/faculty/edit/${prof._id}`}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit size={18} />
                </Link>
                <button
                  onClick={() => handleDelete(prof._id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
