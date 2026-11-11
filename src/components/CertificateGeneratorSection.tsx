import React, { useState, useEffect, useRef } from 'react';
import { SchoolRecord } from '../data/baucarData';
import {
  CertificateConfig,
  CertificateEmailPayload,
  DEFAULT_CERTIFICATE_CONFIG,
  GeneratedCertificatePayload,
  buildCertificateEmailPayload,
  buildCertificatePayload,
  validateEmailAddress,
} from '../utils/certificate';
import {
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Award,
  RotateCcw,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export interface NotificationTriggerPayload {
  title: string;
  message: string;
  category: 'email' | 'sijil' | 'kritikal' | 'pencapaian';
  schoolCode?: string;
}

interface CertificateGeneratorSectionProps {
  schools: SchoolRecord[];
  selectedSchoolForCert: SchoolRecord | null;
  onSelectSchoolForCert: (school: SchoolRecord) => void;
  onTriggerNotification?: (notif: NotificationTriggerPayload) => void;
}

const TEMPLATE_IMAGE_URL = '/assets/aistudio/1_9ddfb55b.webp';
const DEFAULT_EXAMPLE_EMAIL = 'syazwansamsol@gmail.com';

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let y = startY;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, y);
  return y + lineHeight;
}

export const CertificateGeneratorSection: React.FC<CertificateGeneratorSectionProps> = ({
  schools,
  selectedSchoolForCert,
  onSelectSchoolForCert,
  onTriggerNotification,
}) => {
  const [config, setConfig] = useState<CertificateConfig>(DEFAULT_CERTIFICATE_CONFIG);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [recipientEmail, setRecipientEmail] = useState<string>(DEFAULT_EXAMPLE_EMAIL);
  const [catatanTambahan, setCatatanTambahan] = useState<string>(
    'Tahniah atas komitmen pihak sekolah dalam pelaksanaan Program Baucar Buku Madani PPD Seremban 2027.'
  );
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [sentEmailLogs, setSentEmailLogs] = useState<
    (CertificateEmailPayload & { id: string })[]
  >([]);

  const templateImgRef = useRef<HTMLImageElement | null>(null);

  const activeSchool: SchoolRecord = selectedSchoolForCert || schools[0];
  const currentIndex = schools.findIndex((s) => s.kod === activeSchool?.kod);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = TEMPLATE_IMAGE_URL;
    img.onload = () => {
      templateImgRef.current = img;
    };
  }, []);

  if (!activeSchool) return null;

  const payload: GeneratedCertificatePayload = buildCertificatePayload(activeSchool, config);

  const handlePrevSchool = () => {
    if (schools.length === 0) return;
    const prevIdx = currentIndex <= 0 ? schools.length - 1 : currentIndex - 1;
    onSelectSchoolForCert(schools[prevIdx]);
    setEmailSuccessMsg(null);
  };

  const handleNextSchool = () => {
    if (schools.length === 0) return;
    const nextIdx = currentIndex >= schools.length - 1 ? 0 : currentIndex + 1;
    onSelectSchoolForCert(schools[nextIdx]);
    setEmailSuccessMsg(null);
  };

  const handleResetConfig = () => {
    setConfig(DEFAULT_CERTIFICATE_CONFIG);
  };

  // High-resolution PNG export onto HTML5 Canvas matching the exact certificate template
  const handleDownloadPNG = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const width = 1200;
      const height = 1600;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Draw base template image if loaded
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      if (templateImgRef.current) {
        ctx.drawImage(templateImgRef.current, 0, 0, width, height);
        // Cleanly mask the inner text area while preserving the ornate blue border, top emblem, signature & red seal
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(150, 345, 900, 845);
        ctx.fillRect(230, 1255, 520, 115);
      } else {
        ctx.strokeStyle = '#0D4F8B';
        ctx.lineWidth = 12;
        ctx.strokeRect(60, 60, width - 120, height - 120);
      }

      ctx.textAlign = 'center';

      // Serial Number top-right inside frame
      ctx.fillStyle = '#475569';
      ctx.font = '600 18px "JetBrains Mono", monospace';
      ctx.fillText(`NO. SIRI: ${payload.noSiri}`, 600, 372);

      // Organization Header Line 1 & 2
      ctx.fillStyle = '#0F172A';
      ctx.font = '800 34px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(payload.config.headerBaris1.toUpperCase(), 600, 420);
      ctx.font = '800 32px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(payload.config.headerBaris2.toUpperCase(), 600, 464);

      // SIJIL PENYERTAAN (Engraved serif look)
      ctx.fillStyle = '#0F172A';
      ctx.font = '700 44px "Cinzel Decorative", Georgia, serif';
      ctx.fillText(payload.config.tajukSijil.toUpperCase(), 600, 535);

      // SETINGGI-TINGGI PENGHARGAAN DAN TERIMA KASIH KEPADA
      ctx.fillStyle = '#1E293B';
      ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('SETINGGI-TINGGI PENGHARGAAN DAN TERIMA KASIH KEPADA', 600, 590);

      // Recipient School Name + Code
      ctx.fillStyle = '#0D4F8B';
      ctx.font = '800 33px "Plus Jakarta Sans", sans-serif';
      const nextYAfterSchool = wrapCanvasText(
        ctx,
        payload.penerimaBarisUtama.toUpperCase(),
        600,
        650,
        840,
        42
      );

      // Recipient PKG & Category
      ctx.fillStyle = '#334155';
      ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(payload.penerimaSubBaris, 600, nextYAfterSchool + 4);

      // TELAH MENYERTAI
      ctx.fillStyle = '#1E293B';
      ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('TELAH MENYERTAI', 600, 755);

      // Program Name
      ctx.fillStyle = '#0F172A';
      ctx.font = '800 27px "Plus Jakarta Sans", sans-serif';
      const nextYAfterProg = wrapCanvasText(
        ctx,
        payload.namaProgramLengkap.toUpperCase(),
        600,
        800,
        840,
        36
      );

      // Voucher Achievement Stat Line
      ctx.fillStyle = activeSchool.belumGuna === 0 ? '#15803D' : '#0D4F8B';
      ctx.font = '700 19px "JetBrains Mono", monospace';
      ctx.fillText(payload.pencapaianRingkas, 600, nextYAfterProg + 6);

      // BERTEMPAT DI
      ctx.fillStyle = '#1E293B';
      ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('BERTEMPAT DI', 600, 910);

      ctx.fillStyle = '#0F172A';
      ctx.font = '800 26px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(payload.config.tempat.toUpperCase(), 600, 950);

      // ANJURAN
      ctx.fillStyle = '#1E293B';
      ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('ANJURAN', 600, 1005);

      ctx.fillStyle = '#0F172A';
      ctx.font = '800 26px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(payload.config.anjuran.toUpperCase(), 600, 1045);

      // PADA
      ctx.fillStyle = '#1E293B';
      ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('PADA', 600, 1095);

      ctx.fillStyle = '#0F172A';
      ctx.font = '800 28px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(payload.config.tarikh.toUpperCase(), 600, 1135);

      // Signatory Name & Role (Left aligned under signature)
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0F172A';
      ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(payload.config.namaPenandatangan.toUpperCase(), 276, 1285);
      ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(payload.config.jawatanPenandatangan.toUpperCase(), 276, 1322);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Sijil_Penyertaan_${activeSchool.kod}_${activeSchool.nama.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (onTriggerNotification) {
        onTriggerNotification({
          title: `Sijil PNG Dijana (${activeSchool.kod})`,
          message: `Sijil Penyertaan rasmi untuk ${activeSchool.nama} (${payload.noSiri}) telah berjaya dimuat turun.`,
          category: 'sijil',
          schoolCode: activeSchool.kod,
        });
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // Dedicated Print view for clean PDF/paper certificate output
  const handlePrintCertificate = () => {
    window.print();
  };

  // Send Certificate via Email (API + Auto-Notification + Audit Log)
  const handleSendCertificateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccessMsg(null);

    if (!validateEmailAddress(recipientEmail)) {
      setEmailError(
        'Sila masukkan alamat e-mel penerima yang sah (contoh: syazwansamsol@gmail.com).'
      );
      return;
    }

    setIsSendingEmail(true);
    try {
      const emailPayload = buildCertificateEmailPayload(
        activeSchool,
        recipientEmail,
        config,
        catatanTambahan
      );

      const res = await fetch('/api/send-certificate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        setEmailError(data.error || 'Gagal menghantar e-mel sijil.');
        return;
      }

      const logItem = {
        ...emailPayload,
        id: data.record?.id || `EML-${Date.now()}`,
      };

      setSentEmailLogs((prev) => [logItem, ...prev]);
      setEmailSuccessMsg(
        `Sijil Penyertaan ${activeSchool.nama} (${emailPayload.noSiri}) berjaya dihantar ke ${emailPayload.recipientEmail}.`
      );

      if (onTriggerNotification) {
        onTriggerNotification({
          title: `E-mel Sijil Dihantar: ${activeSchool.kod}`,
          message: `Sijil Penyertaan ${activeSchool.nama} (${emailPayload.noSiri}) telah dihantar secara automatik ke ${emailPayload.recipientEmail}.`,
          category: 'email',
          schoolCode: activeSchool.kod,
        });
      }
    } catch {
      setEmailError('Ralat rangkaian semasa menghantar e-mel sijil. Sila cuba lagi.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Direct Mailto launch with pre-filled official certificate details
  const handleOpenMailtoClient = () => {
    setEmailError(null);
    if (!validateEmailAddress(recipientEmail)) {
      setEmailError(
        'Sila masukkan alamat e-mel penerima yang sah terlebih dahulu (contoh: syazwansamsol@gmail.com).'
      );
      return;
    }

    const emailPayload = buildCertificateEmailPayload(
      activeSchool,
      recipientEmail,
      config,
      catatanTambahan
    );

    const mailtoHref = `mailto:${encodeURIComponent(
      emailPayload.recipientEmail
    )}?subject=${encodeURIComponent(emailPayload.subject)}&body=${encodeURIComponent(
      emailPayload.bodyText
    )}`;

    const a = document.createElement('a');
    a.href = mailtoHref;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (onTriggerNotification) {
      onTriggerNotification({
        title: `Draf Klien E-mel Dibuka (${activeSchool.kod})`,
        message: `Draf e-mel rasmi Sijil Penyertaan ${activeSchool.nama} untuk ${emailPayload.recipientEmail} telah disediakan.`,
        category: 'email',
        schoolCode: activeSchool.kod,
      });
    }
  };

  return (
    <section
      id="janaan-sijil"
      aria-label="Janaan Sijil Penyertaan Automatik dan Penghantaran E-mel Mengikut Sekolah"
      className="scroll-mt-20 rgb-surface-card bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors"
    >
      {/* Top Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
            <Award className="w-3.5 h-3.5" />
            <span>Automasi Sijil Rasmi &amp; Penghantaran E-mel Terus Mengikut Sekolah</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            Janaan &amp; E-mel Sijil Penyertaan Automatik ({schools.length} Institusi)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            Pilih sekolah untuk menjana Sijil Penyertaan rasmi secara automatik dan hantar terus ke
            alamat e-mel penyelaras atau penerima (contoh:{' '}
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
              syazwansamsol@gmail.com
            </span>
            ) berserta auto-notifikasi masa nyata.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start">
          <button
            type="button"
            onClick={handleDownloadPNG}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? 'Menjana Sijil...' : 'Muat Turun Sijil (PNG)'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrintCertificate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Workspace: Controls + Email Dispatch on Left (5 cols), Live Certificate Preview on Right (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 items-start">
        {/* Left Column: School Selector, Email Dispatcher & Customizer */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. School Selection Card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="cert-school-select"
                className="text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                1. Pilih Sekolah Penerima Sijil ({currentIndex + 1} / {schools.length})
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevSchool}
                  aria-label="Sekolah Sebelumnya"
                  className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextSchool}
                  aria-label="Sekolah Seterusnya"
                  className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <select
              id="cert-school-select"
              value={activeSchool.kod}
              onChange={(e) => {
                const found = schools.find((s) => s.kod === e.target.value);
                if (found) {
                  onSelectSchoolForCert(found);
                  setEmailSuccessMsg(null);
                }
              }}
              className="w-full px-3 py-2.5 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-blue-600"
            >
              {schools.map((s) => (
                <option key={s.kod} value={s.kod}>
                  {s.kod} — {s.nama} ({((s.sudahGuna / s.daftar) * 100).toFixed(1)}% Guna)
                </option>
              ))}
            </select>

            {/* Quick School Summary Metadata */}
            <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/70 grid grid-cols-3 gap-2 text-center font-mono">
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <div className="text-[10px] font-sans text-slate-500 dark:text-slate-400">
                  Daftar &amp; Tebus
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {activeSchool.daftar.toLocaleString()}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <div className="text-[10px] font-sans text-slate-500 dark:text-slate-400">
                  Sudah Guna
                </div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {activeSchool.sudahGuna.toLocaleString()}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <div className="text-[10px] font-sans text-slate-500 dark:text-slate-400">
                  Kadar Guna
                </div>
                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                  {payload.kadarPenggunaan}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Send Participation Certificate by Email Card */}
          <form
            onSubmit={handleSendCertificateEmail}
            noValidate
            className="p-4 bg-blue-50/50 dark:bg-slate-800/80 border border-blue-200/80 dark:border-slate-700 rounded-xl space-y-3.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  2. Hantar E-mel Sijil Penyertaan Mengikut Sekolah
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRecipientEmail(DEFAULT_EXAMPLE_EMAIL);
                  setEmailError(null);
                }}
                className="text-[11px] font-mono font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Guna: {DEFAULT_EXAMPLE_EMAIL}
              </button>
            </div>

            <div>
              <label
                htmlFor="cert-recipient-email"
                className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Alamat E-mel Penerima / Penyelaras Sekolah
              </label>
              <input
                id="cert-recipient-email"
                type="email"
                value={recipientEmail}
                onChange={(e) => {
                  setRecipientEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                placeholder="Contoh: syazwansamsol@gmail.com"
                className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div>
              <label
                htmlFor="cert-email-note"
                className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Catatan Rasmi E-mel (Pilihan)
              </label>
              <input
                id="cert-email-note"
                type="text"
                value={catatanTambahan}
                onChange={(e) => setCatatanTambahan(e.target.value)}
                placeholder="Masukkan mesej iringan untuk sekolah..."
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            {emailError && (
              <div
                role="alert"
                className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                <span>{emailError}</span>
              </div>
            )}

            {emailSuccessMsg && (
              <div
                role="status"
                data-testid="email-success-banner"
                className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <span>{emailSuccessMsg}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={isSendingEmail}
                data-testid="send-cert-email-btn"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {isSendingEmail
                    ? 'Menghantar Sijil...'
                    : `Hantar Sijil (${activeSchool.kod}) ke E-mel`}
                </span>
              </button>

              <button
                type="button"
                onClick={handleOpenMailtoClient}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Klien E-mel</span>
              </button>
            </div>

            {/* Sent Email History Log */}
            {sentEmailLogs.length > 0 && (
              <div className="pt-3 border-t border-blue-200/60 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  <span>Rekod Penghantaran E-mel Sijil ({sentEmailLogs.length})</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    Auto-Notifikasi Aktif
                  </span>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                  {sentEmailLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 text-[11px]"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {log.kodSekolah} — {log.namaSekolah}
                        </div>
                        <div className="font-mono text-slate-500 dark:text-slate-400 truncate">
                          Kepada: {log.recipientEmail} · Siri: {log.noSiri}
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 shrink-0">
                        Dihantar {log.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>

          {/* 3. Certificate Content Customization Form */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                3. Tetapan Butiran Templat Sijil
              </h3>
              <button
                type="button"
                onClick={handleResetConfig}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Tetapan Asal</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="cert-header-1"
                  className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1"
                >
                  Tajuk Institusi (Baris 1)
                </label>
                <input
                  id="cert-header-1"
                  type="text"
                  value={config.headerBaris1}
                  onChange={(e) => setConfig({ ...config, headerBaris1: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label
                  htmlFor="cert-header-2"
                  className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1"
                >
                  Sub-Tajuk Institusi (Baris 2)
                </label>
                <input
                  id="cert-header-2"
                  type="text"
                  value={config.headerBaris2}
                  onChange={(e) => setConfig({ ...config, headerBaris2: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="cert-program"
                className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1"
              >
                Nama Program / Penyertaan
              </label>
              <input
                id="cert-program"
                type="text"
                value={config.namaProgram}
                onChange={(e) => setConfig({ ...config, namaProgram: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="cert-tempat"
                  className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1"
                >
                  Bertempat Di
                </label>
                <input
                  id="cert-tempat"
                  type="text"
                  value={config.tempat}
                  onChange={(e) => setConfig({ ...config, tempat: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label
                  htmlFor="cert-anjuran"
                  className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1"
                >
                  Anjuran
                </label>
                <input
                  id="cert-anjuran"
                  type="text"
                  value={config.anjuran}
                  onChange={(e) => setConfig({ ...config, anjuran: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor="cert-tarikh"
                  className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1"
                >
                  Tarikh Pelaksanaan
                </label>
                <input
                  id="cert-tarikh"
                  type="text"
                  value={config.tarikh}
                  onChange={(e) => setConfig({ ...config, tarikh: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label
                  htmlFor="cert-sign-name"
                  className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1"
                >
                  Nama Penandatangan
                </label>
                <input
                  id="cert-sign-name"
                  type="text"
                  value={config.namaPenandatangan}
                  onChange={(e) => setConfig({ ...config, namaPenandatangan: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label
                  htmlFor="cert-sign-role"
                  className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1"
                >
                  Jawatan
                </label>
                <input
                  id="cert-sign-role"
                  type="text"
                  value={config.jawatanPenandatangan}
                  onChange={(e) => setConfig({ ...config, jawatanPenandatangan: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live High-Fidelity Certificate Preview matching attached template */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-[620px] bg-slate-100 dark:bg-slate-800/80 p-3 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700">
            {/* Certificate Aspect Ratio Container (3:4 vertical matching the uploaded template) */}
            <div
              id="printable-certificate"
              data-testid="certificate-preview-card"
              className="relative w-full aspect-[3/4] bg-white text-slate-900 shadow-lg overflow-hidden select-none"
            >
              {/* Underlying Attached Certificate Template Image */}
              <img
                src={TEMPLATE_IMAGE_URL}
                alt="Templat Sijil Penyertaan"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-fill pointer-events-none"
              />

              {/* Clean White Mask over the original static text zones so dynamic school text renders crisply while preserving the floral blue borders, top IPG logo, signature graphic, and red serrated seal */}
              <div
                className="absolute bg-white"
                style={{
                  top: '21.5%',
                  left: '12.5%',
                  width: '75%',
                  height: '52.8%',
                }}
              />
              {/* Mask over static signatory name & role under the signature graphic */}
              <div
                className="absolute bg-white"
                style={{
                  top: '78.4%',
                  left: '19%',
                  width: '44%',
                  height: '7.5%',
                }}
              />

              {/* Dynamic Certificate Text Overlay positioned to match the template layout */}
              <div
                className="absolute inset-x-[11%] flex flex-col items-center text-center"
                style={{ top: '21.8%', height: '48%' }}
              >
                {/* Serial Number */}
                <div className="text-[9px] sm:text-[10px] font-mono font-semibold text-slate-500 tracking-wider">
                  NO. SIRI: {payload.noSiri}
                </div>

                {/* Institution Header Lines 1 & 2 */}
                <div className="mt-1 text-xs sm:text-base md:text-lg font-extrabold tracking-tight text-slate-950 uppercase leading-tight">
                  {payload.config.headerBaris1}
                </div>
                <div className="text-[11px] sm:text-sm md:text-base font-extrabold tracking-tight text-slate-950 uppercase leading-tight">
                  {payload.config.headerBaris2}
                </div>

                {/* SIJIL PENYERTAAN (Engraved Serif Display matching template) */}
                <div
                  className="mt-2 sm:mt-3 text-base sm:text-xl md:text-2xl font-bold tracking-widest text-slate-900 uppercase"
                  style={{
                    fontFamily: '"Cinzel Decorative", Georgia, serif',
                    textShadow: '1px 1px 0px rgba(13, 79, 139, 0.18)',
                  }}
                >
                  {payload.config.tajukSijil}
                </div>

                {/* Appreciation Line */}
                <div className="mt-1.5 sm:mt-2 text-[9px] sm:text-[11px] font-medium text-slate-800 tracking-wide uppercase">
                  SETINGGI-TINGGI PENGHARGAAN DAN TERIMA KASIH KEPADA
                </div>

                {/* Dynamic School Name & Code */}
                <div className="mt-2 sm:mt-3 px-2 py-1 bg-blue-50/70 border-y border-blue-900/15 w-full">
                  <div className="text-xs sm:text-base md:text-[17px] font-extrabold text-[#0D4F8B] uppercase leading-snug">
                    {payload.penerimaBarisUtama}
                  </div>
                  <div className="text-[8px] sm:text-[10px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">
                    {payload.penerimaSubBaris}
                  </div>
                </div>

                {/* TELAH MENYERTAI */}
                <div className="mt-2 sm:mt-3 text-[9px] sm:text-[11px] font-medium text-slate-800 uppercase">
                  TELAH MENYERTAI
                </div>

                {/* Program Title & School Achievement Data */}
                <div className="mt-1 text-[10px] sm:text-xs md:text-sm font-extrabold text-slate-950 uppercase leading-snug max-w-[95%]">
                  {payload.namaProgramLengkap}
                </div>
                <div
                  className={`mt-1 text-[8px] sm:text-[10px] font-mono font-bold uppercase ${
                    activeSchool.belumGuna === 0 ? 'text-emerald-700' : 'text-blue-800'
                  }`}
                >
                  {payload.pencapaianRingkas}
                </div>

                {/* BERTEMPAT DI */}
                <div className="mt-2 sm:mt-2.5 text-[9px] sm:text-[11px] font-medium text-slate-800 uppercase">
                  BERTEMPAT DI
                </div>
                <div className="text-[10px] sm:text-xs md:text-[13px] font-extrabold text-slate-950 uppercase leading-tight">
                  {payload.config.tempat}
                </div>

                {/* ANJURAN */}
                <div className="mt-1.5 sm:mt-2 text-[9px] sm:text-[11px] font-medium text-slate-800 uppercase">
                  ANJURAN
                </div>
                <div className="text-[10px] sm:text-xs md:text-[13px] font-extrabold text-slate-950 uppercase leading-tight">
                  {payload.config.anjuran}
                </div>

                {/* PADA */}
                <div className="mt-1.5 sm:mt-2 text-[9px] sm:text-[11px] font-medium text-slate-800 uppercase">
                  PADA
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm font-extrabold text-slate-950 uppercase leading-tight">
                  {payload.config.tarikh}
                </div>
              </div>

              {/* Dynamic Signatory Name & Title aligned under the template's signature graphic */}
              <div
                className="absolute text-left"
                style={{
                  top: '78.6%',
                  left: '23%',
                  width: '43%',
                }}
              >
                <div className="text-[9px] sm:text-[11px] font-bold text-slate-950 uppercase leading-tight truncate">
                  {payload.config.namaPenandatangan}
                </div>
                <div className="text-[8px] sm:text-[10px] font-bold text-slate-800 uppercase leading-tight mt-0.5 truncate">
                  {payload.config.jawatanPenandatangan}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
