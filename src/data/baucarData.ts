export type SchoolCategory =
  | 'SMK Harian'
  | 'SBP & Sains'
  | 'SM Agama'
  | 'TVET & Vokasional'
  | 'Kolej Tingkatan Enam';

export type PKGZone = 'PKG AMPANGAN' | 'PKG MAMBAU' | 'PKG RANTAU' | 'PKG NILAI' | 'PKG MANTIN';

export type SeverityBand = 'Kritikal (>100)' | 'Sederhana (51-100)' | 'Rendah (11-50)' | 'Terkawal (1-10)' | 'Selesai (0)';

export interface SchoolRecord {
  ppd: string;
  pkg: 'PKG AMPANGAN' | 'PKG MAMBAU' | 'PKG RANTAU' | 'PKG NILAI' | 'PKG MANTIN';
  kod: string;
  nama: string;
  daftar: number;
  tebus: number;
  belumTebus: number;
  sudahGuna: number;
  belumGuna: number;
  kategori: SchoolCategory;
}

export interface InterventionAction {
  id: string;
  tajuk: string;
  sasaran: string;
  kategoriSasaran: SchoolCategory | 'Semua';
  tahapKeutamaan: 'Tinggi' | 'Sederhana' | 'Pemantauan';
  huraianStrategik: string;
  langkahTindakan: string[];
  unjuranImpakBaucar: number;
  tempohPelaksanaan: string;
  indikatorKejayaan: string;
}

