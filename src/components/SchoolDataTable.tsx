import React, { useState } from 'react';
import { SchoolRecord } from '../data/baucarData';
import { getSeverityBand } from '../utils/analytics';
import { ArrowUpDown, Download, Eye, Award } from 'lucide-react';

interface SchoolDataTableProps {
  schools: SchoolRecord[];
  onSelectSchool: (school: SchoolRecord) => void;
  onGenerateCertificate: (school: SchoolRecord) => void;
  onResetFilters: () => void;
}

type SortKey = 'belumGuna' | 'daftar' | 'sudahGuna' | 'nama' | 'kadar';

export const SchoolDataTable: React.FC<SchoolDataTableProps> = ({
  schools,
  onSelectSchool,
  onGenerateCertificate,
  onResetFilters,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>('belumGuna');
  const [sortDesc, setSortDesc] = useState<boolean>(true);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  const sortedSchools = React.useMemo(() => {
    const copy = [...schools];
    copy.sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      if (sortKey === 'nama') {
        valA = a.nama;
        valB = b.nama;
        return sortDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
      }

      if (sortKey === 'kadar') {
        valA = a.daftar > 0 ? a.sudahGuna / a.daftar : 0;
        valB = b.daftar > 0 ? b.sudahGuna / b.daftar : 0;
      } else {
        valA = a[sortKey];
        valB = b[sortKey];
      }

      return sortDesc ? Number(valB) - Number(valA) : Number(valA) - Number(valB);
    });
    return copy;
  }, [schools, sortKey, sortDesc]);

  const totals = React.useMemo(() => {
    return schools.reduce(
      (acc, s) => {
        acc.daftar += s.daftar;
        acc.tebus += s.tebus;
        acc.belumTebus += s.belumTebus;
        acc.sudahGuna += s.sudahGuna;
        acc.belumGuna += s.belumGuna;
        return acc;
      },
      { daftar: 0, tebus: 0, belumTebus: 0, sudahGuna: 0, belumGuna: 0 }
    );
  }, [schools]);

  const handleExportCSV = () => {
    const headers = [
      'PPD',
      'PKG',
      'Kod',
      'Sekolah / Org',
      'Kategori',
      'Daftar',
      'Tebus',
      'Belum Tebus',
      'Sudah Guna',
      'Belum Guna',
      'Kadar Penggunaan (%)',
    ];
    const rows = sortedSchools.map((s) => [
      s.ppd,
      s.pkg,
      s.kod,
      `"${s.nama.replace(/"/g, '""')}"`,
      s.kategori,
      s.daftar,
      s.tebus,
      s.belumTebus,
      s.sudahGuna,
      s.belumGuna,
      ((s.sudahGuna / s.daftar) * 100).toFixed(2),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Analisis_Baucar_Buku_PPD_Seremban_2027.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section
      id="jadual-sekolah"
      aria-label="Jadual Data Penuh Sekolah PPD Seremban"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-colors"
    >
      {/* Table Header Bar */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Jadual Rumusan Baucar Buku Madani Daerah Seremban ({schools.length} Institusi)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Klik pada baris sekolah untuk profil intervensi atau klik butang Jana Sijil untuk sijil penyertaan sekolah
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Muat Turun CSV</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {sortedSchools.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Tiada rekod sekolah sepadan dengan carian atau tapisan semasa.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cuba ubah pilihan Kategori Sekolah, Zon PKG, atau kata kunci carian anda.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-4 px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tetapkan Semula Tapisan
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                <th className="py-3 px-4">Kod &amp; PKG</th>
                <th className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => handleSort('nama')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200"
                  >
                    <span>Sekolah / Institusi</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('daftar')}
                    className="inline-flex items-center justify-end gap-1 hover:text-slate-900 dark:hover:text-slate-200 ml-auto"
                  >
                    <span>Daftar / Tebus</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('sudahGuna')}
                    className="inline-flex items-center justify-end gap-1 hover:text-slate-900 dark:hover:text-slate-200 ml-auto"
                  >
                    <span>Sudah Guna</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('belumGuna')}
                    className="inline-flex items-center justify-end gap-1 hover:text-slate-900 dark:hover:text-slate-200 ml-auto"
                  >
                    <span>Belum Guna</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('kadar')}
                    className="inline-flex items-center justify-end gap-1 hover:text-slate-900 dark:hover:text-slate-200 ml-auto"
                  >
                    <span>Kadar Guna</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Status Baki</th>
                <th className="py-3 px-4 text-right">Sijil Sekolah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-xs">
              {sortedSchools.map((s) => {
                const kadar = ((s.sudahGuna / s.daftar) * 100).toFixed(2);
                const band = getSeverityBand(s.belumGuna);
                const statusColor =
                  s.belumGuna > 100
                    ? 'text-red-600 dark:text-red-400 font-semibold'
                    : s.belumGuna > 50
                    ? 'text-amber-600 dark:text-amber-400 font-semibold'
                    : s.belumGuna > 0
                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-emerald-600 dark:text-emerald-400 font-medium';

                return (
                  <tr
                    key={s.kod}
                    onClick={() => onSelectSchool(s)}
                    className="group hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {s.kod}
                      </span>{' '}
                      <span className="text-slate-400 mx-1" aria-hidden="true">
                        ·
                      </span>{' '}
                      <span className="text-slate-500 dark:text-slate-400">{s.pkg}</span>
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-slate-100">
                      <div className="flex items-center justify-between gap-2">
                        <span>{s.nama}</span>
                        <Eye className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 shrink-0" />
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {s.kategori}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {s.daftar.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-emerald-700 dark:text-emerald-400 font-medium">
                      {s.sudahGuna.toLocaleString()}
                    </td>
                    <td className={`py-2.5 px-4 text-right font-mono tabular-nums ${statusColor}`}>
                      {s.belumGuna.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {kadar}%
                    </td>
                    <td className={`py-2.5 px-4 whitespace-nowrap ${statusColor}`}>{band}</td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onGenerateCertificate(s);
                        }}
                        aria-label={`Jana Sijil untuk ${s.nama}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-md transition-colors whitespace-nowrap shrink-0"
                      >
                        <Award className="w-3 h-3" />
                        <span>Jana Sijil</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                <td colSpan={3} className="py-3 px-4 font-sans">
                  JUMLAH KESELURUHAN ({sortedSchools.length} Sekolah Dipaparkan)
                </td>
                <td className="py-3 px-4 text-right tabular-nums">
                  {totals.daftar.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right tabular-nums text-emerald-700 dark:text-emerald-400">
                  {totals.sudahGuna.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right tabular-nums text-red-600 dark:text-red-400">
                  {totals.belumGuna.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right tabular-nums">
                  {totals.daftar > 0
                    ? ((totals.sudahGuna / totals.daftar) * 100).toFixed(2)
                    : '0.00'}
                  %
                </td>
                <td colSpan={2} className="py-3 px-4 font-sans text-slate-600 dark:text-slate-400">
                  0 Belum Tebus
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
};
