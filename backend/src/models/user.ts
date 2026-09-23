import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    password: String,
    firstname: String,
    lastname: String,
    phone: String,
    email: {
        type: String,
        unique: true
    },
    type: String,
    nazivFirme: String,
    adresa: String,
    grad: String,
    pib: {
        type: String,
        unique: true,
        sparse: true
    },
    maticniBroj: {
        type: String,
        unique: true,
        sparse: true
    },
    profileImage: String,
    accepted: Boolean,
    stamparijaId: String
})

export default mongoose.model('UserModel', userSchema, 'users');