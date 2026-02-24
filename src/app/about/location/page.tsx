'use client';

import PageHeader from "@/components/ui/PageHeader";
import { MapPin, Phone, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { siteSettingsApi } from "@/lib/api";

const defaultLocation = {
  address: "(04763) 서울특별시 성동구 왕십리로 222\n한양대학교 공업센터 본관 503호 정보시스템학과",
  phone: "학부: +82-2-2220-3137\n대학원: +82-2-2220-2341\n팩스: +82-2-2220-3139",
  mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3163.1234567890123!2d127.04567890123456!3d37.55567890123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca4995c1c9c9f%3A0x9d8c8e2e5e5e5e5e!2z7ZWc7JaR64yA7ZWZ6rWQ!5e0!3m2!1sko!2skr!4v1234567890123",
  hours: "평일: 09:00 - 18:00\n점심시간: 12:00 - 13:00\n주말 및 공휴일 휴무",
  transport: [
    { type: "지하철", info: "2호선 한양대역 2번 출구\n분당선 왕십리역\n경의선 왕십리역" },
    { type: "버스", info: "한양대학교 정문 하차\n간선버스 121번, 302번, N62(심야)\n지선버스 2012번, 2014번, 2016번, 2222번" },
    { type: "자가용", info: '한양대학교 신정문 또는 동문이용(대운동장 지하주차장 이용)' },
  ],
};

export default function LocationPage() {
  const [location, setLocation] = useState(defaultLocation);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const keys = ['location_address', 'location_phone', 'location_map_embed', 'location_hours', 'location_transport'];
        const results = await Promise.all(keys.map(k => siteSettingsApi.get(k)));

        const updates: Partial<typeof defaultLocation> = {};
        if (results[0].value) updates.address = results[0].value as string;
        if (results[1].value) updates.phone = results[1].value as string;
        if (results[2].value) updates.mapEmbed = results[2].value as string;
        if (results[3].value) updates.hours = results[3].value as string;
        if (results[4].value) updates.transport = results[4].value as typeof defaultLocation.transport;

        if (Object.keys(updates).length > 0) {
          setLocation(prev => ({ ...prev, ...updates }));
        }
      } catch {
        // use default
      }
    };
    fetchLocation();
  }, []);

  return (
    <>
      <PageHeader
        title="찾아오시는 길"
        subtitle="한양대학교 정보시스템학과 행정실 위치 안내"
        breadcrumb={[
          { label: "홈", href: "/" },
          { label: "학과소개", href: "/about" },
          { label: "찾아오시는 길", href: "/about/location" },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Map */}
          <div className="lg:col-span-3 bg-gray-100 overflow-hidden h-[360px] lg:h-[440px]">
            <iframe
              src={location.mapEmbed}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="한양대학교 위치"
            />
          </div>
          
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#0066B3] inline-block" />
                연락처 정보
              </h2>

              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#0066B3] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">주소</p>
                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                      {location.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#0066B3] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">전화번호</p>
                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                      {location.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#0066B3] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">운영 시간</p>
                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                      {location.hours}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-5">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#0066B3] inline-block" />
                교통 안내
              </h2>
              <div className="space-y-3">
                {location.transport.map((t) => (
                  <div key={t.type} className="flex items-start gap-3">
                    <span className="text-xs font-medium text-[#0a2d5e] bg-blue-50 px-2 py-0.5 flex-shrink-0 mt-0.5">
                      {t.type}
                    </span>
                    <p className="text-sm text-gray-600">{t.info}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
