/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  SCHOOL_DATA,
  SchoolCategory,
  SchoolRecord,
  SeverityBand,
} from './data/baucarData';
import {
  computeCategoryDistribution,
  computePKGDistribution,
  computeSummaryMetrics,
  filterSchools,
} from './utils/analytics';
import { ChartsSection } from './components/ChartsSection';
import { InterventionPanel } from './components/InterventionPanel';
import {
  CertificateGeneratorSection,
  NotificationTriggerPayload,
} from './components/CertificateGeneratorSection';
import { SchoolDataTable } from './components/SchoolDataTable';
import { SchoolDetailModal } from './components/SchoolDetailModal';
import { FloatingChatbot } from './components/FloatingChatbot';
import {
  Search,
  RotateCcw,
  Sun,
  Moon,
  FileText,
  Filter,
  Bell,
  Sparkles,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Award,
  X,
} from 'lucide-react';

const SCHOOL_CATEGORIES: (SchoolCategory | 'Semua')[] = [
  'Semua',
  'SMK Harian',
  'SBP & Sains',
  'SM Agama',
  'TVET & Vokasional',
  'Kolej Tingkatan Enam',
];

const PKG_ZONES = [
  'Semua',
  'PKG AMPANGAN',
  'PKG MAMBAU',
  'PKG RANTAU',
  'PKG NILAI',
  'PKG MANTIN',
];

const STATUS_BANDS: (SeverityBand | 'Semua')[] = [
  'Semua',
  'Kritikal (>100)',
  'Sederhana (51-100)',
  'Rendah (11-50)',
  'Terkawal (1-10)',
  'Selesai (0)',
];

interface AutoNotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'email' | 'sijil' | 'kritikal' | 'pencapaian';
  timestamp: string;
  read: boolean;
  schoolCode?: string;
}

