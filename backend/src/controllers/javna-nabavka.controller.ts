import express from 'express'
import path from 'path'
import JavnaNabavkaModel from '../models/javna-nabavka'
import StamparijaModel from '../models/stamparija'
import UserModel from '../models/user'
import FakturaModel from '../models/faktura'
import { generisiNabavkuPdf } from '../pdf/nabavka-pdf'
import { posaljiEmail } from '../email/mailer'

async function proveriIsteklu(nabavka: any) {
    if (nabavka.status !== 'otvorena') {
        return nabavka
    }

    let rok = new Date(nabavka.raspisano.getTime() + nabavka.trajanjeMinuta * 60000)

    if (new Date() < rok) {
        return nabavka
    }

    if (nabavka.ponude && nabavka.ponude.length) {
        let najbolja = nabavka.ponude[0]
        for (let p of nabavka.ponude) {
            if (p.ukupnaPonuda < najbolja.ukupnaPonuda) {
                najbolja = p
            }
        }

        let stamparija: any = await StamparijaModel.findOne({ stamparijaId: najbolja.stamparijaId })

        if (stamparija) {
            for (let s of najbolja.stavke) {
                let proizvod = stamparija.proizvodi.id(s.productId)
                if (proizvod) {
                    proizvod.kolicinaNaLageru -= s.kolicina
                }
            }
            await stamparija.save()
        }

        let stamparijaUser = await UserModel.findOne({ stamparijaId: najbolja.stamparijaId, type: 'stamparija' }, 'grad')

        let faktura: any = await new FakturaModel({
            kupac: nabavka.klijent,
            stamparijaId: najbolja.stamparijaId,
            nazivStamparije: najbolja.nazivStamparije,
            gradStamparije: stamparijaUser ? (stamparijaUser.grad || '') : '',
            stavke: najbolja.stavke,
            ukupanIznos: najbolja.ukupnaPonuda,
            status: 'u stampi'
        }).save()

        nabavka.pobednik = {
            stamparijaId: najbolja.stamparijaId,
            nazivStamparije: najbolja.nazivStamparije,
            ukupnaPonuda: najbolja.ukupnaPonuda,
            fakturaId: faktura._id.toString()
        }
    }

    nabavka.status = 'zakljucena'

    try {
        let klijentUser = await UserModel.findOne({ username: nabavka.klijent }, 'firstname lastname')
        let imeKlijenta = klijentUser ? `${klijentUser.firstname} ${klijentUser.lastname}`.trim() : nabavka.klijent

        let fajl = `${nabavka._id}.pdf`
        let putanja = path.join('uploads', 'nabavke', fajl)
        await generisiNabavkuPdf(nabavka, putanja, imeKlijenta)
        nabavka.pdfPath = `nabavke/${fajl}`
    } catch (err) {
        console.log('Greška prilikom generisanja izveštaja o javnoj nabavci:', err)
    }

    await nabavka.save()
    return nabavka
}

