import PDFDocument from 'pdfkit';
import fs from 'fs';
import { UNICODE_FONT } from './font';

const STATUS_NAZIVI: any = {
    'naruceno': 'Naručeno',
    'u stampi': 'U štampi',
    'isporuceno': 'Isporučeno',
    'primljeno': 'Primljeno',
    'otkazano': 'Otkazano'
};

export function generisiFakturuPdf(faktura: any, putanja: string, imeKupca?: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(putanja);
        doc.pipe(stream);

        doc.font(UNICODE_FONT);
        doc.fontSize(11);
        doc.text('Faktura');
        doc.text(`Broj fakture: ${faktura._id}`);
        doc.text(`Datum: ${faktura.datum}`);
        doc.text(`Kupac: ${imeKupca || faktura.kupac}`);
        doc.text(`Štamparija: ${faktura.nazivStamparije || ''}`);
        doc.text(`Grad: ${faktura.gradStamparije || ''}`);
        doc.text(`Status: ${STATUS_NAZIVI[faktura.status] || faktura.status}`);
        doc.moveDown();

        doc.text('Stavke:');

        for (const stavka of faktura.stavke) {
            doc.text(
                `${stavka.naziv}  x${stavka.kolicina}` +
                (stavka.boja ? `  (boja: ${stavka.boja})` : '') +
                (stavka.tipStampe ? `  (${stavka.tipStampe})` : '') +
                `  —  ${stavka.jedinicnaCena} din/kom  =  ${stavka.ukupnaCena} din`
            );
        }

        doc.moveDown();
        doc.text(`Ukupan iznos: ${faktura.ukupanIznos} din`);

        doc.end();

        stream.on('finish', () => resolve());
        stream.on('error', reject);
    });
}