export const RAW_SCHOOL_DATA: Omit<SchoolRecord, 'kategori'>[] = [
  { ppd: 'PPD SEREMBAN', pkg: 'PKG RANTAU', kod: 'NEB4137', nama: 'SM DATUK ABDUL RAZAK', daftar: 736, tebus: 736, belumTebus: 0, sudahGuna: 565, belumGuna: 171 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG AMPANGAN', kod: 'NEA4118', nama: 'SM SAINS TUANKU AISHAH ROHANI', daftar: 585, tebus: 585, belumTebus: 0, sudahGuna: 451, belumGuna: 134 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG RANTAU', kod: 'NEA4111', nama: 'SMK SEREMBAN JAYA', daftar: 1158, tebus: 1158, belumTebus: 0, sudahGuna: 1058, belumGuna: 100 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG AMPANGAN', kod: 'NEA4088', nama: 'SMK TUNKU AMPUAN DURAH', daftar: 1388, tebus: 1388, belumTebus: 0, sudahGuna: 1301, belumGuna: 87 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG AMPANGAN', kod: 'NEA4115', nama: 'SMK WARISAN PUTERI', daftar: 607, tebus: 607, belumTebus: 0, sudahGuna: 528, belumGuna: 79 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG MANTIN', kod: 'NEB4095', nama: 'SMK TUNKU AMPUAN NAJIHAH', daftar: 304, tebus: 304, belumTebus: 0, sudahGuna: 232, belumGuna: 72 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG NILAI', kod: 'NEE4100', nama: "SMK DATO' MOHD SAID", daftar: 1584, tebus: 1584, belumTebus: 0, sudahGuna: 1569, belumGuna: 15 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG AMPANGAN', kod: 'NHA4001', nama: 'KOLEJ VOKASIONAL AMPANGAN', daftar: 1100, tebus: 1100, belumTebus: 0, sudahGuna: 1088, belumGuna: 12 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG MAMBAU', kod: 'NEA4119', nama: 'SMK CHAN WA II', daftar: 1335, tebus: 1335, belumTebus: 0, sudahGuna: 1329, belumGuna: 6 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG MAMBAU', kod: 'NEA4117', nama: 'SMK SEREMBAN 3', daftar: 608, tebus: 608, belumTebus: 0, sudahGuna: 603, belumGuna: 5 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG MAMBAU', kod: 'NEA4112', nama: 'SMK BUKIT KEPAYANG', daftar: 1463, tebus: 1463, belumTebus: 0, sudahGuna: 1458, belumGuna: 5 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG RANTAU', kod: 'NEE4099', nama: 'SMK RANTAU', daftar: 762, tebus: 762, belumTebus: 0, sudahGuna: 758, belumGuna: 4 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG NILAI', kod: 'NRA4002', nama: 'SM AGAMA PERSEKUTUAN LABU', daftar: 775, tebus: 775, belumTebus: 0, sudahGuna: 771, belumGuna: 4 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG MAMBAU', kod: 'NEA4090', nama: 'SMK BUKIT MEWAH', daftar: 1921, tebus: 1921, belumTebus: 0, sudahGuna: 1917, belumGuna: 4 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG AMPANGAN', kod: 'NEA4108', nama: 'SM SAINS TUANKU MUNAWIR', daftar: 581, tebus: 581, belumTebus: 0, sudahGuna: 577, belumGuna: 4 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG AMPANGAN', kod: 'NEA4110', nama: 'SMK PANCHOR', daftar: 927, tebus: 927, belumTebus: 0, sudahGuna: 924, belumGuna: 3 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG MAMBAU', kod: 'NEA4099', nama: 'SMK MAMBAU', daftar: 949, tebus: 949, belumTebus: 0, sudahGuna: 946, belumGuna: 3 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG AMPANGAN', kod: 'NRA4001', nama: 'SMK AGAMA SHEIKH HJ MOHD SAID', daftar: 779, tebus: 779, belumTebus: 0, sudahGuna: 778, belumGuna: 1 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG AMPANGAN', kod: 'NEB4097', nama: 'SMK DATO SHEIKH AHMAD', daftar: 866, tebus: 866, belumTebus: 0, sudahGuna: 865, belumGuna: 1 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG MAMBAU', kod: 'NEA4120', nama: 'SMK BANDAR BARU SRI SENDAYAN', daftar: 1528, tebus: 1528, belumTebus: 0, sudahGuna: 1527, belumGuna: 1 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG RANTAU', kod: 'NEA4116', nama: "SMK DATO' SHAMSUDIN NAIN", daftar: 583, tebus: 583, belumTebus: 0, sudahGuna: 582, belumGuna: 1 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG NILAI', kod: 'NFT4002', nama: 'SM AGAMA NILAI', daftar: 266, tebus: 266, belumTebus: 0, sudahGuna: 265, belumGuna: 1 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG RANTAU', kod: 'NFT4001', nama: "SM AGAMA DATO' SYEIKH MOHD MURTADZA", daftar: 204, tebus: 204, belumTebus: 0, sudahGuna: 203, belumGuna: 1 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG AMPANGAN', kod: 'NEB4093', nama: 'SMK SERI AMPANGAN', daftar: 1191, tebus: 1191, belumTebus: 0, sudahGuna: 1191, belumGuna: 0 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG MAMBAU', kod: 'NEA4109', nama: 'SMK SEREMBAN 2', daftar: 1449, tebus: 1449, belumTebus: 0, sudahGuna: 1449, belumGuna: 0 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG MANTIN', kod: 'NEE4098', nama: "SMK DATO' KLANA PUTRA", daftar: 1060, tebus: 1060, belumTebus: 0, sudahGuna: 1060, belumGuna: 0 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG NILAI', kod: 'NEA4121', nama: 'SMK BANDAR ENSTEK', daftar: 860, tebus: 860, belumTebus: 0, sudahGuna: 860, belumGuna: 0 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG NILAI', kod: 'NEA4105', nama: 'SMK TAMAN SEMARAK', daftar: 1260, tebus: 1260, belumTebus: 0, sudahGuna: 1260, belumGuna: 0 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG AMPANGAN', kod: 'NEB4094', nama: 'SMK CHAN WA', daftar: 1583, tebus: 1583, belumTebus: 0, sudahGuna: 1583, belumGuna: 0 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG MAMBAU', kod: 'NEB4089', nama: 'SMK KING GEORGE V', daftar: 893, tebus: 893, belumTebus: 0, sudahGuna: 893, belumGuna: 0 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG NILAI', kod: 'NEA4098', nama: "SMK DATO' SHAHARDIN", daftar: 756, tebus: 756, belumTebus: 0, sudahGuna: 756, belumGuna: 0 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG RANTAU', kod: 'NEA4100', nama: 'SMK SENAWANG', daftar: 1480, tebus: 1480, belumTebus: 0, sudahGuna: 1480, belumGuna: 0 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG AMPANGAN', kod: 'NEA4101', nama: "SMK DATO' HAJI MOHD REDZA", daftar: 988, tebus: 988, belumTebus: 0, sudahGuna: 988, belumGuna: 0 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG AMPANGAN', kod: 'NEA4102', nama: "SMK PENDETA ZA'BA", daftar: 1313, tebus: 1313, belumTebus: 0, sudahGuna: 1313, belumGuna: 0 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG NILAI', kod: 'NEA4103', nama: 'SMK KOMPLEKS KLIA', daftar: 1408, tebus: 1408, belumTebus: 0, sudahGuna: 1408, belumGuna: 0 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG NILAI', kod: 'NEA4104', nama: 'SMK DESA CEMPAKA', daftar: 2069, tebus: 2069, belumTebus: 0, sudahGuna: 2069, belumGuna: 0 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG RANTAU', kod: 'NEA4107', nama: 'SMK TAMAN TUANKU JAAFAR', daftar: 1319, tebus: 1319, belumTebus: 0, sudahGuna: 1319, belumGuna: 0 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG AMPANGAN', kod: 'NEA4114', nama: 'KOLEJ TINGKATAN ENAM TUANKU MUHRIZ', daftar: 797, tebus: 797, belumTebus: 0, sudahGuna: 797, belumGuna: 0 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG RANTAU', kod: 'NEA4106', nama: 'SMK SERI PAGI', daftar: 1842, tebus: 1842, belumTebus: 0, sudahGuna: 1842, belumGuna: 0 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG RANTAU', kod: 'NEE4102', nama: 'SMK SERI SENDAYAN', daftar: 1293, tebus: 1293, belumTebus: 0, sudahGuna: 1293, belumGuna: 0 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG MANTIN', kod: 'NEA4122', nama: 'SMK NILAI IMPIAN', daftar: 1105, tebus: 1105, belumTebus: 0, sudahGuna: 1105, belumGuna: 0 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG MAMBAU', kod: 'NEB4092', nama: 'SMK PUTERI', daftar: 1037, tebus: 1037, belumTebus: 0, sudahGuna: 1037, belumGuna: 0 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG NILAI', kod: 'NEB4096', nama: 'KOLEJ TUNKU KURSHIAH', daftar: 778, tebus: 778, belumTebus: 0, sudahGuna: 778, belumGuna: 0 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG MAMBAU', kod: 'NEB4091', nama: 'SMK METHODIST ACS', daftar: 851, tebus: 851, belumTebus: 0, sudahGuna: 851, belumGuna: 0 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG MANTIN', kod: 'NEE4101', nama: 'SMK MANTIN', daftar: 1909, tebus: 1909, belumTebus: 0, sudahGuna: 1909, belumGuna: 0 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG AMPANGAN', kod: 'NFT4003', nama: "SM AGAMA DATO' KLANA PETRA MAAMOR", daftar: 509, tebus: 509, belumTebus: 0, sudahGuna: 509, belumGuna: 0 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG MAMBAU', kod: 'NEA4113', nama: 'SMK SEREMBAN JAYA 2', daftar: 851, tebus: 851, belumTebus: 0, sudahGuna: 851, belumGuna: 0 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG AMPANGAN', kod: 'NKE4144', nama: 'SMT TUANKU JAAFAR', daftar: 636, tebus: 636, belumTebus: 0, sudahGuna: 636, belumGuna: 0 },
  { ppd: 'PPD SEREMBAN', pkg: 'PKG MAMBAU', kod: 'NEB4090', nama: 'SMK ST PAUL', daftar: 838, tebus: 838, belumTebus: 0, sudahGuna: 838, belumGuna: 0 },
];

export function classifySchoolCategory(kod: string, nama: string): SchoolCategory {
  const upperName = nama.toUpperCase();
  const upperKod = kod.toUpperCase();

  if (
    upperKod === 'NEB4137' || // SM Datuk Abdul Razak (SDAR)
    upperKod === 'NEB4096' || // Kolej Tunku Kurshiah (TKC)
    upperName.includes('SAINS') // SM Sains Tuanku Aishah Rohani, SM Sains Tuanku Munawir
  ) {
    return 'SBP & Sains';
  }

  if (upperKod.startsWith('NRA') || upperKod.startsWith('NFT') || upperName.includes('AGAMA')) {
    return 'SM Agama';
  }

  if (upperKod.startsWith('NHA') || upperKod.startsWith('NKE') || upperName.includes('VOKASIONAL') || upperName.startsWith('SMT ')) {
    return 'TVET & Vokasional';
  }

  if (upperName.includes('TINGKATAN ENAM')) {
    return 'Kolej Tingkatan Enam';
  }

  return 'SMK Harian';
}

export const SCHOOL_DATA: SchoolRecord[] = RAW_SCHOOL_DATA.map((item) => ({
  ...item,
  kategori: classifySchoolCategory(item.kod, item.nama),
}));

export const STRATEGIC_INTERVENTIONS: InterventionAction[] = [
  {
    id: 'int-sbp-1',
    tajuk: 'Kempen Penebusan Berkelompok & Hari Koperasi Digital Asrama (SBP)',
    sasaran: 'SM Datuk Abdul Razak (171 belum guna) & SM Sains Tuanku Aishah Rohani (134 belum guna)',
    kategoriSasaran: 'SBP & Sains',
    tahapKeutamaan: 'Tinggi',
    huraianStrategik:
      'Data menunjukkan 43.3% (309 daripada 714) baucar belum guna tertumpu di sekolah berasrama penuh (SDAR & SGS) disebabkan kekangan masa murid asrama mengakses peranti dan pemilihan buku rujukan akademik.',
    langkahTindakan: [
      'Menjadualkan slot makmal komputer berjadual mengikut tingkatan bersama guru penyelaras BBM.',
      'Menyediakan Senarai Pakej Buku Rujukan SPM/STPM pra-pilihan untuk mempercepat pemilihan buku.',
      'Kerjasama pembekal buku tempatan untuk penghantaran terus ke koperasi asrama sekolah.',
    ],
    unjuranImpakBaucar: 305,
    tempohPelaksanaan: 'Minggu 1 - Minggu 2',
    indikatorKejayaan: '100% baucar tertunggak di SDAR dan SGS selesai digunakan sebelum tarikh tutup.',
  },
  {
    id: 'int-harian-1',
    tajuk: 'Operasi Sifar Baki & Kaunter Bantuan DELIMa Sekolah Harian',
    sasaran: 'SMK Seremban Jaya (100), SMK Tunku Ampuan Durah (87), SMK Warisan Puteri (79) & SMK Tunku Ampuan Najihah (72)',
    kategoriSasaran: 'SMK Harian',
    tahapKeutamaan: 'Tinggi',
    huraianStrategik:
      '4 sekolah menengah harian menyumbang 338 baucar belum guna (47.3% daripada jumlah baki daerah). Murid telah menebus baucar tetapi belum menyelesaikan transaksi checkout di platform.',
    langkahTindakan: [
      'Mengaktifkan Skuad Duta Penggerak Digital Murid di Pusat Sumber Sekolah waktu rehat.',
      'Mengedarkan notis peringatan terus kepada ibu bapa melalui kumpulan WhatsApp rasmi kelas.',
      'Menyelesaikan isu teknikal kata laluan & pengesahan baucar secara bersemuka di bilik akses.',
    ],
    unjuranImpakBaucar: 338,
    tempohPelaksanaan: 'Minggu 1 - Minggu 3',
    indikatorKejayaan: 'Penurunan 100% baki belum guna bagi 4 SMK harian berisiko tinggi.',
  },
  {
    id: 'int-tvet-1',
    tajuk: 'Penyelarasan Modul & Bahan Bacaan Teknikal TVET',
    sasaran: 'Kolej Vokasional Ampangan (12 belum guna)',
    kategoriSasaran: 'TVET & Vokasional',
    tahapKeutamaan: 'Sederhana',
    huraianStrategik:
      'Pelajar aliran vokasional memerlukan panduan memilih bahan bacaan teknikal dan keusahawanan yang diiktiraf dalam katalog Baucar Buku Madani.',
    langkahTindakan: [
      'Senarai cadangan buku teknikal, keselamatan industri & keusahawanan oleh Ketua Jabatan.',
      'Taklimat ringkas 15 minit semasa sesi bengkel untuk menyelesaikan baki 12 baucar.',
    ],
    unjuranImpakBaucar: 12,
    tempohPelaksanaan: 'Minggu 1',
    indikatorKejayaan: 'Kolej Vokasional Ampangan menyertai SMT Tuanku Jaafar mencapai 100% penggunaan.',
  },
  {
    id: 'int-agama-1',
    tajuk: 'Tuntutan Pantas Baki Mikro Sekolah Agama & Kelompok Akhir',
    sasaran: 'SMAP Labu (4), SMKA Sheikh Hj Mohd Said (1), SMA Nilai (1), SMA Dato Syeikh Mohd Murtadza (1) & 11 SMK Baki <15',
    kategoriSasaran: 'SM Agama',
    tahapKeutamaan: 'Pemantauan',
    huraianStrategik:
      'Sekolah agama dan 11 SMK harian lain hanya mempunyai baki kecil (antara 1 hingga 15 baucar). Intervensi mikro secara individu oleh Guru Kelas mampu menutup baki ini serta-merta.',
    langkahTindakan: [
      'Senarai nama murid spesifik diserahkan kepada Guru Penolong Kanan Hal Ehwal Murid (PK HEM).',
      'Panggilan terus / bimbingan 1-ke-1 bagi menyelesaikan 59 baucar baki mikro di seluruh daerah.',
    ],
    unjuranImpakBaucar: 59,
    tempohPelaksanaan: '3 Hari Bekerja',
    indikatorKejayaan: 'Keseluruhan 49 sekolah di PPD Seremban mencapai status Hijau (0 Belum Guna).',
  },
];
