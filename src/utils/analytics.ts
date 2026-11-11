import {
  SCHOOL_DATA,
  STRATEGIC_INTERVENTIONS,
  SchoolCategory,
  SchoolRecord,
  SeverityBand,
} from '../data/baucarData';

export interface FilterState {
  kategori: SchoolCategory | 'Semua';
  pkg: string | 'Semua';
  statusBand: SeverityBand | 'Semua';
  searchQuery: string;
}

export interface SummaryMetrics {
  jumlahSekolah: number;
  jumlahDaftar: number;
  jumlahTebus: number;
  jumlahBelumTebus: number;
  jumlahSudahGuna: number;
  jumlahBelumGuna: number;
  kadarPenebusan: number;
  kadarPenggunaan: number;
  sekolahSelesai100: number;
  sekolahKritikal: number;
}

export interface CategoryDistributionItem {
  kategori: SchoolCategory;
  jumlahSekolah: number;
  jumlahDaftar: number;
  sudahGuna: number;
  belumGuna: number;
  kadarPenggunaan: number;
  peratusDaripadaJumlah: number;
}

export interface PKGDistributionItem {
  pkg: string;
  jumlahSekolah: number;
  jumlahDaftar: number;
  sudahGuna: number;
  belumGuna: number;
  kadarPenggunaan: number;
}

export function getSeverityBand(belumGuna: number): SeverityBand {
  if (belumGuna > 100) return 'Kritikal (>100)';
  if (belumGuna > 50) return 'Sederhana (51-100)';
  if (belumGuna > 10) return 'Rendah (11-50)';
  if (belumGuna >= 1) return 'Terkawal (1-10)';
  return 'Selesai (0)';
}

export function filterSchools(
  schools: SchoolRecord[],
  filters: FilterState
): SchoolRecord[] {
  return schools.filter((s) => {
    if (filters.kategori !== 'Semua' && s.kategori !== filters.kategori) {
      return false;
    }
    if (filters.pkg !== 'Semua' && s.pkg !== filters.pkg) {
      return false;
    }
    if (filters.statusBand !== 'Semua' && getSeverityBand(s.belumGuna) !== filters.statusBand) {
      return false;
    }
    if (filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchName = s.nama.toLowerCase().includes(q);
      const matchKod = s.kod.toLowerCase().includes(q);
      const matchPkg = s.pkg.toLowerCase().includes(q);
      if (!matchName && !matchKod && !matchPkg) return false;
    }
    return true;
  });
}

export function computeSummaryMetrics(schools: SchoolRecord[]): SummaryMetrics {
  const jumlahSekolah = schools.length;
  let jumlahDaftar = 0;
  let jumlahTebus = 0;
  let jumlahBelumTebus = 0;
  let jumlahSudahGuna = 0;
  let jumlahBelumGuna = 0;
  let sekolahSelesai100 = 0;
  let sekolahKritikal = 0;

  for (const s of schools) {
    jumlahDaftar += s.daftar;
    jumlahTebus += s.tebus;
    jumlahBelumTebus += s.belumTebus;
    jumlahSudahGuna += s.sudahGuna;
    jumlahBelumGuna += s.belumGuna;
    if (s.belumGuna === 0) sekolahSelesai100++;
    if (s.belumGuna > 50) sekolahKritikal++;
  }

  const kadarPenebusan = jumlahDaftar > 0 ? Number(((jumlahTebus / jumlahDaftar) * 100).toFixed(2)) : 0;
  const kadarPenggunaan = jumlahDaftar > 0 ? Number(((jumlahSudahGuna / jumlahDaftar) * 100).toFixed(2)) : 0;

  return {
    jumlahSekolah,
    jumlahDaftar,
    jumlahTebus,
    jumlahBelumTebus,
    jumlahSudahGuna,
    jumlahBelumGuna,
    kadarPenebusan,
    kadarPenggunaan,
    sekolahSelesai100,
    sekolahKritikal,
  };
}

export function computeCategoryDistribution(schools: SchoolRecord[]): CategoryDistributionItem[] {
  const categories: SchoolCategory[] = [
    'SMK Harian',
    'SBP & Sains',
    'SM Agama',
    'TVET & Vokasional',
    'Kolej Tingkatan Enam',
  ];

  const totalDaftarAll = schools.reduce((sum, s) => sum + s.daftar, 0);

  return categories
    .map((kategori) => {
      const group = schools.filter((s) => s.kategori === kategori);
      const jumlahDaftar = group.reduce((sum, s) => sum + s.daftar, 0);
      const sudahGuna = group.reduce((sum, s) => sum + s.sudahGuna, 0);
      const belumGuna = group.reduce((sum, s) => sum + s.belumGuna, 0);
      const kadarPenggunaan = jumlahDaftar > 0 ? Number(((sudahGuna / jumlahDaftar) * 100).toFixed(2)) : 0;
      const peratusDaripadaJumlah = totalDaftarAll > 0 ? Number(((jumlahDaftar / totalDaftarAll) * 100).toFixed(1)) : 0;

      return {
        kategori,
        jumlahSekolah: group.length,
        jumlahDaftar,
        sudahGuna,
        belumGuna,
        kadarPenggunaan,
        peratusDaripadaJumlah,
      };
    })
    .filter((item) => item.jumlahSekolah > 0);
}

