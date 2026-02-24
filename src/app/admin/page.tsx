'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Briefcase, Users, UserCog, FlaskConical, Plus, Activity, TrendingUp } from 'lucide-react';

interface Stats {
  notices: number;
  jobs: number;
  faculty: number;
  staff: number;
  labs: number;
  careers: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8070';

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    notices: 0,
    jobs: 0,
    faculty: 0,
    staff: 0,
    labs: 0,
    careers: 0
  });
  const [serverStatus, setServerStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const health = await fetch(`${API_URL}/api/health`);
        if (health.ok) {
          const data = await health.json();
          setServerStatus(data.mongodb === 'connected' ? 'connected' : 'disconnected');
        } else {
          setServerStatus('disconnected');
        }

        // Fetch counts (simplified for now)
        const [noticesRes, jobsRes, facultyRes, staffRes, labsRes, careersRes] = await Promise.all([
          fetch(`${API_URL}/api/notices?limit=1`).catch(() => null),
          fetch(`${API_URL}/api/jobs?limit=1`).catch(() => null),
          fetch(`${API_URL}/api/faculty`).catch(() => null),
          fetch(`${API_URL}/api/members`).catch(() => null),
          fetch(`${API_URL}/api/labs`).catch(() => null),
          fetch(`${API_URL}/api/careers`).catch(() => null),
        ]);

        const newStats: Stats = {
          notices: 0,
          jobs: 0,
          faculty: 0,
          staff: 0,
          labs: 0,
          careers: 0
        };

        if (noticesRes?.ok) {
          const data = await noticesRes.json();
          newStats.notices = data.pagination?.total || 0;
        }
        if (jobsRes?.ok) {
          const data = await jobsRes.json();
          newStats.jobs = data.pagination?.total || 0;
        }
        if (facultyRes?.ok) {
          const data = await facultyRes.json();
          newStats.faculty = Array.isArray(data) ? data.length : 0;
        }
        if (staffRes?.ok) {
          const data = await staffRes.json();
          newStats.staff = Array.isArray(data) ? data.length : 0;
        }
        if (labsRes?.ok) {
          const data = await labsRes.json();
          newStats.labs = Array.isArray(data) ? data.length : 0;
        }
        if (careersRes?.ok) {
          const data = await careersRes.json();
          newStats.careers = (data.categories?.length || 0) + (data.stats?.length || 0) + (data.paths?.length || 0);
        }

        setStats(newStats);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setServerStatus('disconnected');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: '공지사항', value: stats.notices, icon: Bell, href: '/admin/notices', color: 'bg-blue-500' },
    { label: '취업정보', value: stats.jobs, icon: Briefcase, href: '/admin/jobs', color: 'bg-green-500' },
    { label: '교수진', value: stats.faculty, icon: Users, href: '/admin/faculty', color: 'bg-purple-500' },
    { label: '행정직원', value: stats.staff, icon: UserCog, href: '/admin/staff', color: 'bg-orange-500' },
    { label: '연구실', value: stats.labs, icon: FlaskConical, href: '/admin/labs', color: 'bg-pink-500' },
    { label: '졸업후 진로', value: stats.careers, icon: TrendingUp, href: '/admin/careers', color: 'bg-teal-500' },
  ];

  const quickActions = [
    { label: '공지사항 작성', href: '/admin/notices/new', icon: Bell },
    { label: '취업정보 추가', href: '/admin/jobs/new', icon: Briefcase },
    { label: '교수 추가', href: '/admin/faculty/new', icon: Users },
    { label: '직원 추가', href: '/admin/staff/new', icon: UserCog },
    { label: '연구실 추가', href: '/admin/labs/new', icon: FlaskConical },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600 mt-1">한양대학교 정보시스템학과 관리자 페이지</p>
      </div>

      {/* Server Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <Activity className={`w-5 h-5 ${
            serverStatus === 'connected' ? 'text-green-500' :
            serverStatus === 'disconnected' ? 'text-red-500' :
            'text-yellow-500'
          }`} />
          <span className="font-medium">서버 상태:</span>
          <span className={`px-2 py-1 rounded text-sm ${
            serverStatus === 'connected' ? 'bg-green-100 text-green-700' :
            serverStatus === 'disconnected' ? 'bg-red-100 text-red-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {serverStatus === 'connected' ? '연결됨' :
             serverStatus === 'disconnected' ? '연결 안됨' :
             '확인 중...'}
          </span>
          {serverStatus === 'disconnected' && (
            <span className="text-sm text-gray-500">
              (서버를 시작하세요: cd server && npm run dev)
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {loading ? '-' : card.value}
                  </div>
                  <div className="text-sm text-gray-500">{card.label}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-medium text-blue-900 mb-2">시작하기</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>MongoDB가 실행 중인지 확인하세요</li>
          <li>터미널에서 <code className="bg-blue-100 px-1 rounded">cd server && npm install && npm run dev</code> 실행</li>
          <li>서버가 연결되면 콘텐츠를 관리할 수 있습니다</li>
        </ol>
      </div>
    </div>
  );
}
