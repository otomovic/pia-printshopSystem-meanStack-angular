import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    naziv: { type: String, required: true, unique: true },
    potkategorije: [{ naziv: String }]
});

export default mongoose.model('CategoryModel', categorySchema, 'kategorije');