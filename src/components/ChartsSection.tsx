import React, { useState } from 'react';
import {
  CategoryDistributionItem,
  PKGDistributionItem,
  SummaryMetrics,
  getSeverityBand,
} from '../utils/analytics';
import { SchoolCategory, SchoolRecord } from '../data/baucarData';

interface ChartsSectionProps {
  schools: SchoolRecord[];
  summary: SummaryMetrics;
  categoryDist: CategoryDistributionItem[];
  pkgDist: PKGDistributionItem[];
  selectedCategory: SchoolCategory | 'Semua';
  onSelectCategory: (cat: SchoolCategory | 'Semua') => void;
  onSelectSchool: (school: SchoolRecord) => void;
}

const CATEGORY_COLORS: Record<SchoolCategory, string> = {
  'SMK Harian': '#2563EB', // Blue 600
  'SBP & Sains': '#DC2626', // Crimson 600
  'SM Agama': '#0D9488', // Teal 600
  'TVET & Vokasional': '#D97706', // Amber 600
  'Kolej Tingkatan Enam': '#7C3AED', // Violet 600
};

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  schools,
  summary,
  categoryDist,
  pkgDist,
  selectedCategory,
  onSelectCategory,
  onSelectSchool,
}) => {
  const [pieMetric, setPieMetric] = useState<'status' | 'kategori' | 'bakiKategori'>('bakiKategori');
  const [barMode, setBarMode] = useState<'belumGuna' | 'enrolmen' | 'pkg'>('belumGuna');
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // Prepare Pie Chart slices based on active pieMetric
  const pieSlices = React.useMemo(() => {
    if (pieMetric === 'status') {
      const total = summary.jumlahDaftar || 1;
      return [
        {
          id: 'Sudah Guna',
          label: 'Sudah Guna',
          value: summary.jumlahSudahGuna,
          percentage: Number(((summary.jumlahSudahGuna / total) * 100).toFixed(2)),
          color: '#16A34A',
          categoryFilter: null as SchoolCategory | null,
        },
        {
          id: 'Belum Guna',
          label: 'Belum Guna',
          value: summary.jumlahBelumGuna,
          percentage: Number(((summary.jumlahBelumGuna / total) * 100).toFixed(2)),
          color: '#DC2626',
          categoryFilter: null as SchoolCategory | null,
        },
      ];
    }

    if (pieMetric === 'kategori') {
      const total = summary.jumlahDaftar || 1;
      return categoryDist.map((c) => ({
        id: c.kategori,
        label: c.kategori,
        value: c.jumlahDaftar,
        percentage: Number(((c.jumlahDaftar / total) * 100).toFixed(1)),
        color: CATEGORY_COLORS[c.kategori],
        categoryFilter: c.kategori,
      }));
    }

    // 'bakiKategori': Breakdown of Belum Guna by Category
    const totalBaki = summary.jumlahBelumGuna || 1;
    return categoryDist
      .filter((c) => c.belumGuna > 0)
      .map((c) => ({
        id: c.kategori,
        label: c.kategori,
        value: c.belumGuna,
        percentage: Number(((c.belumGuna / totalBaki) * 100).toFixed(1)),
        color: CATEGORY_COLORS[c.kategori],
        categoryFilter: c.kategori,
      }));
  }, [pieMetric, summary, categoryDist]);

  // Calculate SVG Donut geometry
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;

  // Prepare Bar Chart items
  const barItems = React.useMemo(() => {
    if (barMode === 'belumGuna') {
      const sorted = [...schools]
        .filter((s) => s.belumGuna > 0)
        .sort((a, b) => b.belumGuna - a.belumGuna)
        .slice(0, 12);
      const maxVal = sorted.length > 0 ? Math.max(...sorted.map((s) => s.belumGuna)) : 1;
      return sorted.map((s) => ({
        id: s.kod,
        title: s.nama,
        subtitle: `${s.pkg} · ${s.kategori}`,
        value: s.belumGuna,
        secondaryText: `${((s.sudahGuna / s.daftar) * 100).toFixed(1)}% selesai`,
        ratio: (s.belumGuna / maxVal) * 100,
        school: s,
        barColor:
          s.belumGuna > 100
            ? 'bg-red-600 dark:bg-red-500'
            : s.belumGuna > 50
            ? 'bg-amber-500 dark:bg-amber-400'
            : 'bg-blue-600 dark:bg-blue-500',
      }));
    }

    if (barMode === 'enrolmen') {
      const sorted = [...schools].sort((a, b) => b.daftar - a.daftar).slice(0, 12);
      const maxVal = sorted.length > 0 ? Math.max(...sorted.map((s) => s.daftar)) : 1;
      return sorted.map((s) => ({
        id: s.kod,
        title: s.nama,
        subtitle: `${s.pkg} · ${s.kategori}`,
        value: s.daftar,
        secondaryText: `${s.belumGuna === 0 ? '100% Guna' : `${s.belumGuna} belum guna`}`,
        ratio: (s.daftar / maxVal) * 100,
        school: s,
        barColor: s.belumGuna === 0 ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-blue-600 dark:bg-blue-500',
      }));
    }

    // PKG mode
    const maxVal = pkgDist.length > 0 ? Math.max(...pkgDist.map((p) => p.jumlahDaftar)) : 1;
    return pkgDist.map((p) => ({
      id: p.pkg,
      title: p.pkg,
      subtitle: `${p.jumlahSekolah} buah sekolah`,
      value: p.jumlahDaftar,
      secondaryText: `${p.belumGuna} belum guna (${p.kadarPenggunaan}% selesai)`,
      ratio: (p.jumlahDaftar / maxVal) * 100,
      school: null as SchoolRecord | null,
      barColor: p.belumGuna > 200 ? 'bg-amber-500 dark:bg-amber-400' : 'bg-emerald-600 dark:bg-emerald-500',
    }));
  }, [barMode, schools, pkgDist]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Interactive Pie / Donut Chart Card */}
      <section
        aria-label="Carta Pai Analisis Baucar"
        className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between transition-colors"
      >
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Carta Pai Taburan Baucar
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Klik segmen kategori untuk menapis data sekolah secara langsung
              </p>
            </div>

            {/* Segmented Mode Control */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start">
              <button
                type="button"
                onClick={() => setPieMetric('bakiKategori')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  pieMetric === 'bakiKategori'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Baki Kategori
              </button>
              <button
                type="button"
                onClick={() => setPieMetric('kategori')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  pieMetric === 'kategori'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Enrolmen
              </button>
              <button
                type="button"
                onClick={() => setPieMetric('status')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  pieMetric === 'status'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Status Guna
              </button>
            </div>
          </div>

          {/* SVG Donut Chart + Center Readout */}
          <div className="my-6 flex flex-col items-center justify-center">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full -rotate-90 transform overflow-visible"
                role="img"
                aria-label="Carta Pai Visualisasi Data Baucar Buku PPD Seremban"
              >
                {pieSlices.length === 0 ? (
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="transparent"
                    stroke="#16A34A"
                    strokeWidth="26"
                  />
                ) : (
                  pieSlices.map((slice) => {
                    const strokeDasharray = `${(slice.percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -((cumulativePercent / 100) * circumference);
                    cumulativePercent += slice.percentage;
                    const isHovered = hoveredSlice === slice.id;
                    const isSelected =
                      slice.categoryFilter && selectedCategory === slice.categoryFilter;

                    return (
                      <circle
                        key={slice.id}
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth={isHovered || isSelected ? 31 : 25}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-200 cursor-pointer"
                        onMouseEnter={() => setHoveredSlice(slice.id)}
                        onMouseLeave={() => setHoveredSlice(null)}
                        onClick={() => {
                          if (slice.categoryFilter) {
                            onSelectCategory(
                              selectedCategory === slice.categoryFilter
                                ? 'Semua'
                                : slice.categoryFilter
                            );
                          }
                        }}
                      />
                    );
                  })
                )}
              </svg>

              {/* Center Metric Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {pieMetric === 'bakiKategori'
                    ? 'Jumlah Belum Guna'
                    : pieMetric === 'kategori'
                    ? 'Jumlah Daftar'
                    : 'Kadar Guna'}
                </span>
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                  {pieMetric === 'bakiKategori'
                    ? summary.jumlahBelumGuna.toLocaleString()
                    : pieMetric === 'kategori'
                    ? summary.jumlahDaftar.toLocaleString()
                    : `${summary.kadarPenggunaan}%`}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedCategory === 'Semua' ? 'Semua Kategori' : selectedCategory}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Legend Table */}
        <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          {pieSlices.map((slice) => {
            const isSelected =
              slice.categoryFilter && selectedCategory === slice.categoryFilter;
            return (
              <button
                key={slice.id}
                type="button"
                onClick={() => {
                  if (slice.categoryFilter) {
                    onSelectCategory(
                      selectedCategory === slice.categoryFilter ? 'Semua' : slice.categoryFilter
                    );
                  }
                }}
                onMouseEnter={() => setHoveredSlice(slice.id)}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                  isSelected
                    ? 'bg-blue-50/80 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 font-medium'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-xs shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="truncate">{slice.label}</span>
                </div>
                <div className="flex items-center gap-3 font-mono tabular-nums shrink-0">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {slice.value.toLocaleString()}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 w-12 text-right">
                    {slice.percentage}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Interactive Bar Chart Card */}
      <section
        aria-label="Graf Bar Prestasi Sekolah dan PKG"
        className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between transition-colors"
      >
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Graf Bar Analisis Mengikut Sekolah & Zon PKG
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {barMode === 'belumGuna'
                  ? 'Senarai sekolah dengan baki baucar belum guna tertinggi (klik bar untuk perincian)'
                  : barMode === 'enrolmen'
                  ? '12 sekolah dengan pendaftaran baucar tertinggi di PPD Seremban'
                  : 'Perbandingan jumlah baucar & kadar penyelesaian mengikut 5 Zon PKG'}
              </p>
            </div>

            {/* Bar Chart Mode Switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start">
              <button
                type="button"
                onClick={() => setBarMode('belumGuna')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  barMode === 'belumGuna'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Tertinggi Belum Guna
              </button>
              <button
                type="button"
                onClick={() => setBarMode('enrolmen')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  barMode === 'enrolmen'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Saiz Enrolmen
              </button>
              <button
                type="button"
                onClick={() => setBarMode('pkg')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  barMode === 'pkg'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Zon PKG
              </button>
            </div>
          </div>

          {/* Bar List */}
          {barItems.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Tiada sekolah mempunyai baki belum guna bagi tapisan ini.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Semua sekolah dalam kategori ini telah mencapai 100% penggunaan baucar.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-2.5">
              {barItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.school) onSelectSchool(item.school);
                  }}
                  role={item.school ? 'button' : undefined}
                  tabIndex={item.school ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (item.school && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onSelectSchool(item.school);
                    }
                  }}
                  className={`group p-2 rounded-lg transition-colors ${
                    item.school
                      ? 'hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer'
                      : ''
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2 text-xs mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {item.title}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 hidden sm:inline" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 hidden sm:inline truncate">
                        {item.subtitle}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono tabular-nums shrink-0">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                        {item.secondaryText}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 w-14 text-right">
                        {item.value.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Bar Track */}
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden">
                    <div
                      className={`h-full ${item.barColor} rounded-sm transition-transform duration-200 origin-left`}
                      style={{
                        width: `${Math.max(item.ratio, 2)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Legend / Scale Reference from Official PDF */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>Panduan Indikator Baki Belum Guna (Rujukan Rasmi PPD Seremban):</span>
          <div className="flex flex-wrap items-center gap-4 font-mono">
            <span className="text-red-600 dark:text-red-400 font-medium">
              Kritikal: &gt;100
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              Sederhana: 51–100
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              Terkawal: 1–50
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              Selesai: 0
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
