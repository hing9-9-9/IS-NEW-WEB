'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';
import { heroSlidesApi, HeroSlide } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const emptySlide = {
  title: '',
  subtitle: '',
  badge: '',
  image: '',
  link: '',
  order: 0,
  isActive: true,
};

export default function HeroSlidesAdminPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptySlide);
  const [saving, setSaving] = useState(false);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await heroSlidesApi.getAllAdmin();
      setSlides(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load slides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlides(); }, []);

  const handleEdit = (slide: HeroSlide) => {
    setEditing(slide);
    setCreating(false);
    setForm({
      title: slide.title,
      subtitle: slide.subtitle,
      badge: slide.badge,
      image: slide.image,
      link: slide.link,
      order: slide.order,
      isActive: slide.isActive,
    });
  };

  const handleCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({ ...emptySlide, order: slides.length });
  };

  const handleCancel = () => {
    setCreating(false);
    setEditing(null);
    setForm(emptySlide);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editing) {
        await heroSlidesApi.update(editing._id, form);
      } else {
        await heroSlidesApi.create(form);
      }
      handleCancel();
      fetchSlides();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await heroSlidesApi.delete(id);
      fetchSlides();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const toggleActive = async (slide: HeroSlide) => {
    try {
      await heroSlidesApi.update(slide._id, { isActive: !slide.isActive });
      fetchSlides();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">히어로 슬라이드 관리</h1>
          <p className="text-gray-600 mt-1">메인 페이지 슬라이드를 관리합니다</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>새 슬라이드</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
      )}

      {/* Create/Edit Form */}
      {(creating || editing) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? '슬라이드 수정' : '새 슬라이드'}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="DEPARTMENT OF\nINFORMATION SYSTEM"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">부제목</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Engineering-conscious Manager"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">배지</label>
              <input
                type="text"
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="NO.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL *</label>
              <input
                type="text"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="/images/hero/building-1.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">링크</label>
              <input
                type="text"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="/about"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">순서</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">활성화</label>
          </div>
          {form.image && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">미리보기:</p>
              <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden relative">
                <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={saving || !form.title || !form.image}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Slides List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : slides.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">슬라이드가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {slides.map((slide) => (
            <div
              key={slide._id}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4 ${
                !slide.isActive ? 'opacity-60' : ''
              }`}
            >
              <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
              <div className="w-24 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                <img src={slide.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{slide.title.replace(/\n/g, ' ')}</p>
                <p className="text-sm text-gray-500 truncate">{slide.subtitle}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">순서: {slide.order}</span>
                  {slide.badge && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{slide.badge}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(slide)}
                  className={`p-2 rounded-lg ${slide.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                  title={slide.isActive ? '비활성화' : '활성화'}
                >
                  {slide.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button
                  onClick={() => handleEdit(slide)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(slide._id)}
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
