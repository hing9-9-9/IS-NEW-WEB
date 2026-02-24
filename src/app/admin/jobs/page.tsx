'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, ExternalLink, Calendar } from 'lucide-react';
import { jobsApi, Job } from '@/lib/api';
import { formatDate, getPaginationRange } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function JobsAdminPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState<string>('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await jobsApi.getAll({
        page,
        limit: 20,
        category: category || undefined
      });
      setJobs(data.jobs);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, category]);

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await jobsApi.delete(id);
      fetchJobs();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">취업정보 관리</h1>
          <p className="text-gray-600 mt-1">취업 및 채용 정보를 관리합니다</p>
        </div>
        <Link
          href="/admin/jobs/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>새 취업정보</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">전체 카테고리</option>
          <option value="채용">채용</option>
          <option value="인턴">인턴</option>
          <option value="공모전">공모전</option>
          <option value="기타">기타</option>
        </select>
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
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">취업정보가 없습니다</p>
          <Link
            href="/admin/jobs/new"
            className="inline-block mt-4 text-blue-600 hover:underline"
          >
            첫 취업정보 추가하기
          </Link>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    회사
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    마감일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    조회
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 font-medium">
                          {job.title}
                        </span>
                        {job.link && (
                          <ExternalLink size={14} className="text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {job.company}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        job.category === '채용' ? 'bg-blue-100 text-blue-700' :
                        job.category === '인턴' ? 'bg-green-100 text-green-700' :
                        job.category === '공모전' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {job.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {job.deadline ? (
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(job.deadline)}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        {job.views}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/jobs/edit/${job._id}`}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(job._id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1">
              {getPaginationRange(page, totalPages).map((p, i) =>
                p === '...'
                  ? <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm text-gray-400">…</span>
                  : <button
                      type="button"
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-2 rounded-lg text-sm ${p === page ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {p}
                    </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
