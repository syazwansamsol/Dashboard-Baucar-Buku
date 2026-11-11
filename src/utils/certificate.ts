import { SchoolRecord } from '../data/baucarData';
import { getSeverityBand } from './analytics';

export interface CertificateConfig {
  headerBaris1: string;
  headerBaris2: string;
  tajukSijil: string;
  namaProgram: string;
  tempat: string;
  anjuran: string;
  tarikh: string;
  namaPenandatangan: string;
  jawatanPenandatangan: string;
  modLatar: 'templatAsal' | 'bingkaiVektor';
}

export interface GeneratedCertificatePayload {
  noSiri: string;
  kodSekolah: string;
  namaSekolah: string;
  pkg: string;
  kategori: string;
  penerimaBarisUtama: string;
  penerimaSubBaris: string;
  namaProgramLengkap: string;
  pencapaianRingkas: string;
  kadarPenggunaan: string;
  statusSijil: 'Sijil Penyertaan & Kecemerlangan (100%)' | 'Sijil Penyertaan';
  config: CertificateConfig;
}

export const DEFAULT_CERTIFICATE_CONFIG: CertificateConfig = {
  headerBaris1: 'PEJABAT PENDIDIKAN DAERAH SEREMBAN',
  headerBaris2: 'JABATAN PENDIDIKAN NEGERI SEMBILAN',
  tajukSijil: 'SIJIL PENYERTAAN',
  namaProgram: 'PROGRAM PENEBUSAN & PENGGUNAAN BAUCAR BUKU MADANI TAHUN 2027',
  tempat: 'PEJABAT PENDIDIKAN DAERAH SEREMBAN',
  anjuran: 'UNIT SUMBER TEKNOLOGI PENDIDIKAN, PPD SEREMBAN',
  tarikh: '10 NOVEMBER 2026 HINGGA 31 JANUARI 2027',
  namaPenandatangan: 'MUHAMMAD MUQRI BIN HARIS',
  jawatanPenandatangan: 'PEGAWAI PENDIDIKAN DAERAH',
  modLatar: 'templatAsal',
};

export function buildCertificatePayload(
  school: SchoolRecord,
  customConfig?: Partial<CertificateConfig>
): GeneratedCertificatePayload {
  const config: CertificateConfig = {
    ...DEFAULT_CERTIFICATE_CONFIG,
    ...customConfig,
  };

  const kadar =
    school.daftar > 0 ? ((school.sudahGuna / school.daftar) * 100).toFixed(2) : '0.00';
  const isFull100 = school.belumGuna === 0;
  const band = getSeverityBand(school.belumGuna);

  const noSiri = `PPDS/BBM/2027/${school.kod}`;
  const penerimaBarisUtama = `${school.nama} (${school.kod})`;
  const penerimaSubBaris = `${school.pkg} · KATEGORI ${school.kategori.toUpperCase()}`;

  const pencapaianRingkas = isFull100
    ? `MENCAPAI 100% PENGGUNAAN PENUH (${school.sudahGuna.toLocaleString()} / ${school.daftar.toLocaleString()} BAUCAR)`
    : `PENYERTAAN AKTIF: ${school.sudahGuna.toLocaleString()} / ${school.daftar.toLocaleString()} BAUCAR DIGUNAKAN (${kadar}% · ${band.toUpperCase()})`;

  return {
    noSiri,
    kodSekolah: school.kod,
    namaSekolah: school.nama,
    pkg: school.pkg,
    kategori: school.kategori,
    penerimaBarisUtama,
    penerimaSubBaris,
    namaProgramLengkap: config.namaProgram,
    pencapaianRingkas,
    kadarPenggunaan: `${kadar}%`,
    statusSijil: isFull100
      ? 'Sijil Penyertaan & Kecemerlangan (100%)'
      : 'Sijil Penyertaan',
    config,
  };
}

export interface CertificateEmailPayload {
  recipientEmail: string;
  ccEmail?: string;
  subject: string;
  bodyText: string;
  noSiri: string;
  kodSekolah: string;
  namaSekolah: string;
  kadarPenggunaan: string;
  statusSijil: string;
  timestamp: string;
}

export function validateEmailAddress(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function buildCertificateEmailPayload(
  school: SchoolRecord,
  recipientEmail: string,
  customConfig?: Partial<CertificateConfig>,
  catatanTambahan?: string
): CertificateEmailPayload {
  const cert = buildCertificatePayload(school, customConfig);
  const cleanEmail = recipientEmail.trim();

  const subject = `[SIJIL PENYERTAAN BBM 2027] ${school.nama} (${school.kod}) - No. Siri: ${cert.noSiri}`;
  const bodyLines = [
    `Assalamualaikum dan Salam Malaysia Madani,`,
    ``,
    `Tuan/Puan Pengetua / Penyelaras Baucar Buku Madani,`,
    `${school.nama} (${school.kod})`,
    `Zon ${school.pkg} · Kategori ${school.kategori}`,
    ``,
    `Sukacita dimaklumkan bahawa pihak Pejabat Pendidikan Daerah Seremban melampirkan Sijil Penyertaan Rasmi bagi:`,
    `• Program: ${cert.namaProgramLengkap}`,
    `• No. Siri Sijil: ${cert.noSiri}`,
    `• Status Sijil: ${cert.statusSijil}`,
    `• Rekod Pencapaian Semasa: ${school.sudahGuna.toLocaleString()} / ${school.daftar.toLocaleString()} baucar digunakan (${cert.kadarPenggunaan})`,
    `• Baki Belum Guna: ${school.belumGuna.toLocaleString()} baucar`,
    ...(catatanTambahan && catatanTambahan.trim()
      ? [``, `Catatan Pengurusan PPD Seremban:`, `${catatanTambahan.trim()}`]
      : []),
    ``,
    `Sekian, terima kasih.`,
    `Unit Sumber Teknologi Pendidikan & Pengurusan Baucar Buku Madani`,
    `Pejabat Pendidikan Daerah Seremban`,
  ];

  return {
    recipientEmail: cleanEmail,
    subject,
    bodyText: bodyLines.join('\n'),
    noSiri: cert.noSiri,
    kodSekolah: school.kod,
    namaSekolah: school.nama,
    kadarPenggunaan: cert.kadarPenggunaan,
    statusSijil: cert.statusSijil,
    timestamp: new Date().toLocaleTimeString('ms-MY', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };
}