export function computePKGDistribution(schools: SchoolRecord[]): PKGDistributionItem[] {
  const pkgs = ['PKG AMPANGAN', 'PKG MAMBAU', 'PKG RANTAU', 'PKG NILAI', 'PKG MANTIN'];

  return pkgs
    .map((pkg) => {
      const group = schools.filter((s) => s.pkg === pkg);
      const jumlahDaftar = group.reduce((sum, s) => sum + s.daftar, 0);
      const sudahGuna = group.reduce((sum, s) => sum + s.sudahGuna, 0);
      const belumGuna = group.reduce((sum, s) => sum + s.belumGuna, 0);
      const kadarPenggunaan = jumlahDaftar > 0 ? Number(((sudahGuna / jumlahDaftar) * 100).toFixed(2)) : 0;

      return {
        pkg,
        jumlahSekolah: group.length,
        jumlahDaftar,
        sudahGuna,
        belumGuna,
        kadarPenggunaan,
      };
    })
    .filter((item) => item.jumlahSekolah > 0);
}

export function simulateInterventionProjection(
  schools: SchoolRecord[],
  completedInterventionIds: string[],
  efficiencyRate: number = 100
): {
  asalBelumGuna: number;
  unjuranSelesai: number;
  bakiSelepasIntervensi: number;
  unjuranKadarPenggunaan: number;
} {
  const metrics = computeSummaryMetrics(schools);
  const clampedEfficiency = Math.max(0, Math.min(100, efficiencyRate)) / 100;

  let rawSaved = 0;
  for (const id of completedInterventionIds) {
    const found = STRATEGIC_INTERVENTIONS.find((item) => item.id === id);
    if (found) {
      rawSaved += found.unjuranImpakBaucar;
    }
  }

  const unjuranSelesai = Math.min(
    metrics.jumlahBelumGuna,
    Math.round(rawSaved * clampedEfficiency)
  );
  const bakiSelepasIntervensi = Math.max(0, metrics.jumlahBelumGuna - unjuranSelesai);
  const unjuranSudahGuna = metrics.jumlahSudahGuna + unjuranSelesai;
  const unjuranKadarPenggunaan =
    metrics.jumlahDaftar > 0
      ? Number(((unjuranSudahGuna / metrics.jumlahDaftar) * 100).toFixed(2))
      : 0;

  return {
    asalBelumGuna: metrics.jumlahBelumGuna,
    unjuranSelesai,
    bakiSelepasIntervensi,
    unjuranKadarPenggunaan,
  };
}

