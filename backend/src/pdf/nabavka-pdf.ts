import PDFDocument from 'pdfkit';
import fs from 'fs';
import { UNICODE_FONT } from './font';

export function generisiNabavkuPdf(nabavka: any, putanja: string, imeKlijenta?: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(putanja);
        doc.pipe(stream);

        doc.font(UNICODE_FONT);
        doc.fontSize(11);
        doc.text('Izveštaj o javnoj nabavci');
        doc.text(`ID javne nabavke: ${nabavka._id}`);
        doc.text(`Datum raspisivanja: ${nabavka.datumRaspisivanja}`);
        doc.text(`Klijent: ${imeKlijenta || nabavka.klijent}`);
        doc.moveDown();

        doc.text('Traženi proizvodi:');
        for (const s of nabavka.stavke) {
            doc.text(`${s.naziv} — ${s.kolicina} kom`);
        }
        doc.moveDown();

        doc.text('Pristigle ponude:');

        if (!nabavka.ponude || !nabavka.ponude.length) {
            doc.text('Nijedna štamparija nije poslala ponudu.');
        } else {
            for (const p of nabavka.ponude) {
                doc.text(`${p.nazivStamparije} — ukupno ${p.ukupnaPonuda} din (poslato ${p.datum})`);
                for (const s of p.stavke) {
                    doc.text(`   ${s.naziv} x${s.kolicina} — ${s.jedinicnaCena} din/kom = ${s.ukupnaCena} din`);
                }
            }
        }

        doc.moveDown();

        if (nabavka.pobednik && nabavka.pobednik.nazivStamparije) {
            doc.text(`Pobednik: ${nabavka.pobednik.nazivStamparije} — ${nabavka.pobednik.ukupnaPonuda} din`);
        } else {
            doc.text('Javna nabavka je zaključena bez izabranog pobednika.');
        }

        doc.end();

        stream.on('finish', () => resolve());
        stream.on('error', reject);
    });
}
