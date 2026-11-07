import React, { useState } from 'react';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  HeadingLevel 
} from 'docx';
import { saveAs } from 'file-saver';
import { FileBadge2, Download, Briefcase, FileSignature, Sparkles } from 'lucide-react';

export default function OrdersAndContractsModule() {
  const [docType, setDocType] = useState('order_hiring'); // 'order_hiring', 'order_vacation', 'contract_work'
  const [isExporting, setIsExporting] = useState(false);

  const [formData, setFormData] = useState({
    school: "142-sonli umumiy o'rta ta'lim maktabi",
    director: "Sobirov Alisher Mamatovich",
    employee: "Rahimov Jamshid Otabekovich",
    position: "Matematika fani o'qituvchisi",
    startDate: "2026-yil 15-fevral",
    orderNumber: "28-k",
    salary: "4 500 000 so'm",
    date: "2026-yil 15-fevral"
  });

  const handleExportDocx = async () => {
    setIsExporting(true);
    try {
      let docChildren = [];

      if (docType === 'order_hiring') {
        docChildren = [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [new TextRun({ text: "O'ZBEKISTON RESPUBLIKASI MAKTABGACHA VA MAKTAB TA'LIMI VAZIRLIGI", bold: true, size: 22, font: 'Times New Roman' })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [new TextRun({ text: `${formData.school.toUpperCase()} DIREKTORINING`, bold: true, size: 24, font: 'Times New Roman' })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [new TextRun({ text: `BUYRUG'I № ${formData.orderNumber}`, bold: true, size: 28, font: 'Times New Roman' })]
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({ text: `${formData.date}                                                                         Toshkent shahri`, italic: true, size: 22, font: 'Times New Roman' })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
            children: [new TextRun({ text: "XODIMNI ISHGA QABUL QILISH TO'G'RISIDA", bold: true, size: 24, font: 'Times New Roman' })]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 708 },
            spacing: { line: 360, after: 200 },
            children: [
              new TextRun({
                text: `O'zbekiston Respublikasi Mehnat kodeksining 127-moddasiga muvofiq hamda ${formData.employee}ning arizasiga binoan:`,
                size: 26, font: 'Times New Roman'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 708 },
            spacing: { line: 360, after: 200 },
            children: [
              new TextRun({
                text: `1. ${formData.employee} ${formData.startDate} dan boshlab ${formData.school} ga 1.0 stavka ${formData.position} lavozimiga ishga qabul qilinsin.`,
                size: 26, font: 'Times New Roman'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 708 },
            spacing: { line: 360, after: 600 },
            children: [
              new TextRun({
                text: `2. Xodimga o'rnatilgan tartibda oylik maosh ${formData.salary} miqdorida belgilansin va hisobxona bo'limiga tegishli to'lovlarni amalga oshirish topshirilsin.`,
                size: 26, font: 'Times New Roman'
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 400 },
            children: [
              new TextRun({ text: `Maktab direktori: _____________________ ${formData.director}`, bold: true, size: 24, font: 'Times New Roman' })
            ]
          })
        ];
      } else {
        // Mehnat shartnomasi
        docChildren = [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [new TextRun({ text: "NAMUNAVIY MEHNAT SHARTNOMASI", bold: true, size: 28, font: 'Times New Roman' })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [new TextRun({ text: `(Ish beruvchi: ${formData.school} va Xodim: ${formData.employee} o'rtasida)`, italic: true, size: 22, font: 'Times New Roman' })]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 708 },
            spacing: { line: 360, after: 300 },
            children: [
              new TextRun({
                text: "1. SHARTNOMA PREDMETI: Ish beruvchi xodimni shartnomada ko'rsatilgan mutaxassislik bo'yicha ish bilan ta'minlash, mehnat sharoitlarini yaratish va qonunchilikda belgilangan muddatlarda ish haqini to'lash majburiyatini oladi.",
                size: 24, font: 'Times New Roman'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 708 },
            spacing: { line: 360, after: 500 },
            children: [
              new TextRun({
                text: "2. TARAFLARNING JAVOBGARLIGI: Mehnat majburiyatlarini bajarmaslik yoki lozim darajada bajarmaslik O'zbekiston Respublikasining Mehnat Kodeksi doirasida javobgarlikka sabab bo'ladi.",
                size: 24, font: 'Times New Roman'
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 400 },
            children: [
              new TextRun({ text: "Ish beruvchi: _______________                       Xodim: _______________", size: 24, font: 'Times New Roman' })
            ]
          })
        ];
      }

      const doc = new Document({
        sections: [{
          children: docChildren
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Rasmiy_Buyruq_${formData.orderNumber}.docx`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileBadge2 className="w-6 h-6 text-indigo-500" />
              Maktab Buyruqlari va Mehnat Shartnomalari
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Direktor buyruqlari, xodimni ishga qabul qilish, ta'til va moddiy javobgarlik shartnomalari
            </p>
          </div>
          <button
            onClick={handleExportDocx}
            disabled={isExporting}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-2"
          >
            {isExporting ? <Sparkles className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Tayyor Buyruqni Word (.docx) yuklash
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex gap-2 mb-2">
            {[
              { id: 'order_hiring', name: 'Ishga Qabul Buyrug\'i' },
              { id: 'contract_work', name: 'Mehnat Shartnomasi' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setDocType(tab.id)}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition ${
                  docType === tab.id
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Buyruq raqami:</label>
            <input
              type="text"
              value={formData.orderNumber}
              onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Xodim F.I.Sh:</label>
            <input
              type="text"
              value={formData.employee}
              onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Lavozim:</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Oylik maosh stavkasi:</label>
            <input
              type="text"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>

        {/* Live Document Preview */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm font-serif">
          <div className="text-center font-bold text-sm tracking-wide uppercase mb-2">
            {formData.school}
          </div>
          <div className="text-center font-black text-xl mb-4 text-indigo-900 dark:text-indigo-400">
            BUYRUQ № {formData.orderNumber}
          </div>
          <div className="flex justify-between text-xs text-slate-500 border-b pb-3 mb-4">
            <span>{formData.date}</span>
            <span>Toshkent shahri</span>
          </div>

          <div className="text-sm font-bold mb-3">
            Xodimni ishga qabul qilish to'g'risida:
          </div>

          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-3 indent-6">
            <p>
              O'zbekiston Respublikasi Mehnat kodeksining 127-moddasiga muvofiq hamda {formData.employee}ning yozma arizasini inobatga olgan holda:
            </p>
            <p>
              <b>1.</b> {formData.employee} {formData.startDate} sanasidan e'tiboran {formData.school} ga 1.0 stavka {formData.position} lavozimiga ishga qabul qilinsin.
            </p>
            <p>
              <b>2.</b> Xodimga belgilangan shtatlar jadvaliga asosan {formData.salary} miqdorida ish haqi tayinlansin.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t flex justify-between text-xs font-sans">
            <span>Maktab direktori: <b>{formData.director}</b></span>
            <span>Imzo: ____________</span>
          </div>
        </div>
      </div>
    </div>
  );
}
