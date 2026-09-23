import mongoose from 'mongoose';

function formatDatum(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

const stavkaSchema = new mongoose.Schema({
    productId: String,
    naziv: String,
    kolicina: Number,
    boja: String,
    tipStampe: String,
    tekst: String,
    slika: String,
    jedinicnaCena: Number,
    ukupnaCena: Number
}, { _id: false });

const fakturaSchema = new mongoose.Schema({
    kupac: { type: String, required: true },
    stamparijaId: { type: String, required: true },
    nazivStamparije: String,
    gradStamparije: String,
    stavke: [stavkaSchema],
    ukupanIznos: Number,
    status: { type: String, default: 'naruceno' },
    datum: { type: String, default: () => formatDatum(new Date()) },
    pdfPath: String
});

export default mongoose.model('FakturaModel', fakturaSchema, 'fakture');
