'use client';

import { useState, useEffect } from 'react';
import { Save, RefreshCw, Database, Server, Shield, FileText, MapPin, Info, UserCircle, Plus, Trash2 } from 'lucide-react';
import { siteSettingsApi } from '@/lib/api';

type Tab = 'system' | 'about' | 'location' | 'footer';

interface FooterManager {
  role: string;
  name: string;
  email: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('system');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // About content
  const [aboutOverview, setAboutOverview] = useState('');
  const [aboutGoals, setAboutGoals] = useState('');
  const [aboutFeatures, setAboutFeatures] = useState('');

  // Footer managers
  const [managers, setManagers] = useState<FooterManager[]>([
    { role: '홈페이지 책임자', name: '김은찬', email: 'eckim@hanyang.ac.kr' },
    { role: '홈페이지 관리자', name: '권혁준', email: 'romas@hanyang.ac.kr' },
    { role: '홈페이지 담당자', name: '박혜인', email: 'phiphi@hanyang.ac.kr' },
  ]);

  // Location
  const [locationAddress, setLocationAddress] = useState('');
  const [locationPhone, setLocationPhone] = useState('');
  const [locationMapEmbed, setLocationMapEmbed] = useState('');
  const [locationHours, setLocationHours] = useState('');
  const [locationTransport, setLocationTransport] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const footerData = await siteSettingsApi.get('footer_managers');
        if (footerData.value && Array.isArray(footerData.value)) {
          setManagers(footerData.value as FooterManager[]);
        }

        const aboutData = await siteSettingsApi.get('about_content');
        if (aboutData.value) {
          const val = aboutData.value as { overview?: string; goals?: string[]; features?: { title: string; desc: string }[] };
          setAboutOverview(val.overview || '');
          setAboutGoals(val.goals?.join('\n') || '');
          setAboutFeatures(val.features?.map(f => `${f.title}|${f.desc}`).join('\n') || '');
        }