export class JavnaNabavkaController {
    kreiraj = async (req: express.Request, res: express.Response) => {
        let username = req.body.username
        let items = req.body.items as any[]

        if (!items || !items.length) {
            return res.status(400).json({ message: 'Korpa je prazna.' })
        }

        try {
            let stavke = items.map((i: any) => ({ naziv: i.naziv, kolicina: i.kolicina }))

            let nabavka: any = await new JavnaNabavkaModel({
                klijent: username,
                stavke: stavke
            }).save()

            let stamparije = await UserModel.find({ type: 'stamparija', accepted: true }, 'email')
            let listaProizvoda = stavke.map((s: any) => `- ${s.naziv} (${s.kolicina} kom)`).join('\n')

            for (let s of stamparije) {
                if (s.email) {
                    await posaljiEmail(
                        s.email,
                        `Otvorena javna nabavka ${nabavka._id}`,
                        `Poštovani,\n\nOtvorena je nova javna nabavka za: ${nabavka.klijent}\n\nPotrebni proizvodi:\n${listaProizvoda}\n\n
                        Rok za dostavljanje ponude je ${nabavka.trajanjeMinuta} minuta od trenutka raspisivanja.\n\n\n`
                    )
                }
            }

            res.json({ message: 'ok', javnaNabavkaId: nabavka._id })
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'Greška prilikom raspisivanja javne nabavke.' })
        }
    }

    moje = async (req: express.Request, res: express.Response) => {
        let username = req.query.username as string

        try {
            let nabavke = await JavnaNabavkaModel.find({ klijent: username }).sort({ raspisano: -1 })
            let azurirane = []

            for (let n of nabavke) {
                azurirane.push(await proveriIsteklu(n))
            }

            res.json(azurirane)
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'Greška prilikom učitavanja javnih nabavki.' })
        }
    }

    otvorene = async (req: express.Request, res: express.Response) => {
        let stamparijaId = req.query.stamparijaId as string

        try {
            let sve = await JavnaNabavkaModel.find({ status: 'otvorena' }).sort({ raspisano: -1 })
            let azurirane = []

            for (let n of sve) {
                azurirane.push(await proveriIsteklu(n))
            }

            let otvorene = azurirane.filter((n: any) =>
                n.status === 'otvorena' && !n.ponude.some((p: any) => p.stamparijaId === stamparijaId)
            )

            res.json(otvorene)
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'Greška prilikom učitavanja otvorenih nabavki.' })
        }
    }

    posaljiPonudu = async (req: express.Request, res: express.Response) => {
        let stamparijaId = req.body.stamparijaId
        let javnaNabavkaId = req.body.javnaNabavkaId
        let stavke = req.body.stavke as any[]

        try {
            let nabavka: any = await JavnaNabavkaModel.findById(javnaNabavkaId)

            if (!nabavka) {
                return res.status(404).json({ message: 'Javna nabavka nije pronađena.' })
            }

            nabavka = await proveriIsteklu(nabavka)

            if (nabavka.status !== 'otvorena') {
                return res.status(400).json({ message: 'Rok za podnošenje ponuda je istekao.' })
            }

            if (nabavka.ponude.some((p: any) => p.stamparijaId === stamparijaId)) {
                return res.status(400).json({ message: 'Već ste poslali ponudu za ovu javnu nabavku.' })
            }

            if (!stavke || stavke.length !== nabavka.stavke.length) {
                return res.status(400).json({ message: 'Morate poneti ponudu za sve tražene proizvode.' })
            }

            let stamparija: any = await StamparijaModel.findOne({ stamparijaId: stamparijaId })

            if (!stamparija) {
                return res.status(404).json({ message: 'Štamparija nije pronađena.' })
            }

            let obradjene = []
            let ukupno = 0

            for (let s of stavke) {
                let proizvod = stamparija.proizvodi.id(s.productId)

                if (!proizvod) {
                    return res.status(400).json({ message: `Proizvod za stavku "${s.naziv}" nije pronađen u vašoj ponudi.` })
                }

                if (proizvod.kolicinaNaLageru < s.kolicina) {
                    return res.status(400).json({ message: `Nemate dovoljno "${proizvod.naziv}" na stanju za ovu ponudu.` })
                }

                let ukupnaCena = s.jedinicnaCena * s.kolicina
                obradjene.push({
                    naziv: s.naziv,
                    kolicina: s.kolicina,
                    productId: s.productId,
                    jedinicnaCena: s.jedinicnaCena,
                    ukupnaCena: ukupnaCena
                })
                ukupno += ukupnaCena
            }

            let stamparijaUser = await UserModel.findOne({ stamparijaId: stamparijaId, type: 'stamparija' }, 'nazivFirme')

            nabavka.ponude.push({
                stamparijaId: stamparijaId,
                nazivStamparije: stamparijaUser ? stamparijaUser.nazivFirme : '',
                stavke: obradjene,
                ukupnaPonuda: ukupno
            })

            await nabavka.save()

            res.json({ message: 'ok' })
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'Greška prilikom slanja ponude.' })
        }
    }

    mojePonude = async (req: express.Request, res: express.Response) => {
        let stamparijaId = req.query.stamparijaId as string

        try {
            let sve = await JavnaNabavkaModel.find({ 'ponude.stamparijaId': stamparijaId }).sort({ raspisano: -1 })
            let azurirane = []

            for (let n of sve) {
                azurirane.push(await proveriIsteklu(n))
            }

            res.json(azurirane)
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'Greška prilikom učitavanja ponuda.' })
        }
    }
}