export function answerQuickDataQuery(query: string): string {
  const q = query.toLowerCase().trim();
  const allMetrics = computeSummaryMetrics(SCHOOL_DATA);

  // Check if user asks about a specific school by name or code
  const matchedSchool = SCHOOL_DATA.find(
    (s) =>
      q.includes(s.kod.toLowerCase()) ||
      q.includes(s.nama.toLowerCase()) ||
      (q.includes('sdar') && s.kod === 'NEB4137') ||
      (q.includes('sgs') && s.kod === 'NEA4118') ||
      (q.includes('tkc') && s.kod === 'NEB4096') ||
      (q.includes('kgv') && s.kod === 'NEB4089') ||
      (q.includes('saser') && s.kod === 'NEA4108') ||
      (q.includes('smap labu') && s.kod === 'NRA4002')
  );

  if (matchedSchool) {
    const kadar = ((matchedSchool.sudahGuna / matchedSchool.daftar) * 100).toFixed(2);
    const status = getSeverityBand(matchedSchool.belumGuna);
    return `Data bagi **${matchedSchool.nama} (${matchedSchool.kod})** di bawah **${matchedSchool.pkg}** (${matchedSchool.kategori}):\n• Jumlah Daftar & Tebus: **${matchedSchool.daftar.toLocaleString()}** murid (100% ditebus)\n• Sudah Guna: **${matchedSchool.sudahGuna.toLocaleString()}** baucar (${kadar}%)\n• Belum Guna: **${matchedSchool.belumGuna.toLocaleString()}** baucar\n• Status Semasa: **${status}**`;
  }

  if (q.includes('kritikal') || q.includes('tertinggi') || q.includes('belum guna') || q.includes('baki')) {
    const top6 = SCHOOL_DATA.filter((s) => s.belumGuna > 50);
    const listStr = top6
      .map(
        (s, idx) =>
          `${idx + 1}. **${s.nama}** (${s.pkg}) — **${s.belumGuna}** belum guna daripada ${s.daftar} (${((s.sudahGuna / s.daftar) * 100).toFixed(1)}% selesai)`
      )
      .join('\n');
    return `Terdapat **6 sekolah berisiko tinggi (>50 baucar belum guna)** yang menyumbang **643 daripada 714 (90.1%)** keseluruhan baki daerah:\n${listStr}\n\nCadangan utama: Laksanakan **Kempen Penebusan Berkelompok Asrama (SBP)** dan **Kaunter Bantuan DELIMa Sekolah Harian**.`;
  }

  if (q.includes('pkg') || q.includes('kawasan') || q.includes('zon')) {
    const pkgStats = computePKGDistribution(SCHOOL_DATA);
    const lines = pkgStats
      .map(
        (p) =>
          `• **${p.pkg}** (${p.jumlahSekolah} sekolah): Daftar **${p.jumlahDaftar.toLocaleString()}**, Sudah Guna **${p.sudahGuna.toLocaleString()}** (${p.kadarPenggunaan}%), Belum Guna **${p.belumGuna}**`
      )
      .join('\n');
    return `Analisis mengikut **Pusat Kegiatan Guru (PKG)** di PPD Seremban:\n${lines}\n\n**PKG Nilai** mencatatkan kadar penggunaan tertinggi (**99.80%**), manakala **PKG Rantau** (277 belum guna) dan **PKG Ampangan** (321 belum guna) memerlukan tumpuan intervensi segera.`;
  }

  if (q.includes('kategori') || q.includes('sbp') || q.includes('agama') || q.includes('vokasional') || q.includes('harian')) {
    const catStats = computeCategoryDistribution(SCHOOL_DATA);
    const lines = catStats
      .map(
        (c) =>
          `• **${c.kategori}** (${c.jumlahSekolah} sekolah): Daftar **${c.jumlahDaftar.toLocaleString()}**, Sudah Guna **${c.sudahGuna.toLocaleString()}** (${c.kadarPenggunaan}%), Belum Guna **${c.belumGuna}**`
      )
      .join('\n');
    return `Pecahan prestasi mengikut **Kategori Sekolah PPD Seremban**:\n${lines}\n\nWalaupun **SBP & Sains** hanya merangkumi 4 sekolah, kategori ini mencatatkan **309 baucar belum guna** (kadar penggunaan 88.47%), diikuti **SMK Harian** dengan 386 baucar belum guna (kadar penggunaan 99.10%).`;
  }

  if (q.includes('intervensi') || q.includes('cadangan') || q.includes('strategi') || q.includes('keputusan')) {
    return `Berdasarkan trend data 2026/2027, berikut adalah **4 Intervensi Strategik Pengurusan PPD Seremban**:\n1. **Kempen Berkelompok & Koperasi Digital SBP** (Sasaran: SDAR & SGS — impak 305 baucar).\n2. **Operasi Sifar Baki & Kaunter DELIMa SMK Harian** (Sasaran: SMK Seremban Jaya, SMK Tunku Ampuan Durah, SMK Warisan Puteri, SMK Tunku Ampuan Najihah — impak 338 baucar).\n3. **Penyelarasan Bahan Bacaan Teknikal TVET** (Sasaran: KV Ampangan — impak 12 baucar).\n4. **Tuntutan Pantas Baki Mikro (<15 baucar)** melalui PK HEM bagi 17 sekolah berbaki kecil (impak 59 baucar).`;
  }

  if (q.includes('100%') || q.includes('sifar') || q.includes('selesai') || q.includes('terbaik')) {
    const zeroSchools = SCHOOL_DATA.filter((s) => s.belumGuna === 0);
    return `Sebanyak **${zeroSchools.length} daripada 49 sekolah (53.1%)** di PPD Seremban telah mencapai **100% penggunaan baucar (0 Belum Guna)**. Sekolah dengan enrolmen tertinggi yang mencapai 100% selesai termasuk:\n• **SMK Desa Cempaka** (2,069 baucar)\n• **SMK Mantin** (1,909 baucar)\n• **SMK Seri Pagi** (1,842 baucar)\n• **SMK Chan Wa** (1,583 baucar)\n• **SMK Senawang** (1,480 baucar)`;
  }

  return `**Rumusan Eksekutif Baucar Buku PPD Seremban 2027:**\n• Jumlah Sekolah / Institusi: **${allMetrics.jumlahSekolah} buah**\n• Jumlah Murid Mendaftar & Menebus: **${allMetrics.jumlahDaftar.toLocaleString()} baucar (100% telah ditebus)**\n• Jumlah Sudah Digunakan: **${allMetrics.jumlahSudahGuna.toLocaleString()} baucar (${allMetrics.kadarPenggunaan}%)**\n• Jumlah Belum Digunakan: **${allMetrics.jumlahBelumGuna.toLocaleString()} baucar (1.40%)**\n• Sekolah Selesai 100%: **${allMetrics.sekolahSelesai100} sekolah**\n\nAnda boleh bertanya tentang sekolah tertentu (cth: *SDAR*, *SMK Seremban Jaya*), perbandingan *PKG*, *kategori sekolah*, atau *cadangan intervensi*.`;
}