        const keys = ['location_address', 'location_phone', 'location_map_embed', 'location_hours', 'location_transport'];
        const results = await Promise.all(keys.map(k => siteSettingsApi.get(k)));
        if (results[0].value) setLocationAddress(results[0].value as string);
        if (results[1].value) setLocationPhone(results[1].value as string);
        if (results[2].value) setLocationMapEmbed(results[2].value as string);
        if (results[3].value) setLocationHours(results[3].value as string);
        if (results[4].value) {
          const transport = results[4].value as { type: string; info: string }[];
          setLocationTransport(transport.map(t => `${t.type}|${t.info}`).join('\n'));
        }
      } catch {
        // use defaults
      }
    };
    loadSettings();
  }, []);

  const showSaveMessage = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const saveAbout = async () => {
    try {
      setSaving(true);
      const goals = aboutGoals.split('\n').filter(g => g.trim());
      const features = aboutFeatures.split('\n').filter(f => f.trim()).map(f => {
        const [title, ...rest] = f.split('|');
        return { title: title.trim(), desc: rest.join('|').trim() };
      });
      await siteSettingsApi.update('about_content', {
        overview: aboutOverview,
        goals,
        features,
      });
      showSaveMessage('학과소개 내용이 저장되었습니다.');
    } catch (err) {
      alert(err instanceof Error ? err.message : '저장 실패');
    } finally {
      setSaving(false);
    }
  };

  const saveFooter = async () => {
    try {
      setSaving(true);
      await siteSettingsApi.update('footer_managers', managers);
      showSaveMessage('담당자 정보가 저장되었습니다.');
    } catch (err) {
      alert(err instanceof Error ? err.message : '저장 실패');
    } finally {
      setSaving(false);
    }
  };

  const updateManager = (index: number, field: keyof FooterManager, value: string) => {
    setManagers(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const addManager = () => {
    setManagers(prev => [...prev, { role: '', name: '', email: '' }]);
  };

  const removeManager = (index: number) => {
    setManagers(prev => prev.filter((_, i) => i !== index));
  };

  const saveLocation = async () => {
    try {
      setSaving(true);
      const transport = locationTransport.split('\n').filter(t => t.trim()).map(t => {
        const [type, ...rest] = t.split('|');
        return { type: type.trim(), info: rest.join('|').trim() };
      });
      await Promise.all([
        siteSettingsApi.update('location_address', locationAddress),
        siteSettingsApi.update('location_phone', locationPhone),
        siteSettingsApi.update('location_map_embed', locationMapEmbed),
        siteSettingsApi.update('location_hours', locationHours),
        siteSettingsApi.update('location_transport', transport),
      ]);
      showSaveMessage('위치 정보가 저장되었습니다.');
    } catch (err) {
      alert(err instanceof Error ? err.message : '저장 실패');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'system' as Tab, label: '시스템', icon: Server },
    { id: 'about' as Tab, label: '학과소개', icon: FileText },
    { id: 'location' as Tab, label: '위치 정보', icon: MapPin },
    { id: 'footer' as Tab, label: '푸터 담당자', icon: UserCircle },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        <p className="text-gray-600 mt-1">사이트 설정 및 콘텐츠를 관리합니다</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
          {saveMessage}
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">시스템 상태</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">백엔드 서버</p>
                    <p className="text-sm text-gray-500">Express.js on port 5001</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">실행 중</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">MongoDB</p>
                    <p className="text-sm text-gray-500">Database</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">연결됨</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">인증</p>
                    <p className="text-sm text-gray-500">현재 비활성화 상태</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">개발 모드</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">관리자 정보</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">사이트 이름</label>
                <input type="text" defaultValue="한양대학교 정보시스템학과" className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">관리자 이메일</label>
                <input type="email" defaultValue="admin@hanyang.ac.kr" className="w-full px-4 py-2 border border-gray-300 rounded-lg" disabled />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-medium text-blue-900 mb-2">사용 안내</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>인증 기능은 현재 개발을 위해 비활성화되어 있습니다</li>
              <li>프로덕션 배포 전에 인증 시스템을 활성화해야 합니다</li>
              <li>데이터베이스 백업은 MongoDB에서 직접 수행하세요</li>
            </ul>
          </div>
        </>
      )}

      {/* About Tab */}
      {activeTab === 'about' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">학과소개 콘텐츠</h2>
          </div>
          <p className="text-sm text-gray-500">학과소개 페이지에 표시되는 내용을 편집합니다.</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">학과 개요</label>
            <textarea
              value={aboutOverview}
              onChange={(e) => setAboutOverview(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="정보시스템학과는..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">교육 목표 (한 줄에 하나씩)</label>
            <textarea
              value={aboutGoals}
              onChange={(e) => setAboutGoals(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="경영학과 IT 기술을 융합한 양성&#10;데이터 기반 의사결정 능력을 갖춘 전문가 육성"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">학과 특징 (제목|설명 형식, 한 줄에 하나씩)</label>
            <textarea
              value={aboutFeatures}
              onChange={(e) => setAboutFeatures(e.target.value)}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="융합형 교육과정|경영학, 컴퓨터과학을 아우르는 교육&#10;실무 중심 교육|산학협력 프로젝트"
            />
          </div>

          <button
            onClick={saveAbout}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save size={18} />
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      )}

      {/* Location Tab */}
      {activeTab === 'location' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">위치 정보</h2>
          </div>
          <p className="text-sm text-gray-500">찾아오시는 길 페이지에 표시되는 정보를 편집합니다.</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
            <textarea
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="(04763) 서울특별시 성동구 왕십리로 222&#10;한양대학교 공업센터 본관 503호"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">전화번호 (줄바꿈으로 구분)</label>
            <textarea
              value={locationPhone}
              onChange={(e) => setLocationPhone(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="학부: +82-2-2220-3137&#10;대학원: +82-2-2220-2341&#10;팩스: +82-2-2220-3139"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Embed URL</label>
            <input
              type="text"
              value={locationMapEmbed}
              onChange={(e) => setLocationMapEmbed(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://www.google.com/maps/embed?..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">운영 시간 (줄바꿈으로 구분)</label>
            <textarea
              value={locationHours}
              onChange={(e) => setLocationHours(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="평일: 09:00 - 18:00&#10;점심시간: 12:00 - 13:00&#10;주말 및 공휴일 휴무"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">교통 안내 (교통수단|설명 형식, 한 줄에 하나씩)</label>
            <textarea
              value={locationTransport}
              onChange={(e) => setLocationTransport(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder='지하철|2호선 한양대역 2번 출구에서 도보 5분&#10;버스|한양대학교 정문 하차&#10;자가용|네비게이션에 "한양대학교 공업센터" 검색'
            />
          </div>

          <button
            onClick={saveLocation}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save size={18} />
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      )}

      {/* Footer Tab */}
      {activeTab === 'footer' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">푸터 담당자</h2>
            </div>
            <button
              type="button"
              onClick={addManager}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus size={15} />
              담당자 추가
            </button>
          </div>
          <p className="text-sm text-gray-500">사이트 하단 푸터에 표시되는 홈페이지 담당자 목록입니다.</p>

          <div className="space-y-3">
            {managers.map((manager, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 items-center p-3 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={manager.role}
                  onChange={(e) => updateManager(index, 'role', e.target.value)}
                  placeholder="역할 (예: 홈페이지 책임자)"
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={manager.name}
                  onChange={(e) => updateManager(index, 'name', e.target.value)}
                  placeholder="이름"
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={manager.email}
                    onChange={(e) => updateManager(index, 'email', e.target.value)}
                    placeholder="이메일"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => removeManager(index)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {managers.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">담당자가 없습니다. 추가 버튼을 눌러 추가하세요.</p>
            )}
          </div>

          <button
            onClick={saveFooter}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save size={18} />
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      )}
    </div>
  );
}
