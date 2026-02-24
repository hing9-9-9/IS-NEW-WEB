'use client';

import { useEffect, useState } from 'react';
import { graduationRequirementsApi } from '@/lib/api';
import RichTextEditor from '@/components/ui/RichTextEditor';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const TYPES = ['학부', '대학원'] as const;

export default function RequirementsAdminPage() {
  const [activeType, setActiveType] = useState<string>('학부');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    setContent('');
    graduationRequirementsApi.getContent(activeType)
      .then((data) => setContent(data.content ?? ''))
      .catch(() => setContent(''))
      .finally(() => setLoading(false));
  }, [activeType]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await graduationRequirementsApi.updateContent(activeType, content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err instanceof Error ? err.message : '저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">졸업요건 관리</h1>
          <p className="text-gray-600 mt-1">학부/대학원 졸업요건 내용을 작성합니다</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? '저장 중...' : saved ? '저장됨 ✓' : '저장'}
        </button>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2">
        {TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder={`${activeType} 졸업요건 내용을 입력하세요`}
          />
        )}
      </div>
    </div>
  );
}
