import test from 'node:test';
import assert from 'node:assert/strict';
import { SCHOOL_DATA } from '../data/baucarData';
import {
  computeSummaryMetrics,
  computeCategoryDistribution,
  computePKGDistribution,
  filterSchools,
  getSeverityBand,
  simulateInterventionProjection,
  answerQuickDataQuery,
} from './analytics';
import {
  buildCertificatePayload,
  validateEmailAddress,
  buildCertificateEmailPayload,
} from './certificate';

test('exact totals match official PPD Seremban PDF dataset', () => {
  const metrics = computeSummaryMetrics(SCHOOL_DATA);
  assert.equal(metrics.jumlahSekolah, 49);
  assert.equal(metrics.jumlahDaftar, 51084);
  assert.equal(metrics.jumlahTebus, 51084);
  assert.equal(metrics.jumlahBelumTebus, 0);
  assert.equal(metrics.jumlahSudahGuna, 50370);
  assert.equal(metrics.jumlahBelumGuna, 714);
  assert.equal(metrics.kadarPenebusan, 100);
  assert.equal(metrics.kadarPenggunaan, 98.6);
  assert.equal(metrics.sekolahSelesai100, 26);
  assert.equal(metrics.sekolahKritikal, 6);
});

test('category distribution sums to 49 schools and 51084 registered vouchers', () => {
  const dist = computeCategoryDistribution(SCHOOL_DATA);
  const totalSchools = dist.reduce((acc, item) => acc + item.jumlahSekolah, 0);
  const totalDaftar = dist.reduce((acc, item) => acc + item.jumlahDaftar, 0);
  const totalBelumGuna = dist.reduce((acc, item) => acc + item.belumGuna, 0);
  assert.equal(totalSchools, 49);
  assert.equal(totalDaftar, 51084);
  assert.equal(totalBelumGuna, 714);
});

test('PKG distribution covers all 5 PKG zones in Seremban', () => {
  const pkgs = computePKGDistribution(SCHOOL_DATA);
  assert.equal(pkgs.length, 5);
  const totalBelumGuna = pkgs.reduce((acc, item) => acc + item.belumGuna, 0);
  assert.equal(totalBelumGuna, 714);
});

test('filterSchools filters by category, PKG, statusBand, and searchQuery', () => {
  const sbpOnly = filterSchools(SCHOOL_DATA, {
    kategori: 'SBP & Sains',
    pkg: 'Semua',
    statusBand: 'Semua',
    searchQuery: '',
  });
  assert.equal(sbpOnly.length, 4);

  const criticalOnly = filterSchools(SCHOOL_DATA, {
    kategori: 'Semua',
    pkg: 'Semua',
    statusBand: 'Kritikal (>100)',
    searchQuery: '',
  });
  assert.equal(criticalOnly.length, 2); // SDAR (171) and SGS (134)

  const searchSdar = filterSchools(SCHOOL_DATA, {
    kategori: 'Semua',
    pkg: 'Semua',
    statusBand: 'Kritikal (>100)',
    searchQuery: 'ABDUL RAZAK',
  });
  assert.equal(searchSdar.length, 1);
  assert.equal(searchSdar[0].kod, 'NEB4137');
});

test('simulateInterventionProjection accurately projects voucher completion', () => {
  const fullSim = simulateInterventionProjection(
    SCHOOL_DATA,
    ['int-sbp-1', 'int-harian-1', 'int-tvet-1', 'int-agama-1'],
    100
  );
  assert.equal(fullSim.asalBelumGuna, 714);
  assert.equal(fullSim.unjuranSelesai, 714);
  assert.equal(fullSim.bakiSelepasIntervensi, 0);
  assert.equal(fullSim.unjuranKadarPenggunaan, 100);
});

test('getSeverityBand classifies voucher backlogs accurately', () => {
  assert.equal(getSeverityBand(171), 'Kritikal (>100)');
  assert.equal(getSeverityBand(100), 'Sederhana (51-100)');
  assert.equal(getSeverityBand(15), 'Rendah (11-50)');
  assert.equal(getSeverityBand(4), 'Terkawal (1-10)');
  assert.equal(getSeverityBand(0), 'Selesai (0)');
});

test('answerQuickDataQuery returns accurate school and summary answers', () => {
  const sdarReply = answerQuickDataQuery('Berapakah belum guna di SDAR?');
  assert.equal(sdarReply.includes('SM DATUK ABDUL RAZAK'), true);
  assert.equal(sdarReply.includes('171'), true);
});

test('buildCertificatePayload generates accurate school certificate data', () => {
  const sdar = SCHOOL_DATA.find((s) => s.kod === 'NEB4137')!;
  const certSdar = buildCertificatePayload(sdar);
  assert.equal(certSdar.noSiri, 'PPDS/BBM/2027/NEB4137');
  assert.equal(certSdar.penerimaBarisUtama, 'SM DATUK ABDUL RAZAK (NEB4137)');
  assert.equal(certSdar.kadarPenggunaan, '76.77%');
  assert.equal(certSdar.statusSijil, 'Sijil Penyertaan');

  const desaCempaka = SCHOOL_DATA.find((s) => s.kod === 'NEA4104')!;
  const cert100 = buildCertificatePayload(desaCempaka);
  assert.equal(cert100.kadarPenggunaan, '100.00%');
  assert.equal(cert100.statusSijil, 'Sijil Penyertaan & Kecemerlangan (100%)');
});

test('validateEmailAddress and buildCertificateEmailPayload format school certificate email properly', () => {
  assert.equal(validateEmailAddress('syazwansamsol@gmail.com'), true);
  assert.equal(validateEmailAddress('invalid-email'), false);
  assert.equal(validateEmailAddress(''), false);

  const sdar = SCHOOL_DATA.find((s) => s.kod === 'NEB4137')!;
  const emailPayload = buildCertificateEmailPayload(
    sdar,
    'syazwansamsol@gmail.com',
    undefined,
    'Tahniah atas penyertaan aktif.'
  );
  assert.equal(emailPayload.recipientEmail, 'syazwansamsol@gmail.com');
  assert.equal(emailPayload.subject.includes('SM DATUK ABDUL RAZAK (NEB4137)'), true);
  assert.equal(emailPayload.bodyText.includes('PPDS/BBM/2027/NEB4137'), true);
});
