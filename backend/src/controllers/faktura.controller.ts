import express from 'express'
import path from 'path'
import StamparijaModel from '../models/stamparija'
import UserModel from '../models/user'
import FakturaModel from '../models/faktura'
import { generisiFakturuPdf } from '../pdf/faktura-pdf'
import { posaljiEmail } from '../email/mailer'

const SLEDECI_STATUS: any = {
    'naruceno': 'u stampi',
    'u stampi': 'isporuceno'
}

export class FakturaController{
    confirm = async (req: express.Request, res: express.Response) => {
        let username = req.body.username
        let items = req.body.items as any[]

        if (!items || !items.length) {
            return res.status(400).json({ message: 'Korpa je prazna.' })
        }

        try {
            let stamparijaCache: any = {}
            let userCache: any = {}
            let grupePoStamparijama: any = {}

            for (let item of items) {
                let found: any = await StamparijaModel.findOne({ 'proizvodi._id': item.productId })
                if (!found) {
                    return res.status(404).json({ message: 'Proizvod nije pronađen.' })
                }

                let stId = found.stamparijaId
                let stamparija = stamparijaCache[stId] || found
                stamparijaCache[stId] = stamparija

                let proizvod = stamparija.proizvodi.id(item.productId)

                if (item.kolicina > proizvod.kolicinaNaLageru) {
                    return res.status(400).json({ message: 'Nema dovoljno proizvoda trenutno na stanju' })
                }

                if (!(stId in userCache)) {
                    userCache[stId] = await UserModel.findOne({ stamparijaId: stId, type: 'stamparija' }, 'nazivFirme grad')
                }
                let stamparijaUser = userCache[stId]

                let usluga = (proizvod.uslugeStampe || []).find((u: any) => u.idUsluge === item.uslugaId)
                let dodatnaCena = usluga ? usluga.dodatnaCenaPoKomadu : 0
                let jedinicnaCena = proizvod.jedinicnaCena + dodatnaCena
                let ukupnaCena = jedinicnaCena * item.kolicina

                if (!grupePoStamparijama[stId]) {
                    grupePoStamparijama[stId] = {
                        stamparijaId: stId,
                        nazivStamparije: stamparijaUser ? stamparijaUser.nazivFirme : '',
                        gradStamparije: stamparijaUser ? (stamparijaUser.grad || '') : '',
                        stavke: [],
                        ukupanIznos: 0
                    }
                }

                grupePoStamparijama[stId].stavke.push({
                    productId: item.productId,
                    naziv: proizvod.naziv,
                    kolicina: item.kolicina,
                    boja: item.boja,
                    tipStampe: usluga ? usluga.tipStampe : '',
                    tekst: item.tekst || '',
                    slika: item.slika || '',
                    jedinicnaCena: jedinicnaCena,
                    ukupnaCena: ukupnaCena
                })
                grupePoStamparijama[stId].ukupanIznos += ukupnaCena

                proizvod.kolicinaNaLageru -= item.kolicina
            }

            for (let stId of Object.keys(stamparijaCache)) {
                await stamparijaCache[stId].save()
            }

            let kupac = await UserModel.findOne({ username: username }, 'email firstname lastname')
            let imeKupca = kupac ? `${kupac.firstname} ${kupac.lastname}`.trim() : username

            let fakture = []
            for (let stId of Object.keys(grupePoStamparijama)) {
                let grupa = grupePoStamparijama[stId]
                let faktura: any = await new FakturaModel({
                    kupac: username,
                    stamparijaId: grupa.stamparijaId,
                    nazivStamparije: grupa.nazivStamparije,
                    gradStamparije: grupa.gradStamparije,
                    stavke: grupa.stavke,
                    ukupanIznos: grupa.ukupanIznos,
                    status: 'naruceno'
                }).save()

                let fajl = `${faktura._id}.pdf`
                let putanja = path.join('uploads', 'fakture', fajl)

                try {
                    await generisiFakturuPdf(faktura, putanja, imeKupca)
                    faktura.pdfPath = `fakture/${fajl}`
                    await faktura.save()

                    if (kupac?.email) {
                        await posaljiEmail(
                            kupac.email,
                            `Faktura ${faktura._id}`,
                            `Poštovani,\n\nU prilogu se nalazi faktura za Vašu narudžbinu kod štamparije "${grupa.nazivStamparije}", ukupnog iznosa ${grupa.ukupanIznos} din.\n\nHvala na poverenju.`,
                            [{ filename: fajl, path: putanja }]
                        )
                    }
                } catch (pdfErr) {
                    console.log('Greška prilikom generisanja/slanja PDF fakture:', pdfErr)
                }

                fakture.push(faktura)
            }

            res.json({ message: 'ok', brojFaktura: fakture.length })
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'Greška prilikom kreiranja narudžbine.' })
        }
    }

    mine = async (req: express.Request, res: express.Response) => {
        let username = req.query.username as string

        if (!username) {
            return res.status(400).json({ message: 'Nedostaje korisničko ime.' })
        }

        FakturaModel.find({ kupac: username }).sort({ datum: -1 }).then((fakture) => {
            res.json(fakture)
        }).catch((err) => {
            console.log(err)
            res.status(500).json({ message: 'Greška prilikom učitavanja faktura.' })
        })
    }

    otkazi = async (req: express.Request, res: express.Response) => {
        let username = req.body.username
        let fakturaId = req.body.fakturaId

        try {
            let faktura: any = await FakturaModel.findById(fakturaId)

            if (!faktura || faktura.kupac !== username) {
                return res.status(404).json({ message: 'Faktura nije pronađena.' })
            }

            if (faktura.status !== 'naruceno') {
                return res.status(400).json({ message: 'Naručbina se više ne može otkazati.' })
            }

            let stamparija: any = await StamparijaModel.findOne({ stamparijaId: faktura.stamparijaId })

            if (stamparija) {
                for (let stavka of faktura.stavke) {
                    let proizvod = stamparija.proizvodi.id(stavka.productId)
                    if (proizvod) {
                        proizvod.kolicinaNaLageru += stavka.kolicina
                    }
                }
                await stamparija.save()
            }

            faktura.status = 'otkazano'
            await faktura.save()

            res.json({ message: 'ok' })
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'Greška prilikom otkazivanja narudžbine.' })
        }
    }

    primi = async (req: express.Request, res: express.Response) => {
        let username = req.body.username
        let fakturaId = req.body.fakturaId

        try {
            let faktura: any = await FakturaModel.findById(fakturaId)

            if (!faktura || faktura.kupac !== username) {
                return res.status(404).json({ message: 'Faktura nije pronađena.' })
            }

            if (faktura.status !== 'isporuceno') {
                return res.status(400).json({ message: 'Narudžbina još uvek nije isporučena.' })
            }

            faktura.status = 'primljeno'
            await faktura.save()

            res.json({ message: 'ok' })
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'Greška prilikom ažuriranja narudžbine.' })
        }
    }

    zaStamparija = async (req: express.Request, res: express.Response) => {
        let stamparijaId = req.query.stamparijaId as string

        if (!stamparijaId) {
            return res.status(400).json({ message: 'Nedostaje stamparijaId.' })
        }

        FakturaModel.find({ stamparijaId: stamparijaId }).sort({ datum: -1 }).then((fakture) => {
            res.json(fakture)
        }).catch((err) => {
            console.log(err)
            res.status(500).json({ message: 'Greška prilikom učitavanja narudžbina.' })
        })
    }

    napreduj = async (req: express.Request, res: express.Response) => {
        let stamparijaId = req.body.stamparijaId
        let fakturaId = req.body.fakturaId

        try {
            let faktura: any = await FakturaModel.findById(fakturaId)

            if (!faktura || faktura.stamparijaId !== stamparijaId) {
                return res.status(404).json({ message: 'Faktura nije pronađena.' })
            }

            let sledeci = SLEDECI_STATUS[faktura.status]

            if (!sledeci) {
                return res.status(400).json({ message: 'Status narudžbine se ne može dalje promeniti.' })
            }

            faktura.status = sledeci
            await faktura.save()

            res.json({ message: 'ok', status: faktura.status })
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'Greška prilikom ažuriranja statusa.' })
        }
    }
}
