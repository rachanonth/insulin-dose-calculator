import React, { useState, useEffect } from 'react';
import './App.css';

const round = (num: number) => Math.round(num);

const STORAGE_KEY = 'insulinDoseInputs';

const translations = {
  en: {
    title: 'Insulin Dose Calculator',
    bgLabel: 'Blood glucose before meal',
    bgUnit: 'mg/dL',
    carbLabel: 'Total carbohydrate count',
    carbCount: 'Carb count',
    carbUnit: 'carb',
    carbGram: 'Grams (g)',
    gramUnit: 'g',
    carbHelper: '1 carb = 15 grams',
    tdd: 'Total Daily Dose (TDD) of insulin',
    units: 'units',
    basal: 'Selected Basal insulin dose',
    targetBg: 'Target blood glucose',
    doseRec: 'Dose Recommendations',
    bolus: 'Bolus dose (for carbs)',
    correction: 'Corrected BGL dose',
    totalDose: 'Total mealtime dose:',
    refresh: 'Refresh',
    tableTitle: 'Recommended bolus dose',
    carbUnits: 'Carb units',
    doseUnits: 'Dose (units)',
    footer: 'Before using this app, please consult your healthcare provider.',
    showRatios: 'Show ICR & ISF',
    hideRatios: 'Hide ICR & ISF',
    icr: 'Insulin-to-Carb Ratio (ICR)',
    isf: 'Insulin Sensitivity Factor (ISF)',
    basalRec: 'Basal insulin dose recommended:',
    unitsRange: 'units',
  },
  th: {
    title: 'คำนวณปริมาณอินซูลิน',
    bgLabel: 'น้ำตาลในเลือดก่อนมื้ออาหาร',
    bgUnit: 'มก./ดล.',
    carbLabel: 'ปริมาณคาร์โบไฮเดรตรวม',
    carbCount: 'จำนวนคาร์บ',
    carbUnit: 'คาร์บ',
    carbGram: 'กรัม (g)',
    gramUnit: 'กรัม',
    carbHelper: '1 คาร์บ = 15 กรัม',
    tdd: 'ปริมาณอินซูลินต่อวัน (TDD)',
    units: 'ยูนิต',
    basal: 'ปริมาณเบซัลอินซูลินที่เลือก',
    targetBg: 'เป้าหมายน้ำตาลในเลือด',
    doseRec: 'คำแนะนำปริมาณอินซูลิน',
    bolus: 'ขนาดอินซูลินสำหรับคาร์บ',
    correction: 'ขนาดอินซูลินสำหรับแก้ไขน้ำตาล',
    totalDose: 'ปริมาณอินซูลินที่ต้องฉีดมื้อนี้:',
    refresh: 'รีเซ็ต',
    tableTitle: 'ขนาดอินซูลินที่แนะนำ',
    carbUnits: 'จำนวนคาร์บ',
    doseUnits: 'ยูนิต',
    footer: 'ก่อนใช้แอพนี้โปรดปรึกษาแพทย์',
    showRatios: 'แสดง ICR และ ISF',
    hideRatios: 'ซ่อน ICR และ ISF',
    icr: 'อัตราส่วนอินซูลินต่อคาร์บ (ICR)',
    isf: 'ปัจจัยความไวต่ออินซูลิน (ISF)',
    basalRec: 'แนะนำเบซัลอินซูลิน:',
    unitsRange: 'ยูนิต',
  }
};

