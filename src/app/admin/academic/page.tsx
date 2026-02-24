'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { academicSchedulesApi, AcademicSchedule, AcademicScheduleItem } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const emptyForm = {
  semesterLabel: '',
  items: [{ item: '', date: '', highlight: '' }] as AcademicScheduleItem[],
  type: '학부' as '학부' | '대학원',
  order: 0,
  isActive: true,
};

export default function AcademicAdminPage() {
  const [schedules, setSchedules] = useState<AcademicSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string>('학부');
  const [editing, setEditing] = useState<AcademicSchedule | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [bulkInput, setBulkInput] = useState('');

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await academicSchedulesApi.getAllAdmin({ type: activeType });
      setSchedules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSchedules(); }, [activeType]);

  const handleEdit = (schedule: AcademicSchedule) => {
    setEditing(schedule);
    setCreating(false);
    setForm({
      semesterLabel: schedule.semesterLabel,
      items: schedule.items.length > 0 ? schedule.items : [{ item: '', date: '', highlight: '' }],
      type: schedule.type,
      order: schedule.order,
      isActive: schedule.isActive,
    });
  };

  const handleCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({ ...emptyForm, type: activeType as '학부' | '대학원', order: schedules.length });
  };

  const handleCancel = () => {
    setCreating(false);
    setEditing(null);
    setForm(emptyForm);
    setBulkInput('');
  };

  const parseBulkInput = () => {
    if (!bulkInput.trim()) return;

    const items: AcademicScheduleItem[] = [];
    const lines = bulkInput.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      // Skip month headers like "3월", year headers like "2027년", and empty lines
      if (!trimmed || /^\d+월$/.test(trimmed) || /^\d+년$/.test(trimmed)) continue;

      // Find all date patterns and their positions
      // Pattern: "3/3 (화)" or "3/3 (화) ~ 6 (금)" or "3/3 (화) ~ 3/6 (금)"
      // Note: Second date may omit month (e.g., "~ 6 (금)" instead of "~ 3/6 (금)")
      const datePattern = /\d+\/\d+\s*\([가-힣]\)(?:\s*~\s*\d+(?:\/\d+)?\s*\([가-힣]\))?/g;
      const matches: Array<{ date: string; start: number; end: number }> = [];
      let match;

      while ((match = datePattern.exec(trimmed)) !== null) {
        matches.push({
          date: match[0].trim(),
          start: match.index,
          end: match.index + match[0].length,
        });
      }

      // Extract text between each date and the next date (or end of line)
      for (let i = 0; i < matches.length; i++) {
        const current = matches[i];
        const next = matches[i + 1];

        const textStart = current.end;
        const textEnd = next ? next.start : trimmed.length;
        const description = trimmed.substring(textStart, textEnd).trim();

        if (description) {
          // Determine highlight type
          let highlight = '';
          if (description.includes('개강') || description.includes('종강') ||
              description.includes('수강신청') || description.includes('입학식') ||
              description.includes('학위수여식')) {
            highlight = 'key';
          } else if (description.includes('방학') || description.includes('휴일')) {
            highlight = 'break';
          }

          items.push({
            date: current.date,
            item: description,
            highlight,
          });
        }
      }
    }

    if (items.length > 0) {
      setForm({ ...form, items });
      setBulkInput('');
      alert(`${items.length}개 항목이 파싱되었습니다.`);
    } else {
      alert('파싱할 수 있는 항목이 없습니다. 형식을 확인해주세요.\n예: 3/3 (화)2026학년도 1학기 개강');
    }
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { item: '', date: '', highlight: '' }] });
  };

  const removeItem = (index: number) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm({ ...form, items: newItems });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = { ...form, items: form.items.filter(i => i.item && i.date) };
      if (editing) {
        await academicSchedulesApi.update(editing._id, data);
      } else {
        await academicSchedulesApi.create(data);
      }
      handleCancel();
      fetchSchedules();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await academicSchedulesApi.delete(id);
      fetchSchedules();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const toggleActive = async (schedule: AcademicSchedule) => {
    try {
      await academicSchedulesApi.update(schedule._id, { isActive: !schedule.isActive });
      fetchSchedules();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">학사 일정 관리</h1>
          <p className="text-gray-600 mt-1">학사 일정을 관리합니다</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>새 학기 일정</span>
        </button>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2">
        {['학부', '대학원'].map((type) => (
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
      )}

      {/* Create/Edit Form */}
      {(creating || editing) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? '학기 일정 수정' : '새 학기 일정'}
          </h2>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">학기명 *</label>
              <input
                type="text"
                value={form.semesterLabel}
                onChange={(e) => setForm({ ...form, semesterLabel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2026학년도 1학기"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">구분</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as '학부' | '대학원' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="학부">학부</option>
                <option value="대학원">대학원</option>
              </select>
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

          {/* Bulk Input */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">일괄 입력 (복사-붙여넣기)</label>
              <button
                onClick={parseBulkInput}
                disabled={!bulkInput.trim()}
                className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                파싱하기
              </button>
            </div>
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={6}
              placeholder={`학사일정을 복사-붙여넣기 하세요.\n예:\n3월\n3/3 (화)2026학년도 1학기 개강 3/3 (화) ~ 6 (금)조기졸업 신청기간\n3/10 (화)수강신청 변경 기간 시작`}
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 한양대 학사일정에서 복사한 텍스트를 붙여넣고 "파싱하기"를 클릭하면 자동으로 항목이 추가됩니다.
            </p>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">일정 항목</label>
              <button
                onClick={addItem}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + 항목 추가
              </button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={item.item}
                    onChange={(e) => updateItem(index, 'item', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="항목명"
                  />
                  <input
                    type="text"
                    value={item.date}
                    onChange={(e) => updateItem(index, 'date', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="일정 (예: 3/2 (월))"
                  />
                  <select
                    value={item.highlight}
                    onChange={(e) => updateItem(index, 'highlight', e.target.value)}
                    className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">일반</option>
                    <option value="key">주요</option>
                    <option value="break">방학</option>
                  </select>
                  <button
                    onClick={() => removeItem(index)}
                    className="p-2 text-gray-400 hover:text-red-500"
                    disabled={form.items.length === 1}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="scheduleActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="scheduleActive" className="text-sm text-gray-700">활성화</label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !form.semesterLabel}
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

      {/* Schedules List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">학사 일정이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <div
              key={schedule._id}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${
                !schedule.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{schedule.semesterLabel}</h3>
                  <p className="text-sm text-gray-500">{schedule.items.length}개 항목 | 순서: {schedule.order}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(schedule)}
                    className={`p-2 rounded-lg ${schedule.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                  >
                    {schedule.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <button
                    onClick={() => handleEdit(schedule)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(schedule._id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-200">
                    {schedule.items.slice(0, 5).map((item, i) => (
                      <tr key={i} className={
                        item.highlight === 'key' ? 'bg-blue-50' : item.highlight === 'break' ? 'bg-amber-50' : ''
                      }>
                        <td className="px-3 py-1.5 text-gray-900">{item.item}</td>
                        <td className="px-3 py-1.5 text-gray-500 text-right">{item.date}</td>
                      </tr>
                    ))}
                    {schedule.items.length > 5 && (
                      <tr>
                        <td colSpan={2} className="px-3 py-1.5 text-gray-400 text-center text-xs">
                          외 {schedule.items.length - 5}개 항목
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