const INITIAL_AUTO_NOTIFICATIONS: AutoNotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Amaran Auto-Notifikasi: 2 Sekolah Baki Kritikal (>100)',
    message:
      'SM Datuk Abdul Razak (171 belum guna) dan SM Sains Tuanku Aishah Rohani (134 belum guna) menyumbang 42.7% daripada keseluruhan baki daerah.',
    category: 'kritikal',
    timestamp: 'Baru sebentar',
    read: false,
    schoolCode: 'NEE4099',
  },
  {
    id: 'notif-2',
    title: 'Penghargaan Automatik: 26 Sekolah Selesai 100%',
    message:
      'Sebanyak 26 daripada 49 sekolah menengah & kolej telah mencapai 100% penggunaan baucar (0 baki). Sijil Penyertaan sedia dihantar ke e-mel penyelaras.',
    category: 'pencapaian',
    timestamp: '2 minit lalu',
    read: false,
    schoolCode: 'NEE4098',
  },
  {
    id: 'notif-3',
    title: 'Sistem E-mel Sijil Aktif (syazwansamsol@gmail.com)',
    message:
      'Mod penghantaran e-mel Sijil Penyertaan mengikut sekolah telah diaktifkan dengan alamat rujukan syazwansamsol@gmail.com.',
    category: 'email',
    timestamp: '5 minit lalu',
    read: false,
    schoolCode: 'NEE4098',
  },
];

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [rgbAuraEnabled, setRgbAuraEnabled] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<SchoolCategory | 'Semua'>('Semua');
  const [selectedPkg, setSelectedPkg] = useState<string>('Semua');
  const [selectedStatusBand, setSelectedStatusBand] = useState<SeverityBand | 'Semua'>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSchoolModal, setSelectedSchoolModal] = useState<SchoolRecord | null>(null);
  const [selectedSchoolForCert, setSelectedSchoolForCert] = useState<SchoolRecord | null>(
    SCHOOL_DATA[0]
  );
  const [chatbotPrompt, setChatbotPrompt] = useState<string | null>(null);

  // Auto-Notification State
  const [notifications, setNotifications] = useState<AutoNotificationItem[]>(
    INITIAL_AUTO_NOTIFICATIONS
  );
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<AutoNotificationItem | null>(
    INITIAL_AUTO_NOTIFICATIONS[0]
  );

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Auto-dismiss floating toast after 7 seconds
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [activeToast]);

  const filteredSchools = useMemo(() => {
    return filterSchools(SCHOOL_DATA, {
      kategori: selectedCategory,
      pkg: selectedPkg,
      statusBand: selectedStatusBand,
      searchQuery,
    });
  }, [selectedCategory, selectedPkg, selectedStatusBand, searchQuery]);

  const summary = useMemo(() => computeSummaryMetrics(filteredSchools), [filteredSchools]);
  const categoryDist = useMemo(
    () => computeCategoryDistribution(filteredSchools),
    [filteredSchools]
  );
  const pkgDist = useMemo(() => computePKGDistribution(filteredSchools), [filteredSchools]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const pushAutoNotification = (payload: NotificationTriggerPayload) => {
    const newItem: AutoNotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: payload.title,
      message: payload.message,
      category: payload.category,
      schoolCode: payload.schoolCode,
      timestamp: new Date().toLocaleTimeString('ms-MY', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      read: false,
    };
    setNotifications((prev) => [newItem, ...prev]);
    setActiveToast(newItem);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetAllFilters = () => {
    setSelectedCategory('Semua');
    setSelectedPkg('Semua');
    setSelectedStatusBand('Semua');
    setSearchQuery('');
  };

  const handleJumpToCertificate = (school: SchoolRecord) => {
    setSelectedSchoolForCert(school);
    const el = document.getElementById('janaan-sijil');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    pushAutoNotification({
      title: `Sijil Sekolah Dipilih: ${school.kod}`,
      message: `Templat Sijil Penyertaan & borang e-mel kini disetkan kepada ${school.nama}.`,
      category: 'sijil',
      schoolCode: school.kod,
    });
  };

  const hasActiveFilters =
    selectedCategory !== 'Semua' ||
    selectedPkg !== 'Semua' ||
    selectedStatusBand !== 'Semua' ||
    searchQuery.trim() !== '';

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors overflow-x-hidden">
      {/* Top 2px Professional Spectrum RGB Line */}
      {rgbAuraEnabled && (
        <div
          aria-hidden="true"
          className="fixed top-0 inset-x-0 h-[3px] z-40 rgb-accent-line"
        />
      )}

      {/* Floating RGB Ambient Studio Mesh Orbs (Non-Blocking Background Layer) */}
      {rgbAuraEnabled && (
        <div
          aria-hidden="true"
          data-testid="floating-rgb-aura"
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        >
          <div className="animate-rgb-orb-a absolute -top-28 -left-24 w-[460px] h-[460px] rounded-full bg-gradient-to-br from-blue-500/18 via-cyan-400/14 to-indigo-600/16 dark:from-blue-500/22 dark:via-cyan-400/16 dark:to-purple-600/20 blur-3xl" />
          <div className="animate-rgb-orb-b absolute top-1/3 -right-28 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-fuchsia-500/14 via-violet-500/14 to-emerald-400/16 dark:from-fuchsia-500/18 dark:via-indigo-500/18 dark:to-emerald-500/18 blur-3xl" />
          <div className="animate-rgb-orb-a absolute -bottom-32 left-1/4 w-[440px] h-[440px] rounded-full bg-gradient-to-r from-emerald-400/14 via-sky-500/14 to-blue-600/14 dark:from-emerald-500/16 dark:via-cyan-500/16 dark:to-blue-600/18 blur-3xl" />
        </div>
      )}

      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-3 sm:gap-8 transition-colors">
        {/* Zone 1: Brand Title (single text element) */}
        <a
          href="#ringkasan"
          className="text-sm sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0"
        >
          PPD Seremban · Baucar Buku 2027
        </a>

        {/* Zone 2: 5 Concise Single-Line Navigation Links */}
        <nav
          aria-label="Navigasi Utama"
          className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-400"
        >
          <a
            href="#ringkasan"
            className="hover:text-slate-900 dark:hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Ringkasan
          </a>
          <a
            href="#visualisasi-data"
            className="hover:text-slate-900 dark:hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Visualisasi Carta
          </a>
          <a
            href="#intervensi-strategik"
            className="hover:text-slate-900 dark:hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Intervensi Strategik
          </a>
          <a
            href="#janaan-sijil"
            className="hover:text-slate-900 dark:hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Sijil &amp; E-mel
          </a>
          <a
            href="#jadual-sekolah"
            className="hover:text-slate-900 dark:hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Senarai Sekolah
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action (Dark Mode Switch) */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setDarkMode((prev) => !prev)}
            aria-label={darkMode ? 'Tukar ke Mod Cerah' : 'Tukar ke Mod Gelap'}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
          >
            {darkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Mod Cerah</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-700" />
                <span>Mod Gelap</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 max-w-[1360px] mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Hero & Executive Context Header */}
        <section id="ringkasan" className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span>Pejabat Pendidikan Daerah Seremban</span>
                <span aria-hidden="true">·</span>
                <span>5 Zon PKG</span>
                <span aria-hidden="true">·</span>
                <span>Data Rasmi 49 Sekolah Menengah &amp; Kolej</span>
                <span aria-hidden="true">·</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  Auto-Notifikasi &amp; E-mel Sijil Aktif
                </span>
              </div>
              <h1
                className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1 tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Analisis Data Baucar Buku PPD Seremban 2027
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 max-w-3xl">
                Papan pemuka eksekutif berprestasi tinggi untuk pemantauan masa nyata Baucar Buku
                Madani, simulasi intervensi strategik, sistem auto-notifikasi pintar, serta janaan
                &amp; penghantaran e-mel Sijil Penyertaan mengikut sekolah.
              </p>
            </div>

            {/* Interactive Studio Controls: Floating RGB Toggle, Auto-Notification Center, Official PDF & Assistant */}
            <div className="flex flex-wrap items-center gap-2 self-start lg:self-end">
              <button
                type="button"
                onClick={() => setRgbAuraEnabled((prev) => !prev)}
                aria-pressed={rgbAuraEnabled}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                  rgbAuraEnabled
                    ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{rgbAuraEnabled ? 'Floating RGB: Aktif' : 'Floating RGB: Mati'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsNotifDrawerOpen((prev) => !prev);
                  setActiveToast(null);
                }}
                data-testid="open-auto-notif-btn"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                <Bell className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Auto-Notifikasi</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  ({unreadCount})
                </span>
              </button>

              <a
                href="/assets/aistudio/ALL_SEREMBAN_BBM_TAHUN_2026_-_251026_2aa0dd60.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Dokumen PDF</span>
              </a>

              <button
                type="button"
                onClick={() =>
                  setChatbotPrompt(
                    'Berikan rumusan eksekutif dan cadangan intervensi utama Baucar Buku PPD Seremban 2027'
                  )
                }
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Ringkasan Pembantu Data
              </button>
            </div>
          </div>

          {/* Expandable Auto-Notification Center Panel */}
          {isNotifDrawerOpen && (
            <div
              role="region"
              aria-label="Pusat Auto-Notifikasi Pintar PPD Seremban"
              data-testid="auto-notification-panel"
              className="animate-fade-in bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-blue-200 dark:border-slate-800 rounded-xl p-5 shadow-md space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Pusat Auto-Notifikasi Pintar &amp; Log E-mel Sijil ({notifications.length})
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Tandakan Semua Dibaca
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNotifDrawerOpen(false)}
                    aria-label="Tutup Panel Auto-Notifikasi"
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
                {notifications.map((item) => {
                  const matchedSchool = item.schoolCode
                    ? SCHOOL_DATA.find((s) => s.kod === item.schoolCode)
                    : undefined;
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-lg border transition-colors flex flex-col justify-between gap-2 ${
                        item.read
                          ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                          : 'bg-blue-50/50 dark:bg-slate-800/90 border-blue-200 dark:border-blue-900/60'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-900 dark:text-slate-100">
                            {item.category === 'kritikal' && (
                              <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
                            )}
                            {item.category === 'email' && (
                              <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                            )}
                            {item.category === 'sijil' && (
                              <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            )}
                            {item.category === 'pencapaian' && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            )}
                            <span>{item.title}</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {item.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {item.message}
                        </p>
                      </div>

                      {matchedSchool && (
                        <div className="pt-1 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSchoolForCert(matchedSchool);
                              const el = document.getElementById('janaan-sijil');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Buka Sijil &amp; E-mel ({matchedSchool.kod}) →
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4-Column Executive KPI Strip with Floating RGB Surface Elevation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rgb-surface-card bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-slate-200 dark:border-slate-800 hover:border-blue-400/70 dark:hover:border-blue-500/60 rounded-xl p-5 transition-colors">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Jumlah Murid Daftar &amp; Tebus
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1.5">
                {summary.jumlahDaftar.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                <span>{summary.kadarPenebusan}% Selesai Tebus</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-500 dark:text-slate-400 font-normal">
                  0 Belum Tebus
                </span>
              </div>
            </div>

            <div className="rgb-surface-card bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-slate-200 dark:border-slate-800 hover:border-emerald-400/70 dark:hover:border-emerald-500/60 rounded-xl p-5 transition-colors">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Baucar Sudah Digunakan
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1.5">
                {summary.jumlahSudahGuna.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mt-2">
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                  {summary.kadarPenggunaan}%
                </span>
                <span aria-hidden="true">·</span>
                <span>daripada keseluruhan baucar ditebus</span>
              </div>
            </div>

            <div className="rgb-surface-card bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-slate-200 dark:border-slate-800 hover:border-red-400/70 dark:hover:border-red-500/60 rounded-xl p-5 transition-colors">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Baki Baucar Belum Guna
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-red-600 dark:text-red-400 mt-1.5">
                {summary.jumlahBelumGuna.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mt-2">
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {summary.sekolahKritikal} sekolah &gt;50 baki
                </span>
                <span aria-hidden="true">·</span>
                <span>Sasaran intervensi segera</span>
              </div>
            </div>

            <div className="rgb-surface-card bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-slate-200 dark:border-slate-800 hover:border-indigo-400/70 dark:hover:border-indigo-500/60 rounded-xl p-5 transition-colors">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Prestasi Selesai 100% (0 Baki)
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400 mt-1.5">
                {summary.sekolahSelesai100} / {summary.jumlahSekolah}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mt-2">
                <span>
                  {summary.jumlahSekolah > 0
                    ? ((summary.sekolahSelesai100 / summary.jumlahSekolah) * 100).toFixed(1)
                    : 0}
                  % institusi
                </span>
                <span aria-hidden="true">·</span>
                <span>Layak Sijil Kecemerlangan</span>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Filter Workspace Toolbar */}
        <section
          aria-label="Penapis Kategori Sekolah, Zon PKG dan Carian"
          className="rgb-surface-card bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 transition-colors"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Tapis Mengikut Kategori Sekolah:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {SCHOOL_CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Input + PKG + Severity Dropdowns */}
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label
                  htmlFor="pkg-select"
                  className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1"
                >
                  Zon PKG
                </label>
                <select
                  id="pkg-select"
                  value={selectedPkg}
                  onChange={(e) => setSelectedPkg(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-blue-600"
                >
                  {PKG_ZONES.map((pkg) => (
                    <option key={pkg} value={pkg}>
                      {pkg === 'Semua' ? 'Semua Zon PKG (5)' : pkg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="status-select"
                  className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1"
                >
                  Tahap Baki Belum Guna
                </label>
                <select
                  id="status-select"
                  value={selectedStatusBand}
                  onChange={(e) => setSelectedStatusBand(e.target.value as SeverityBand | 'Semua')}
                  className="px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-blue-600"
                >
                  {STATUS_BANDS.map((band) => (
                    <option key={band} value={band}>
                      {band === 'Semua' ? 'Semua Tahap Baki' : band}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-[220px] flex-1 sm:flex-initial">
                <label
                  htmlFor="school-search"
                  className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1"
                >
                  Cari Nama / Kod Sekolah
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="school-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cth: SDAR, NEA4111, Seremban..."
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/70 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Tapisan</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Visual Data Charts (Pie Chart & Bar Graph) */}
        <div id="visualisasi-data">
          <ChartsSection
            schools={filteredSchools}
            summary={summary}
            categoryDist={categoryDist}
            pkgDist={pkgDist}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onSelectSchool={setSelectedSchoolModal}
          />
        </div>

        {/* Interactive Strategic Intervention & Decision Simulator */}
        <InterventionPanel
          allSchools={SCHOOL_DATA}
          selectedCategory={selectedCategory}
          onFilterByCategory={setSelectedCategory}
        />

        {/* Automatic School Participation Certificate Generator & Email Dispatch Section */}
        <CertificateGeneratorSection
          schools={filteredSchools.length > 0 ? filteredSchools : SCHOOL_DATA}
          selectedSchoolForCert={selectedSchoolForCert}
          onSelectSchoolForCert={setSelectedSchoolForCert}
          onTriggerNotification={pushAutoNotification}
        />

        {/* Complete 49-School Data Table */}
        <SchoolDataTable
          schools={filteredSchools}
          onSelectSchool={setSelectedSchoolModal}
          onGenerateCertificate={handleJumpToCertificate}
          onResetFilters={resetAllFilters}
        />
      </main>

      {/* Clean Quiet Footer */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs mt-12 py-6 px-4 sm:px-8 transition-colors">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Unit Sumber Teknologi Pendidikan &amp; Pengurusan Baucar Buku Madani · Pejabat Pendidikan Daerah Seremban
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#ringkasan"
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Kembali ke Atas
            </a>
            <span aria-hidden="true">·</span>
            <a
              href="/assets/aistudio/ALL_SEREMBAN_BBM_TAHUN_2026_-_251026_2aa0dd60.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Rujukan Data PDF Rasmi
            </a>
          </div>
        </div>
      </footer>

      {/* Floating Auto-Notification Toast (Bottom-Left, non-overlapping with bottom-right chatbot) */}
      {activeToast && (
        <div
          role="status"
          aria-live="polite"
          data-testid="auto-notification-toast"
          className="fixed bottom-5 left-5 z-40 max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-blue-300 dark:border-blue-800 rounded-xl p-4 shadow-xl animate-fade-in"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                {activeToast.category === 'email' ? (
                  <Mail className="w-4 h-4" />
                ) : activeToast.category === 'kritikal' ? (
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {activeToast.title}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeToast.message}
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotifDrawerOpen(true);
                      setActiveToast(null);
                    }}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Buka Pusat Notifikasi
                  </button>
                  <span className="text-[10px] font-mono text-slate-400">
                    {activeToast.timestamp}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveToast(null)}
              aria-label="Tutup Notifikasi Sementara"
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* School Detail Modal */}
      <SchoolDetailModal
        school={selectedSchoolModal}
        onClose={() => setSelectedSchoolModal(null)}
        onAskChatbot={(q) => setChatbotPrompt(q)}
        onGenerateCertificate={handleJumpToCertificate}
      />

      {/* Floating Quick-Answer Chatbot */}
      <FloatingChatbot
        externalPrompt={chatbotPrompt}
        onClearExternalPrompt={() => setChatbotPrompt(null)}
      />
    </div>
  );
}