function App() {
  // Load from localStorage or use defaults
  const getInitial = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        tdd: saved.tdd || '',
        basal: saved.basal || '',
        bg: saved.bg || '',
        targetBg: saved.targetBg || '130',
      };
    } catch {
      return { tdd: '', basal: '', bg: '', targetBg: '100' };
    }
  };

  const [tdd, setTdd] = useState(getInitial().tdd);
  const [basal, setBasal] = useState(getInitial().basal);
  const [carbsGrams, setCarbsGrams] = useState('');
  const [carbsCarb, setCarbsCarb] = useState('');
  const [lastCarbEdit, setLastCarbEdit] = useState<'grams' | 'carb' | null>(null);
  const [bg, setBg] = useState('');
  const [targetBg, setTargetBg] = useState(getInitial().targetBg);
  const [showRatios, setShowRatios] = useState(false);
  const [lang, setLang] = useState<'en' | 'th'>(
    () => (localStorage.getItem('insulinDoseLang') as 'en' | 'th') || 'en'
  );

  useEffect(() => {
    localStorage.setItem('insulinDoseLang', lang);
  }, [lang]);

  // Save only TDD, Basal, and Target BG
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ tdd, basal, targetBg })
    );
  }, [tdd, basal, targetBg]);

  // Refresh/Clear handler
  const handleRefresh = () => {
    setTdd('');
    setBasal('');
    setCarbsGrams('');
    setCarbsCarb('');
    setLastCarbEdit(null);
    setBg('');
    setTargetBg('100');
    localStorage.removeItem(STORAGE_KEY);
  };

  // Calculated values
  const tddNum = parseFloat(tdd) || 0;
  const icr = tddNum > 0 ? round(500 / tddNum) : 0;
  const isf = tddNum > 0 ? round(1800 / tddNum) : 0;
  // Convert input to grams if needed
  const carbsNum = parseFloat(carbsGrams) || 0;
  const carbsInGrams = carbsNum;
  const bolus = icr > 0 ? round(carbsInGrams / icr) : 0;
  const correction = isf > 0 ? round((parseFloat(bg) - parseFloat(targetBg)) / isf) : 0;
  const totalDose = round(bolus + correction);

  // Sync carb fields
  useEffect(() => {
    if (lastCarbEdit === 'grams') {
      const grams = parseFloat(carbsGrams);
      setCarbsCarb(grams ? String(round(grams / 15)) : '');
    } else if (lastCarbEdit === 'carb') {
      const carb = parseFloat(carbsCarb);
      setCarbsGrams(carb ? String(round(carb * 15)) : '');
    }
    // eslint-disable-next-line
  }, [carbsGrams, carbsCarb, lastCarbEdit]);

  const t = translations[lang];

  return (
    <div className="app-root">
      {/* Language toggle */}
      <div className="lang-toggle">
        <button onClick={() => setLang(lang === 'en' ? 'th' : 'en')} className="lang-toggle-btn">
          {lang === 'en' ? 'TH' : 'EN'}
        </button>
      </div>
      <main className="main-container">
        <h1 className="heading">{t.title}</h1>
        <form className="form-section" onSubmit={e => e.preventDefault()}>
          <label className="bg-label-row">
            <span className="bg-label-icon"><span role="img" aria-label="blood">🩸</span> {t.bgLabel}</span>
            <input type="number" min="0" step="any" value={bg} onChange={e => setBg(e.target.value)} required className="bg-input" />
            <span className="unit-label">{t.bgUnit}</span>
          </label>
          <div className="carb-section">
            <div className="carb-label-row"><span role="img" aria-label="carb">🍞</span> {t.carbLabel}</div>
            <div className="carb-inputs-col">
              <div className="carb-row">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="1"
                  value={carbsCarb}
                  onChange={e => { setCarbsCarb(e.target.value); setLastCarbEdit('carb'); }}
                  required
                  className="carb-input"
                  placeholder={t.carbCount}
                />
                <span className="unit-label">{t.carbUnit}</span>
                <div className="carb-helper">{t.carbHelper}</div>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={carbsCarb || 0}
                onChange={e => { setCarbsCarb(e.target.value); setLastCarbEdit('carb'); }}
                className="carb-slider"
              />
              <div className="carb-row">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={carbsGrams}
                  onChange={e => { setCarbsGrams(e.target.value); setLastCarbEdit('grams'); }}
                  required
                  className="carb-input"
                  placeholder={t.carbGram}
                />
                <span className="unit-label">{t.gramUnit}</span>
              </div>
            </div>
          </div>
        </form>
        <section className="section-dose section-title">
          <h2 className="section-title">{t.doseRec}</h2>
          <div className="dose-row">{t.bolus}: <b>{bolus || '-'}</b> {t.units}</div>
          <div className="dose-row">{t.correction}: <b>{correction || '-'}</b> {t.units}</div>
          <div className="total-dose-box">
            {t.totalDose}<br />
            <span className="total-dose-value">{totalDose || '-'} {t.units}</span>
          </div>
          <hr className="divider" />
        </section>
        <form className="form-section" style={{marginTop: 18}} onSubmit={e => e.preventDefault()}>
          <label className="tdd-label-row">
            <span className="bg-label-icon"><span role="img" aria-label="syringe">💉</span> {t.tdd}</span>
            <input type="number" min="0" step="any" value={tdd} onChange={e => setTdd(e.target.value)} required className="tdd-input" />
            <span className="unit-label">{t.units}</span>
          </label>
          {tddNum > 0 && (
            <div style={{ color: '#2a7be4', fontSize: 15, marginBottom: -8, fontWeight: 500 }}>
              {t.basalRec} <b>{round(tddNum * 0.4)} – {round(tddNum * 0.5)}</b> {t.unitsRange}
            </div>
          )}
          <label className="basal-label-row">
            <span className="bg-label-icon"><span role="img" aria-label="syringe">💉</span> {t.basal}</span>
            <input type="number" min="0" step="any" value={basal} onChange={e => setBasal(e.target.value)} required className="basal-input" />
            <span className="unit-label">{t.units}</span>
          </label>
          <label className="target-label-row" style={{fontSize: 14, color: '#888', fontWeight: 400, marginTop: 2}}>
            <span className="bg-label-icon"><span role="img" aria-label="target">🎯</span> {t.targetBg}</span>
            <input type="number" min="0" step="any" value={targetBg} onChange={e => setTargetBg(e.target.value)} required className="target-input" />
            <span className="unit-label">{t.bgUnit}</span>
          </label>
          <button type="button" onClick={handleRefresh} className="refresh-btn"><span role="img" aria-label="refresh">♻️</span> {t.refresh}</button>
        </form>
        <section className="table-section">
          <h3 className="table-title">{t.tableTitle}</h3>
          <table className="bolus-table">
            <thead>
              <tr>
                <th>{t.carbUnits}</th>
                <th>{t.carbUnits}</th>
                <th>{t.doseUnits}</th>
              </tr>
            </thead>
            <tbody>
              {[0,1,2,3,4,5].map(carbUnit => {
                const grams = carbUnit * 15;
                const dose = icr > 0 ? round(grams / icr) : '-';
                return (
                  <tr key={carbUnit}>
                    <td>{grams}</td>
                    <td>{carbUnit}</td>
                    <td>{dose} {t.units}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button
            type="button"
            onClick={() => setShowRatios((prev) => !prev)}
            className="ratios-toggle-btn"
          >
            {showRatios ? t.hideRatios : t.showRatios}
          </button>
          {showRatios && (
            <div className="ratios-section">
              <div style={{ fontSize: 16, color: '#222' }}>{t.icr}: <b>{icr || '-'}</b> {t.gramUnit}/{t.units}</div>
              <div style={{ fontSize: 16, color: '#222' }}>{t.isf}: <b>{isf || '-'}</b> {t.gramUnit}/{t.bgUnit}</div>
            </div>
          )}
        </section>
      </main>
      <footer className="footer">
        <span>{t.footer}</span>
      </footer>
    </div>
  );
}

export default App;
