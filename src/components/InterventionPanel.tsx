import React, { useState } from 'react';
import {
  STRATEGIC_INTERVENTIONS,
  InterventionAction,
  SchoolCategory,
  SchoolRecord,
} from '../data/baucarData';
import { simulateInterventionProjection } from '../utils/analytics';
import { CheckSquare, Square, Sliders, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface InterventionPanelProps {
  allSchools: SchoolRecord[];
  selectedCategory: SchoolCategory | 'Semua';
  onFilterByCategory: (cat: SchoolCategory | 'Semua') => void;
}

export const InterventionPanel: React.FC<InterventionPanelProps> = ({
  allSchools,
  selectedCategory,
  onFilterByCategory,
}) => {
  const [activeInterventions, setActiveInterventions] = useState<string[]>([
    'int-sbp-1',
    'int-harian-1',
  ]);
  const [efficiencyRate, setEfficiencyRate] = useState<number>(95);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    'int-sbp-1-0': true,
    'int-harian-1-0': true,
  });

  const toggleIntervention = (id: string) => {
    setActiveInterventions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllInterventions = () => {
    if (activeInterventions.length === STRATEGIC_INTERVENTIONS.length) {
      setActiveInterventions([]);
    } else {
      setActiveInterventions(STRATEGIC_INTERVENTIONS.map((i) => i.id));
    }
  };

  const toggleStep = (stepKey: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }));
  };

  const simulation = simulateInterventionProjection(
    allSchools,
    activeInterventions,
    efficiencyRate
  );

  const visibleInterventions: InterventionAction[] =
    selectedCategory === 'Semua'
      ? STRATEGIC_INTERVENTIONS
      : STRATEGIC_INTERVENTIONS.filter(
          (i) => i.kategoriSasaran === selectedCategory || i.kategoriSasaran === 'Semua'
        );

  return (
    <section
      id="intervensi-strategik"
      aria-label="Cadangan Intervensi Strategik & Simulasi Keputusan"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors"
    >
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
            Sokongan Keputusan Pengurusan PPD Seremban 2027
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            Pelan Intervensi Strategik & Simulator Penyelesaian Baki Baucar
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            Tandakan cadangan intervensi di bawah dan laraskan kadar keberkesanan pelaksanaan untuk
            melihat unjuran pengurangan baki 714 baucar belum guna secara masa nyata.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start">
          <button
            type="button"
            onClick={selectAllInterventions}
            className="px-3.5 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            {activeInterventions.length === STRATEGIC_INTERVENTIONS.length
              ? 'Nyahpilih Semua Pelan'
              : 'Aktifkan Semua Intervensi (4)'}
          </button>
        </div>
      </div>

      {/* Interactive Simulation Readout Bar */}
      <div className="my-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Slider Control */}
          <div className="md:col-span-5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label
                htmlFor="efficiency-slider"
                className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Simulasi Kadar Keberkesanan Pelaksanaan</span>
              </label>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                {efficiencyRate}%
              </span>
            </div>
            <input
              id="efficiency-slider"
              type="range"
              min={50}
              max={100}
              step={5}
              value={efficiencyRate}
              onChange={(e) => setEfficiencyRate(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <span>50% (Minimum)</span>
              <span>75% (Sederhana)</span>
              <span>100% (Optimum)</span>
            </div>
          </div>

          {/* 4 Impact Metrics */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 md:pt-0 md:border-l border-slate-200 dark:border-slate-700 md:pl-6">
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Baki Semasa</div>
              <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                {simulation.asalBelumGuna.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">baucar belum guna</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Unjuran Diselesaikan</div>
              <div className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                +{simulation.unjuranSelesai.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                ({activeInterventions.length} pelan aktif)
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Unjuran Baki Akhir</div>
              <div className="text-xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-0.5">
                {simulation.bakiSelepasIntervensi.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">baucar berbaki</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Kadar Guna Baharu</div>
              <div className="text-xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400 mt-0.5">
                {simulation.unjuranKadarPenggunaan}%
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">daripada 98.60% asal</div>
            </div>
          </div>
        </div>
      </div>

      {/* Intervention Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {visibleInterventions.map((item, idx) => {
          const isSelected = activeInterventions.includes(item.id);
          return (
            <div
              key={item.id}
              className={`border rounded-xl p-5 transition-colors flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600/70 dark:border-blue-500/70 bg-blue-50/20 dark:bg-blue-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div>
                {/* Top metadata line (unboxed per Zero-Pill rule) */}
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      0{idx + 1}.
                    </span>
                    <span
                      className={
                        item.tahapKeutamaan === 'Tinggi'
                          ? 'text-red-600 dark:text-red-400 font-semibold'
                          : item.tahapKeutamaan === 'Sederhana'
                          ? 'text-amber-600 dark:text-amber-400 font-semibold'
                          : 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      }
                    >
                      Keutamaan {item.tahapKeutamaan}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{item.kategoriSasaran}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.tempohPelaksanaan}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleIntervention(item.id)}
                    aria-label={`Aktifkan simulasi untuk ${item.tajuk}`}
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                  >
                    {isSelected ? (
                      <>
                        <CheckSquare className="w-4 h-4" />
                        <span>Aktif</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">Pilih</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {item.tajuk}
                </h3>

                {/* Target Schools */}
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1.5">
                  Sasaran Utama: <span className="font-normal text-slate-600 dark:text-slate-400">{item.sasaran}</span>
                </p>

                {/* Strategic Rationale */}
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {item.huraianStrategik}
                </p>

                {/* Interactive Action Checklist */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Senarai Semak Tindakan Pengurusan (Klik untuk tanda selesai):
                  </div>
                  {item.langkahTindakan.map((step, sIdx) => {
                    const stepKey = `${item.id}-${sIdx}`;
                    const isDone = !!completedSteps[stepKey];
                    return (
                      <button
                        key={stepKey}
                        type="button"
                        onClick={() => toggleStep(stepKey)}
                        className="w-full flex items-start gap-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 py-0.5 transition-colors"
                      >
                        <CheckCircle2
                          className={`w-3.5 h-3.5 mt-0.5 shrink-0 transition-colors ${
                            isDone
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                        <span className={isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                          {step}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card Footer: Expected Impact + Filter Trigger */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                <div className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                  Impak Sasaran:{' '}
                  <strong className="text-slate-900 dark:text-slate-100">
                    {item.unjuranImpakBaucar} baucar
                  </strong>
                </div>

                {item.kategoriSasaran !== 'Semua' && (
                  <button
                    type="button"
                    onClick={() =>
                      onFilterByCategory(
                        selectedCategory === item.kategoriSasaran
                          ? 'Semua'
                          : item.kategoriSasaran
                      )
                    }
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0"
                  >
                    <span>
                      {selectedCategory === item.kategoriSasaran
                        ? 'Papar Semua Kategori'
                        : `Tapis ${item.kategoriSasaran}`}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
