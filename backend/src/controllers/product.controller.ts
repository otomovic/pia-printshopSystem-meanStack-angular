import express from 'express'
import StamparijaModel from '../models/stamparija'
import UserModel from '../models/user'
import KomentarModel from '../models/komentar'
import OcenaModel from '../models/ocena'

const AKTIVAN_NA_STANJU = { 'proizvodi.aktivan': true, 'proizvodi.kolicinaNaLageru': { $gt: 0 } }

export class ProductController{
    getTop5Products = async (req: express.Request, res: express.Response) => {
        StamparijaModel.aggregate([
            { $unwind: '$proizvodi' },
            { $match: AKTIVAN_NA_STANJU },
            { $sort: { 'proizvodi.brojLajkova': -1 } },
            { $limit: 5 },
            { $project: {
                _id: '$proizvodi._id',
                naziv: '$proizvodi.naziv',
                slikaGlavna: '$proizvodi.slikaUrl',
                brojLajkova: '$proizvodi.brojLajkova',
                brojDislajkova: '$proizvodi.brojDislajkova'
            } }
        ]).then((products: any) =>{
            res.json(products)
        }).catch((err: any)=>{
            console.log(err)
            res.json({message:"Failed"})
        })
    }
    getCategories = async (req: express.Request, res: express.Response) => {
        StamparijaModel.aggregate([
            { $unwind: '$proizvodi' },
            { $match: AKTIVAN_NA_STANJU },
            { $group: { _id: '$proizvodi.kategorija' } }
        ]).then((rows: any) =>{
            res.json(rows.map((r: any) => r._id).filter((k: any) => !!k))
        }).catch((err: any)=>{
            console.log(err)
            res.json({message:"Failed"})
        })
    }
    search = async (req: express.Request, res: express.Response) => {
        let naziv = req.query.naziv as string
        let kategorija = req.query.kategorija as string

        let filter: any = { ...AKTIVAN_NA_STANJU }

        if (naziv) {
            filter['proizvodi.naziv'] = { $regex: naziv, $options: 'i' }
        }
        if (kategorija) {
            filter['proizvodi.kategorija'] = kategorija
        }

        try {
            let rezultati: any = await StamparijaModel.aggregate([
                { $unwind: '$proizvodi' },
                { $match: filter },
                { $project: {
                    _id: '$proizvodi._id',
                    naziv: '$proizvodi.naziv',
                    categoryName: '$proizvodi.kategorija',
                    jedinicnaCena: '$proizvodi.jedinicnaCena',
                    slikaGlavna: '$proizvodi.slikaUrl',
                    stamparijaId: '$stamparijaId'
                } }
            ])

            let stamparijaIds = [...new Set(rezultati.map((r: any) => r.stamparijaId))]
            let stamparije: any = await UserModel.find({ stamparijaId: { $in: stamparijaIds }, type: 'stamparija' } as any, 'stamparijaId nazivFirme')

            let nazivPoStamparijaId: any = {}
            stamparije.forEach((s: any) => nazivPoStamparijaId[s.stamparijaId] = s.nazivFirme)

            res.json(rezultati.map((r: any) => ({
                _id: r._id,
                naziv: r.naziv,
                categoryName: r.categoryName,
                jedinicnaCena: r.jedinicnaCena,
                slikaGlavna: r.slikaGlavna,
                printerName: nazivPoStamparijaId[r.stamparijaId] || ''
            })))
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'Greška prilikom pretrage.' })
        }
    }

    getById = async (req: express.Request, res: express.Response) => {
        let id = req.params.id as string

        try {
            let stamparija: any = await StamparijaModel.findOne({ 'proizvodi._id': id })
            let proizvod = stamparija ? stamparija.proizvodi.id(id) : null

            if (!stamparija || !proizvod) {
                return res.status(404).json({ message: 'Proizvod nije pronađen.' })
            }

            let stamparijaUser: any = await UserModel.findOne({ stamparijaId: stamparija.stamparijaId, type: 'stamparija' }, 'nazivFirme grad')

            res.json({
                _id: proizvod._id,
                naziv: proizvod.naziv,
                opisDugacak: proizvod.opis,
                categoryName: proizvod.kategorija,
                jedinicnaCena: proizvod.jedinicnaCena,
                slikaUrl: proizvod.slikaUrl,
                slikeDodatne: proizvod.dodatneSlike,
                brojLajkova: proizvod.brojLajkova,
                brojDislajkova: proizvod.brojDislajkova,
                printerName: stamparijaUser ? stamparijaUser.nazivFirme : '',
                stamparijaId: stamparija.stamparijaId,
                grad: stamparijaUser ? (stamparijaUser.grad || '') : '',
                kolicinaNaLageru: proizvod.kolicinaNaLageru,
                dostupneBoje: (proizvod.dostupneBoje && proizvod.dostupneBoje.length) ? proizvod.dostupneBoje : ['Bela'],
                uslugeStampe: proizvod.uslugeStampe
            })
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'Greška prilikom učitavanja proizvoda.' })
        }
    }

    addProduct = async (req: express.Request, res: express.Response) => {
        let stamparijaId = req.body.stamparijaId

        if (!stamparijaId || !req.body.naziv || !req.body.sifra) {
            return res.status(400).json({ message: 'Nedostaju podaci.' })
        }

        let files = req.files as { [fieldname: string]: Express.Multer.File[] }
        let slikaGlavna = files?.slikaGlavna?.[0]?.filename
        let dodatneSlike = (files?.dodatneSlike || []).map(f => f.filename)

        let dostupneBoje = req.body.dostupneBoje
            ? String(req.body.dostupneBoje).split(',').map((b: string) => b.trim()).filter((b: string) => !!b)
            : undefined

        let uslugeStampe = req.body.uslugeStampe ? JSON.parse(req.body.uslugeStampe) : []

        let noviProizvod: any = {
            _id: `${stamparijaId}-${req.body.sifra}`,
            sifra: req.body.sifra,
            naziv: req.body.naziv,
            opis: req.body.opis,
            kategorija: req.body.kategorija,
            potkategorija: req.body.potkategorija,
            jedinicnaCena: req.body.jedinicnaCena,
            kolicinaNaLageru: req.body.kolicinaNaLageru,
            uslugeStampe: uslugeStampe,
            aktivan: true
        }

        if (dostupneBoje) noviProizvod.dostupneBoje = dostupneBoje
        if (slikaGlavna) noviProizvod.slikaUrl = slikaGlavna
        if (dodatneSlike.length) noviProizvod.dodatneSlike = dodatneSlike

        try {
            let stamparija: any = await StamparijaModel.findOne({ stamparijaId: stamparijaId })

            if (stamparija && stamparija.proizvodi.some((p: any) => p.sifra === req.body.sifra)) {
                return res.status(409).json({ message: 'Proizvod sa ovom šifrom već postoji.' })
            }

            if (!stamparija) {
                stamparija = new StamparijaModel({ stamparijaId: stamparijaId, proizvodi: [] })
            }

            stamparija.proizvodi.push(noviProizvod)
            await stamparija.save()

            let dodat = stamparija.proizvodi[stamparija.proizvodi.length - 1]

            res.json({ message: 'ok', _id: dodat._id })
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'Greška prilikom čuvanja proizvoda.' })
        }
    }

    reaguj = async (req: express.Request, res: express.Response) => {
        let id = req.params.id as string
        let username = req.body.username
        let reakcija = req.body.reakcija as string
        let tekst = req.body.tekst as string

        try {
            let stamparija: any = await StamparijaModel.findOne({ 'proizvodi._id': id })
            let proizvod = stamparija ? stamparija.proizvodi.id(id) : null

            if (!stamparija || !proizvod) {
                return res.status(404).json({ message: 'Proizvod nije pronađen.' })
            }

            if (reakcija === 'lajk') proizvod.brojLajkova += 1
            else if (reakcija === 'dislajk') proizvod.brojDislajkova += 1

            await stamparija.save()

            if (reakcija === 'lajk' || reakcija === 'dislajk') {
                await new OcenaModel({ productId: id, naziv: proizvod.naziv, tip: reakcija }).save()
            }

            if (tekst) {
                await new KomentarModel({ productId: id, username: username, tekst: tekst }).save()
            }

            res.json({ message: 'ok' })
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'Greška prilikom čuvanja reakcije.' })
        }
    }

    komentari = async (req: express.Request, res: express.Response) => {
        let id = req.params.id as string

        KomentarModel.find({ productId: id }).sort({ _id: -1 }).limit(5).then((komentari) => {
            res.json(komentari)
        }).catch((err) => {
            console.log(err)
            res.status(500).json({ message: 'Greška prilikom učitavanja komentara.' })
        })
    }

    mine = async (req: express.Request, res: express.Response) => {
        let stamparijaId = req.query.stamparijaId as string

        if (!stamparijaId) {
            return res.status(400).json({ message: 'Nedostaje stamparijaId.' })
        }

        StamparijaModel.findOne({ stamparijaId: stamparijaId }).then((stamparija: any) => {
            res.json(stamparija ? stamparija.proizvodi : [])
        }).catch((err) => {
            console.log(err)
            res.status(500).json({ message: 'Greška prilikom učitavanja proizvoda.' })
        })
    }

    updateKolicina = async (req: express.Request, res: express.Response) => {
        let stamparijaId = req.body.stamparijaId
        let productId = req.body.productId
        let kolicinaNaLageru = req.body.kolicinaNaLageru

        try {
            let stamparija: any = await StamparijaModel.findOne({ stamparijaId: stamparijaId })
            let proizvod = stamparija ? stamparija.proizvodi.id(productId) : null

            if (!stamparija || !proizvod) {
                return res.status(404).json({ message: 'Proizvod nije pronađen.' })
            }

            proizvod.kolicinaNaLageru = kolicinaNaLageru
            await stamparija.save()

            res.json({ message: 'ok' })
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'Greška prilikom ažuriranja količine.' })
        }
    }

}
