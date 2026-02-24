'use client';

import { useEffect, useState } from 'react';
import { Save, Plus, X } from 'lucide-react';
import { studentCouncilApi } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import RichTextEditor from '@/components/ui/RichTextEditor';

export default function AdminStudentCouncilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    introduction: '',
    instagramUrl: '',
    image: '',
    members: [] as { name: string; role: string; image: string }[],
    isActive: true,
  });

  const [newMember, setNewMember] = useState({ name: '', role: '', image: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await studentCouncilApi.get();
        if (data) {
          setFormData({
            introduction: data.introduction || '',
            instagramUrl: data.instagramUrl || '',
            image: data.image || '',
            members: (data.members || []).map(m => ({ name: m.name, role: m.role, image: m.image || '' })),
            isActive: data.isActive,
          });
        }
      } catch {
        // new, use defaults
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddMember = () => {
    if (newMember.name.trim() && newMember.role.trim()) {
      setFormData({
        ...formData,
        members: [...formData.members, { ...newMember }],
      });
      setNewMember({ name: '', role: '', image: '' });
    }
  };

  const handleRemoveMember = (index: number) => {
    setFormData({
      ...formData,
      members: formData.members.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      await studentCouncilApi.update(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">학생회 관리</h1>
        <p className="text-gray-600 mt-1">학생회 정보를 관리합니다</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          저장되었습니다
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            소개글
          </label>
          <RichTextEditor
            value={formData.introduction}
            onChange={(html) => setFormData({ ...formData, introduction: html })}
            placeholder="학생회 소개글을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            인스타그램 URL
          </label>
          <input
            type="url"
            value={formData.instagramUrl}
            onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://instagram.com/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이미지 URL (선택)
          </label>
          <input
            type="text"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://..."
          />
        </div>

        {/* Members */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            구성원
          </label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <input
              type="text"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="이름"
            />
            <input
              type="text"
              value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="역할 (예: 회장)"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={newMember.image}
                onChange={(e) => setNewMember({ ...newMember, image: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="이미지 URL (선택)"
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {formData.members.map((member, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-sm"
              >
                <span>{member.role} - {member.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">활성화</span>
          </label>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
