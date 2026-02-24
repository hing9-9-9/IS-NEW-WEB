const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8070';

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

// Notices API
export const noticesApi = {
  getAll: (params?: { category?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    return fetchApi<{ notices: Notice[]; pagination: Pagination }>(`/api/notices?${searchParams}`);
  },
  getById: (id: string) => fetchApi<Notice>(`/api/notices/${id}`),
  create: (data: Partial<Notice>) => fetchApi<Notice>('/api/notices', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Partial<Notice>) => fetchApi<Notice>(`/api/notices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchApi<{ success: boolean }>(`/api/notices/${id}`, {
    method: 'DELETE',
  }),
  uploadAttachments: (id: string, files: File[]): Promise<Notice> => {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    return fetch(`${API_URL}/api/notices/${id}/attachments`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }).then(async r => {
      if (!r.ok) {
        const err = await r.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Upload failed');
      }
      return r.json();
    });
  },
  deleteAttachment: (id: string, attachmentId: string) =>
    fetchApi<{ success: boolean }>(`/api/notices/${id}/attachments/${attachmentId}`, {
      method: 'DELETE',
    }),
};

// Jobs API
export const jobsApi = {
  getAll: (params?: { category?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    return fetchApi<{ jobs: Job[]; pagination: Pagination }>(`/api/jobs?${searchParams}`);
  },
  getById: (id: string) => fetchApi<Job>(`/api/jobs/${id}`),
  create: (data: Partial<Job>) => fetchApi<Job>('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Partial<Job>) => fetchApi<Job>(`/api/jobs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchApi<{ success: boolean }>(`/api/jobs/${id}`, {
    method: 'DELETE',
  }),
};

// Faculty API
export const facultyApi = {
  getAll: (params?: { position?: string; category?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.position) searchParams.set('position', params.position);
    if (params?.category) searchParams.set('category', params.category);
    return fetchApi<Faculty[]>(`/api/faculty?${searchParams}`);
  },
  getAllAdmin: (params?: { category?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    return fetchApi<Faculty[]>(`/api/faculty/all?${searchParams}`);
  },
  getById: (id: string) => fetchApi<Faculty>(`/api/faculty/${id}`),
  create: (data: Partial<Faculty>) => fetchApi<Faculty>('/api/faculty', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Partial<Faculty>) => fetchApi<Faculty>(`/api/faculty/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchApi<{ success: boolean }>(`/api/faculty/${id}`, {
    method: 'DELETE',
  }),
};

// Staff API
export const staffApi = {
  getAll: () => fetchApi<Staff[]>('/api/members'),
  getById: (id: string) => fetchApi<Staff>(`/api/members/${id}`),
  create: (data: Partial<Staff>) => fetchApi<Staff>('/api/members', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Partial<Staff>) => fetchApi<Staff>(`/api/members/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchApi<{ success: boolean }>(`/api/members/${id}`, {
    method: 'DELETE',
  }),
};

// Labs API
export const labsApi = {
  getAll: () => fetchApi<Lab[]>('/api/labs'),
  getById: (id: string) => fetchApi<Lab>(`/api/labs/${id}`),
  create: (data: Partial<Lab>) => fetchApi<Lab>('/api/labs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Partial<Lab>) => fetchApi<Lab>(`/api/labs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchApi<{ success: boolean }>(`/api/labs/${id}`, {
    method: 'DELETE',
  }),
};

// Hero Slides API
export const heroSlidesApi = {
  getAll: () => fetchApi<HeroSlide[]>('/api/hero-slides'),
  getAllAdmin: () => fetchApi<HeroSlide[]>('/api/hero-slides/all'),
  getById: (id: string) => fetchApi<HeroSlide>(`/api/hero-slides/${id}`),
  create: (data: Partial<HeroSlide>) => fetchApi<HeroSlide>('/api/hero-slides', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Partial<HeroSlide>) => fetchApi<HeroSlide>(`/api/hero-slides/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchApi<{ success: boolean }>(`/api/hero-slides/${id}`, {
    method: 'DELETE',
  }),
};

// Academic Schedules API
export const academicSchedulesApi = {
  getAll: (params?: { type?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    return fetchApi<AcademicSchedule[]>(`/api/academic-schedules?${searchParams}`);
  },
  getAllAdmin: (params?: { type?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    return fetchApi<AcademicSchedule[]>(`/api/academic-schedules/all?${searchParams}`);
  },
  getById: (id: string) => fetchApi<AcademicSchedule>(`/api/academic-schedules/${id}`),
  create: (data: Partial<AcademicSchedule>) => fetchApi<AcademicSchedule>('/api/academic-schedules', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Partial<AcademicSchedule>) => fetchApi<AcademicSchedule>(`/api/academic-schedules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchApi<{ success: boolean }>(`/api/academic-schedules/${id}`, {
    method: 'DELETE',
  }),
};

// Graduation Requirements API
export const graduationRequirementsApi = {
  getAll: (params?: { type?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    return fetchApi<GraduationRequirement[]>(`/api/graduation-requirements?${searchParams}`);
  },
  getAllAdmin: (params?: { type?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    return fetchApi<GraduationRequirement[]>(`/api/graduation-requirements/all?${searchParams}`);
  },
  getById: (id: string) => fetchApi<GraduationRequirement>(`/api/graduation-requirements/${id}`),
  create: (data: Partial<GraduationRequirement>) => fetchApi<GraduationRequirement>('/api/graduation-requirements', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Partial<GraduationRequirement>) => fetchApi<GraduationRequirement>(`/api/graduation-requirements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchApi<{ success: boolean }>(`/api/graduation-requirements/${id}`, {
    method: 'DELETE',
  }),
  getContent: (type: string) => fetchApi<{ content: string }>(`/api/graduation-requirements/content/${encodeURIComponent(type)}`),
  updateContent: (type: string, content: string) => fetchApi<{ success: boolean }>(`/api/graduation-requirements/content/${encodeURIComponent(type)}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  }),
};

// Site Settings API
export const siteSettingsApi = {
  getAll: () => fetchApi<SiteSetting[]>('/api/settings'),
  get: (key: string) => fetchApi<SiteSetting>(`/api/settings/${key}`),
  update: (key: string, value: unknown) => fetchApi<SiteSetting>(`/api/settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  }),
};

// Auth API
export const authApi = {
  login: (id: string, password: string) =>
    fetchApi<{ success: boolean; message: string }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ id, password }),
    }),
  logout: () =>
    fetchApi<{ success: boolean; message: string }>('/api/admin/logout', {
      method: 'POST',
    }),
  checkSession: () =>
    fetchApi<{ isLoggedIn: boolean; adminId: string | null }>('/api/admin/session'),
};

// Careers API
export const careersApi = {
  getAll: () => fetchApi<{ categories: CareerCategory[]; stats: CareerStat[]; paths: CareerPath[] }>('/api/careers'),

  // Categories
  getCategories: () => fetchApi<CareerCategory[]>('/api/careers/categories'),
  getCategoryById: (id: string) => fetchApi<CareerCategory>(`/api/careers/categories/${id}`),
  createCategory: (data: Partial<CareerCategory>) => fetchApi<CareerCategory>('/api/careers/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateCategory: (id: string, data: Partial<CareerCategory>) => fetchApi<CareerCategory>(`/api/careers/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteCategory: (id: string) => fetchApi<{ success: boolean }>(`/api/careers/categories/${id}`, {
    method: 'DELETE',
  }),

  // Stats
  getStats: () => fetchApi<CareerStat[]>('/api/careers/stats'),
  getStatById: (id: string) => fetchApi<CareerStat>(`/api/careers/stats/${id}`),
  createStat: (data: Partial<CareerStat>) => fetchApi<CareerStat>('/api/careers/stats', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateStat: (id: string, data: Partial<CareerStat>) => fetchApi<CareerStat>(`/api/careers/stats/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteStat: (id: string) => fetchApi<{ success: boolean }>(`/api/careers/stats/${id}`, {
    method: 'DELETE',
  }),

  // Paths
  getPaths: () => fetchApi<CareerPath[]>('/api/careers/paths'),
  getPathById: (id: string) => fetchApi<CareerPath>(`/api/careers/paths/${id}`),
  createPath: (data: Partial<CareerPath>) => fetchApi<CareerPath>('/api/careers/paths', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updatePath: (id: string, data: Partial<CareerPath>) => fetchApi<CareerPath>(`/api/careers/paths/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deletePath: (id: string) => fetchApi<{ success: boolean }>(`/api/careers/paths/${id}`, {
    method: 'DELETE',
  }),
};

// Student Council API
export const studentCouncilApi = {
  get: () => fetchApi<StudentCouncil | null>('/api/student-council'),
  update: (data: Partial<StudentCouncil>) =>
    fetchApi<StudentCouncil>('/api/student-council', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Types
export interface NoticeAttachment {
  _id: string;
  filename: string;
  originalName: string;
  path: string;
  size: number;
}

export interface Notice {
  _id: string;
  title: string;
  content: string;
  category: '학과' | '대학원' | '자료실';
  author: string;
  attachments: NoticeAttachment[];
  views: number;
  isPinned: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  _id: string;
  title: string;
  company: string;
  content: string;
  category: '채용' | '인턴' | '공모전' | '기타';
  deadline?: string;
  link?: string;
  views: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Faculty {
  _id: string;
  name: string;
  nameEn?: string;
  position: string;
  category?: '교수진' | '자문교수' | '명예교수';
  title?: string;
  image?: string;
  email?: string;
  phone?: string;
  office?: string;
  education: { degree: string; school: string; major: string; year: string }[];
  researchAreas: string[];
  homepage?: string;
  labName?: string;
  labUrl?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  _id: string;
  name: string;
  position: string;
  image?: string;
  email?: string;
  phone?: string;
  office?: string;
  duties: string[];
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lab {
  _id: string;
  name: string;
  nameEn?: string;
  professor: string;
  description?: string;
  researchAreas: string[];
  location?: string;
  phone?: string;
  email?: string;
  website?: string;
  image?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CareerCategory {
  _id: string;
  title: string;
  icon: string;
  description?: string;
  companies: string[];
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CareerStat {
  _id: string;
  label: string;
  value: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CareerPath {
  _id: string;
  title: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HeroSlide {
  _id: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  link: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicScheduleItem {
  item: string;
  date: string;
  highlight: string;
}

export interface AcademicSchedule {
  _id: string;
  semesterLabel: string;
  items: AcademicScheduleItem[];
  type: '학부' | '대학원';
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GraduationRequirement {
  _id: string;
  category: string;
  credits: number;
  details: string;
  type: '학부' | '대학원';
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSetting {
  _id: string;
  key: string;
  value: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface StudentCouncilMember {
  name: string;
  role: string;
  image?: string;
}

export interface StudentCouncil {
  _id: string;
  introduction: string;
  instagramUrl: string;
  image?: string;
  members: StudentCouncilMember[];
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
