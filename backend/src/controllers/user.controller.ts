import express from 'express'
import bcrypt from 'bcrypt'
import UserModel from '../models/user'

export class UserController{
    login = async (req: express.Request, res: express.Response) => {
        try {
            const user = await UserModel.findOne({username: req.body.username})
            const passwordMatches = user && await bcrypt.compare(req.body.password, (user.password) ? user.password : '')

            if (passwordMatches && user.type === 'stamparija' && !user.stamparijaId && user.pib) {
                user.stamparijaId = user.pib
                await user.save()
            }

            res.json(passwordMatches ? user : null)
        } catch (err) {
            console.log(err)
            res.json(null)
        }

    }
    loginAdmin = async (req: express.Request, res: express.Response) => {
        try {
            const user = await UserModel.findOne({username: req.body.username, type: 'admin'})
            const passwordMatches = user && await bcrypt.compare(req.body.password, (user.password) ? user.password : '')

            res.json(passwordMatches ? user : null)
        } catch (err) {
            console.log(err)
            res.json(null)
        }

    }
    register = async (req: express.Request, res: express.Response) => {
        let user = req.body.username
        let pass = req.body.password
        let first = req.body.firstname
        let last = req.body.lastname
        let pho = req.body.phone
        let mail = req.body.email
        let tip1 = req.body.type
        let nazivFirme = req.body.nazivFirme
        let adresa = req.body.adresa
        let grad = req.body.grad
        let pib = req.body.pib
        let maticniBroj = req.body.maticniBroj
        let prof = req.file
        ? req.file.filename
        : "default_profile_image.jpg";

        if (!user || !pass || !first || !last || !pho || !mail || !tip1) {
            return res.json({ message: 'Molimo Vas da popunite sva obavezna polja!' })
        }

        if (!/^(?=.{8,12}$)(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z][\x20-\x7E]*$/.test(pass)) {
            return res.json({ message: 'Lozinka mora imati 8-12 karaktera, početi slovom i sadržati veliko slovo, broj i specijalni karakter.' })
        }

        if (!/^\d{10}$/.test(pho)) {
            return res.json({ message: 'Broj telefona mora imati tačno 10 cifara.' })
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
            return res.json({ message: 'Email adresa nije ispravnog formata.' })
        }

        if (tip1 === 'pravnoLice' || tip1 === 'stamparija') {
            if (!nazivFirme || !adresa || !pib || !maticniBroj) {
                return res.json({ message: 'Molimo Vas da popunite sva obavezna polja za pravno lice ili štampariju.' })
            }

            if (!/^[1-9]\d{8}$/.test(pib)) {
                return res.json({ message: 'PIB mora imati tačno 9 cifara i ne sme počinjati nulom.' })
            }

            if (!/^\d{8}$/.test(maticniBroj)) {
                return res.json({ message: 'Matični broj mora imati tačno 8 cifara.' })
            }
        }

        let userObject = {
            username: user,
            password: bcrypt.hashSync(pass, 10),
            firstname: first,
            lastname: last,
            phone: pho,
            email: mail,
            type: tip1,
            nazivFirme: nazivFirme,
            adresa: adresa,
            grad: grad,
            pib: pib,
            maticniBroj: maticniBroj,
            profileImage: prof,
            accepted: false,
            stamparijaId: tip1 === 'stamparija' ? pib : undefined
        }

        new UserModel(userObject).save().then(ok=>{
            res.json({message:"ok"})
        }).catch((err)=>{
            console.log(err)

            if (err.code === 11000) {
                let polje = Object.keys(err.keyPattern || {})[0]
                let poruke: any = {
                    username: 'Korisničko ime je već zauzeto.',
                    email: 'Nalog sa ovom email adresom već postoji.',
                    pib: 'Nalog sa ovim PIB-om je već registrovan.',
                    maticniBroj: 'Nalog sa ovim matičnim brojem je već registrovan.'
                }
                return res.json({message: poruke[polje] || 'Podaci koje ste uneli se već koriste.'})
            }

            res.json({message: 'Registracija nije uspela. Pokušajte ponovo.'})
        })
    }
    acceptUser = async (req: express.Request, res: express.Response) => {
        let user = req.body.username

        UserModel.updateOne({username: user}, {$set: {accepted: true}}).then(ok=>{
            res.json({message:"ok"})
        }).catch((err)=>{
            console.log(err)
            res.json({message:"Failed"})
        }
        )
    }
    rejectUser = async (req: express.Request, res: express.Response) => {
        let user = req.body.username

        UserModel.deleteOne({username: user}).then(ok=>{
            res.json({message:"ok"})
        }).catch((err)=>{
            console.log(err)
            res.json({message:"Failed"})
        }
        )
    }
    getAcceptedUsers = async (req: express.Request, res: express.Response) => {
        UserModel.find({accepted: true}).then((users)=>{
            res.json(users)
        }).catch((err)=>{
            console.log(err)
            res.json({message:"Failed"})
        })
    }
    getUnacceptedUsers = async (req: express.Request, res: express.Response) => {
        UserModel.find({accepted: false}).then((users)=>{
            res.json(users)
        }).catch((err)=>{
            console.log(err)
            res.json({message:"Failed"})
        })
    }
    updateProfile = async (req: express.Request, res: express.Response) => {
        let username = req.body.username

        let update: any = {}

        if (req.body.password) update.password = bcrypt.hashSync(req.body.password, 10)
        if (req.body.firstname) update.firstname = req.body.firstname
        if (req.body.lastname) update.lastname = req.body.lastname
        if (req.body.phone) update.phone = req.body.phone
        if (req.body.email) update.email = req.body.email
        if (req.body.nazivFirme) update.nazivFirme = req.body.nazivFirme
        if (req.body.adresa) update.adresa = req.body.adresa
        if (req.body.grad) update.grad = req.body.grad
        if (req.body.pib) update.pib = req.body.pib
        if (req.body.maticniBroj) update.maticniBroj = req.body.maticniBroj
        if (req.file) update.profileImage = req.file.filename

        UserModel.updateOne({username: username}, {$set: update}).then(()=>{
            res.json({message: "ok", profileImage: update.profileImage})
        }).catch((err)=>{
            console.log(err)
            res.json({message: "Failed"})
        })
    }
    deleteUser = async (req: express.Request, res: express.Response) => {
        UserModel.deleteOne({username: req.body.username}).then(()=>{
            res.json({message: "ok"})
        }).catch((err)=>{
            console.log(err)
            res.json({message: "Failed"})
        })
    }
}
