import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { exportCertificateToPdf } from '../utils/certificateGenerator';
import { Award, Download, Sparkles, Building, User, FileBadge } from 'lucide-react';

export default function CertificateModule({ t }) {
  const [name, setName] = useState("Aliyeva Malika Anvar qizi");
  const [school, setSchool] = useState("142-sonli umumiy o'rta ta'lim maktabi");
  const [reason, setReason] = useState("Fan olimpiadasida faol ishtirok etib, faxrli 1-o'rinni egallagani uchun");
  const [director, setDirector] = useState("Sobirov A. M.");
  const [date, setDate] = useState("2026-yil 15-fevral");
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      await exportCertificateToPdf('certificate-preview-card', `Faxriy_Yorliq_${name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error(err);
      alert("PDF yuklab olishda xatolik!");
    } finally {
      setIsExporting(false);
    }
  };

  const qrValue = `EduHujjat Rasmiy Sertifikat | ${name} | ${school} | ID: ED-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-500" />
              {t.certificate.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t.certificate.sub}
            </p>
          </div>
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-2"
          >
            {isExporting ? <Sparkles className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isExporting ? t.common.loading : t.certificate.downloadPdf}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parametrlar formasi */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
            <FileBadge className="w-4 h-4 text-amber-500" />
            Sertifikat Ma'lumotlari
          </h3>

          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
              {t.certificate.name}:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
              {t.certificate.school}:
            </label>
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
              {t.certificate.reason}:
            </label>
            <textarea
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Direktor:</label>
              <input
                type="text"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Sana:</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Jonli Sertifikat Maketi (A4 Landscape Preview) */}
        <div className="lg:col-span-2 flex flex-col items-center">
          <div
            id="certificate-preview-card"
            className="w-full max-w-2xl aspect-[1.414/1] bg-white text-slate-900 p-8 rounded-xl border-8 border-double border-amber-600 shadow-xl flex flex-col justify-between relative overflow-hidden"
            style={{ minHeight: '380px' }}
          >
            {/* Oltin burchak bezaklari */}
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-500" />
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-500" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-500" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-500" />

            {/* Sarlavha */}
            <div className="text-center space-y-1">
              <div className="text-[10px] tracking-widest uppercase font-bold text-slate-600">
                {school}
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-black tracking-wider text-amber-700 uppercase drop-shadow-sm">
                FAXRIY YORLIQ
              </h1>
              <div className="text-[11px] italic text-slate-500">
                Munosib ta'lim va yuksak natijalar e'tirofi
              </div>
            </div>

            {/* Asosiy qism */}
            <div className="text-center my-auto space-y-3 px-4">
              <div className="text-xs text-slate-600 uppercase tracking-wider">Taqdirlanadi:</div>
              <div className="text-xl md:text-2xl font-serif font-bold text-slate-900 border-b-2 border-amber-600/40 pb-1.5 inline-block min-w-[280px]">
                {name}
              </div>
              <p className="text-xs text-slate-700 italic max-w-md mx-auto leading-relaxed">
                "{reason}"
              </p>
            </div>

            {/* Pastki qism: Muhr, Imzo, QR-kod */}
            <div className="flex items-end justify-between pt-4 border-t border-amber-500/30">
              <div className="text-left text-[10px] text-slate-600">
                <div>Maktab direktori:</div>
                <div className="font-bold text-slate-900 font-serif text-xs mt-1">{director}</div>
                <div className="text-slate-400 mt-0.5">{date}</div>
              </div>

              {/* Rasmiy Muhr simulatsiyasi */}
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-600 flex items-center justify-center text-[8px] text-blue-700 font-bold text-center rotate-[-12deg] opacity-75">
                RASMIY<br/>MAKTAB<br/>MUHRI
              </div>

              {/* Haqiqiy QR Kod */}
              <div className="text-right">
                <div className="p-1 bg-white border border-slate-300 rounded inline-block shadow-xs">
                  <QRCodeSVG value={qrValue} size={54} />
                </div>
                <div className="text-[8px] text-slate-400 mt-0.5 font-mono">Haqiqiylik tekshiruvi</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
