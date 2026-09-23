import mongoose from 'mongoose';

function formatDatum(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const komentarSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    username: { type: String, required: true },
    tekst: { type: String, required: true },
    datum: { type: String, default: () => formatDatum(new Date()) }
});

export default mongoose.model('KomentarModel', komentarSchema, 'komentari');
