import mongoose from 'mongoose';

function formatDatum(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

const stavkaNabavkeSchema = new mongoose.Schema({
    naziv: String,
    kolicina: Number
}, { _id: false });

const stavkaPonudeSchema = new mongoose.Schema({
    naziv: String,
    kolicina: Number,
    productId: String,
    jedinicnaCena: Number,
    ukupnaCena: Number
}, { _id: false });

const ponudaSchema = new mongoose.Schema({
    stamparijaId: { type: String, required: true },
    nazivStamparije: String,
    stavke: [stavkaPonudeSchema],
    ukupnaPonuda: Number,
    datum: { type: String, default: () => formatDatum(new Date()) }
});

const javnaNabavkaSchema = new mongoose.Schema({
    klijent: { type: String, required: true },
    stavke: [stavkaNabavkeSchema],
    raspisano: { type: Date, default: () => new Date() },
    datumRaspisivanja: { type: String, default: () => formatDatum(new Date()) },
    trajanjeMinuta: { type: Number, default: 10 },
    status: { type: String, default: 'otvorena' },
    ponude: [ponudaSchema],
    pobednik: {
        type: {
            stamparijaId: String,
            nazivStamparije: String,
            ukupnaPonuda: Number,
            fakturaId: String
        },
        default: undefined
    },
    pdfPath: String
});

export default mongoose.model('JavnaNabavkaModel', javnaNabavkaSchema, 'javne_nabavke');
