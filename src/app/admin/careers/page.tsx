'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Building2, TrendingUp, Briefcase, GraduationCap, BarChart3, Route } from 'lucide-react';
import { careersApi, CareerCategory, CareerStat, CareerPath } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

type TabType = 'stats' | 'paths' | 'categories';

const iconOptions = [
  { value: 'Building2', label: 'IT/기업', icon: Building2 },
  { value: 'TrendingUp', label: '컨설팅/금융', icon: TrendingUp },
  { value: 'Briefcase', label: '대기업', icon: Briefcase },
  { value: 'GraduationCap', label: '대학원', icon: GraduationCap },
];

export default function CareersAdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [stats, setStats] = useState<CareerStat[]>([]);
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [categories, setCategories] = useState<CareerCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await careersApi.getAll();
      setStats(data.stats);
      setPaths(data.paths);
      setCategories(data.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      if (activeTab === 'stats') {
        setFormData({ label: '', value: '', description: '', order: 0, isActive: true });
      } else if (activeTab === 'paths') {
        setFormData({ title: '', description: '', order: 0, isActive: true });
      } else {
        setFormData({ title: '', icon: 'Building2', description: '', companies: [], order: 0, isActive: true });
      }
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      if (activeTab === 'stats') {
        if (editingItem) {
          await careersApi.updateStat(editingItem._id, formData);
        } else {
          await careersApi.createStat(formData);
        }
      } else if (activeTab === 'paths') {
        if (editingItem) {
          await careersApi.updatePath(editingItem._id, formData);
        } else {
          await careersApi.createPath(formData);
        }
      } else {
        if (editingItem) {
          await careersApi.updateCategory(editingItem._id, formData);
        } else {
          await careersApi.createCategory(formData);
        }
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      if (activeTab === 'stats') {
        await careersApi.deleteStat(id);
      } else if (activeTab === 'paths') {
        await careersApi.deletePath(id);
      } else {
        await careersApi.deleteCategory(id);
      }
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      );
    }

    if (activeTab === 'stats') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat._id} className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-2xl font-bold text-blue-600">{stat.value}</span>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal(stat)} className="p-1 text-gray-400 hover:text-blue-600">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(stat._id)} className="p-1 text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="font-medium text-gray-900">{stat.label}</p>
              {stat.description && <p className="text-sm text-gray-500">{stat.description}</p>}
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'paths') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paths.map((path) => (
            <div key={path._id} className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900">{path.title}</h3>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal(path)} className="p-1 text-gray-400 hover:text-blue-600">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(path._id)} className="p-1 text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {path.description && <p className="text-sm text-gray-600">{path.description}</p>}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {categories.map((category) => {
          const IconComponent = iconOptions.find(i => i.value === category.icon)?.icon || Building2;
          return (
            <div key={category._id} className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.title}</h3>
                    {category.description && <p className="text-sm text-gray-500">{category.description}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal(category)} className="p-1 text-gray-400 hover:text-blue-600">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(category._id)} className="p-1 text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {category.companies.map((company, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {company}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderModalContent = () => {
    if (activeTab === 'stats') {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">라벨 *</label>
              <input
                type="text"
                value={formData.label || ''}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="취업률"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">값 *</label>
              <input
                type="text"
                value={formData.value || ''}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="95%"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <input
              type="text"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="졸업 후 6개월 기준"
            />
          </div>
        </>
      );
    }

    if (activeTab === 'paths') {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">진로 분야 *</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="소프트웨어 엔지니어"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              placeholder="시스템 설계 및 개발, 백엔드/프론트엔드 개발 등"
            />
          </div>
        </>
      );
    }

    return (
      <>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리명 *</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="IT/소프트웨어 기업"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">아이콘</label>
            <select
              value={formData.icon || 'Building2'}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {iconOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
          <input
            type="text"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="국내 주요 IT 기업에서 활동"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">기업 목록 (쉼표로 구분)</label>
          <textarea
            value={(formData.companies || []).join(', ')}
            onChange={(e) => setFormData({ ...formData, companies: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
            placeholder="삼성SDS, LG CNS, 네이버, 카카오"
          />
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">졸업후 진로 관리</h1>
          <p className="text-gray-600 mt-1">취업 현황, 진로 분야, 취업 기업을 관리합니다</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>새로 추가</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-4 px-1 flex items-center gap-2 border-b-2 font-medium text-sm ${
              activeTab === 'stats'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 size={18} />
            취업 통계
          </button>
          <button
            onClick={() => setActiveTab('paths')}
            className={`pb-4 px-1 flex items-center gap-2 border-b-2 font-medium text-sm ${
              activeTab === 'paths'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Route size={18} />
            진로 분야
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-4 px-1 flex items-center gap-2 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building2 size={18} />
            취업 기업
          </button>
        </nav>
      </div>

      {/* Content */}
      {renderTabContent()}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              {editingItem ? '수정' : '새로 추가'}
            </h2>
            {renderModalContent()}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">순서</label>
                <input
                  type="number"
                  value={formData.order || 0}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive ?? true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">활성화</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
