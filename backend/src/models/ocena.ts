import mongoose from 'mongoose';

function formatDatum(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

const ocenaSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    naziv: String,
    tip: { type: String, enum: ['lajk', 'dislajk'], required: true },
    datum: { type: String, default: () => formatDatum(new Date()) }
});

export default mongoose.model('OcenaModel', ocenaSchema, 'ocene');
