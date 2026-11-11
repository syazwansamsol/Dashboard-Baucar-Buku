import React from 'react';
import { SchoolRecord } from '../data/baucarData';
import { getSeverityBand } from '../utils/analytics';
import { X, MessageSquare, CheckCircle2, Award } from 'lucide-react';

interface SchoolDetailModalProps {
  school: SchoolRecord | null;
  onClose: () => void;
  onAskChatbot: (question: string) => void;
  onGenerateCertificate: (school: SchoolRecord) => void;
}

export const SchoolDetailModal: React.FC<SchoolDetailModalProps> = ({
  school,
  onClose,
  onAskChatbot,
  onGenerateCertificate,
}) => {
  if (!school) return null;

  const kadar = ((school.sudahGuna / school.daftar) * 100).toFixed(2);
  const band = getSeverityBand(school.belumGuna);

  const recommendedActions =
    school.belumGuna > 100
      ? [
          'Laksanakan sesi penebusan dan checkout berkelompok di makmal komputer sekolah/asrama bersama Guru Penyelaras BBM.',
          'Sediakan pakej buku rujukan akademik terpiawai mengikut aliran untuk mempercepatkan pemilihan oleh murid.',
          'Laporan harian kemajuan penyelesaian baucar kepada Pegawai Angkat PPD Seremban.',
        ]
      : school.belumGuna > 50
      ? [
          'Aktifkan Kaunter Bantuan DELIMa di Pusat Sumber Sekolah pada waktu rehat dan selepas sesi persekolahan.',
          'Edarkan hebahan peringatan berfokus melalui kumpulan WhatsApp rasmi ibu bapa / penjaga mengikut tingkatan.',
          'Semak senarai nama murid belum guna bersama Guru Tingkatan setiap pagi.',
        ]
      : school.belumGuna > 0
      ? [
          'Serahkan senarai nama individu murid berbaki kepada PK Hal Ehwal Murid (PK HEM) untuk bimbingan 1-ke-1.',
          'Bantu murid menyelesaikan transaksi pemilihan buku dalam tempoh 3 hari bekerja.',
        ]
      : [
          'Tahniah! Sekolah ini telah mencapai 100% penggunaan Baucar Buku Madani (0 Belum Guna).',
          'Kekalkan rekod dokumentasi dan kongsikan amalan terbaik bersama sekolah dalam zon PKG yang sama.',
        ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-school-title"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span>{school.kod}</span>
              <span aria-hidden="true">·</span>
              <span>{school.pkg}</span>
              <span aria-hidden="true">·</span>
              <span className="font-sans">{school.kategori}</span>
            </div>
            <h3
              id="modal-school-title"
              className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1"
            >
              {school.nama}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup tetingkap"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Daftar &amp; Tebus</div>
            <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
              {school.daftar.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400">100% Ditebus</div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Sudah Guna</div>
            <div className="text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
              {school.sudahGuna.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Baucar selesai</div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Belum Guna</div>
            <div
              className={`text-lg font-bold font-mono tabular-nums mt-0.5 ${
                school.belumGuna > 50
                  ? 'text-red-600 dark:text-red-400'
                  : school.belumGuna > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {school.belumGuna.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">{band}</div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Kadar Guna</div>
            <div className="text-lg font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400 mt-0.5">
              {kadar}%
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Selesai guna</div>
          </div>
        </div>

        {/* Specific Intervention Recommendations */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Cadangan Tindakan Intervensi Khusus Sekolah:
          </h4>
          <ul className="space-y-2">
            {recommendedActions.map((act, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onGenerateCertificate(school);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Jana Sijil Penyertaan Sekolah</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const q = `Berikan analisis dan pelan intervensi untuk ${school.nama} (${school.kod})`;
              onClose();
              onAskChatbot(q);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Tanya Pembantu Data</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
