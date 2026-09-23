import mongoose from 'mongoose';

const uslugaStampeSchema = new mongoose.Schema({
    idUsluge: String,
    tipStampe: String,
    dodatnaCenaPoKomadu: Number,
    maxSirinaMm: Number,
    maxVisinaMm: Number
}, { _id: false });

const proizvodSchema = new mongoose.Schema({
    _id: { type: String },
    sifra: { type: String, required: true },
    naziv: { type: String, required: true },
    opis: String,
    kategorija: String,
    potkategorija: String,
    jedinicnaCena: Number,
    kolicinaNaLageru: { type: Number, default: 0 },
    dostupneBoje: { type: [String], default: ['Bela'] },
    slikaUrl: String,
    dodatneSlike: { type: [String], default: [] },
    uslugeStampe: [uslugaStampeSchema],
    aktivan: { type: Boolean, default: true },
    brojLajkova: { type: Number, default: 0 },
    brojDislajkova: { type: Number, default: 0 }
});

const stamparijaSchema = new mongoose.Schema({
    stamparijaId: { type: String, required: true, unique: true },
    nazivStamparije: String,
    proizvodi: [proizvodSchema]
});

export default mongoose.model('StamparijaModel', stamparijaSchema, 'proizvodi');
