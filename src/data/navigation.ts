export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  {
    label: "학과소개",
    href: "/about",
    children: [
      { label: "정보시스템학과 소개", href: "/about" },
      { label: "교수진 소개", href: "/about/faculty" },
      { label: "행정직원 소개", href: "/about/staff" },
      { label: "연구실 소개", href: "/about/labs" },
      { label: "졸업 후 진로", href: "/about/careers" },
      { label: "찾아오시는 길", href: "/about/location" },
    ],
  },
  {
    label: "교과안내",
    href: "/curriculum",
    children: [
      { label: "학부", href: "/curriculum/undergraduate" },
      { label: "대학원", href: "/curriculum/graduate" },
    ],
  },
  {
    label: "학사안내",
    href: "/academic",
    children: [
      { label: "학사 일정", href: "/academic/schedule" },
      { label: "졸업요건", href: "/academic/requirements" },
    ],
  },
  {
    label: "공지사항",
    href: "/notices",
    children: [
      { label: "학과 공지", href: "/notices?category=학과" },
      { label: "대학원 공지", href: "/notices?category=대학원" },
      { label: "자료실", href: "/notices?category=자료실" },
    ],
  },
  {
    label: "취업 게시판",
    href: "/jobs",
  },
  {
    label: "학생회",
    href: "/student-council",
  },
];

export const contactInfo = {
  address: "(04763) 서울특별시 성동구 왕십리로 222 한양대학교 공업센터 본관 503호",
  telUndergrad: "+82-2-2220-3137",
  telGrad: "+82-2-2220-2341",
  fax: "+82-2-2220-3139",
  managers: [
    { role: "홈페이지 책임자", name: "김은찬", email: "eckim@hanyang.ac.kr" },
    { role: "홈페이지 관리자", name: "권혁준", email: "romas@hanyang.ac.kr" },
    { role: "홈페이지 담당자", name: "박혜인", email: "phiphi@hanyang.ac.kr" },
  ],
};
