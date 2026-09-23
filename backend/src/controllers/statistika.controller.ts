import express from 'express'
import FakturaModel from '../models/faktura'
import OcenaModel from '../models/ocena'

function formatDatum(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export class StatistikaController {
    promet = async (req: express.Request, res: express.Response) => {
        try {
            let pre3Meseca = new Date()
            pre3Meseca.setMonth(pre3Meseca.getMonth() - 3)
            let granica = formatDatum(pre3Meseca)

            let fakture = await FakturaModel.find({ datum: { $gte: granica } })

            let prometStamparije: any = {}

            fakture.forEach((f: any) => {
                if (!prometStamparije[f.stamparijaId]) {
                    prometStamparije[f.stamparijaId] = { stamparijaId: f.stamparijaId, nazivStamparije: f.nazivStamparije, ukupno: 0 }
                }
                prometStamparije[f.stamparijaId].ukupno += f.ukupanIznos || 0
            })

            let rezultat = Object.values(prometStamparije).sort((a: any, b: any) => b.ukupno - a.ukupno)

            res.json(rezultat)
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'Greška prilikom učitavanja statistike prometa.' })
        }
    }

    najnarucivaniji = async (req: express.Request, res: express.Response) => {
        try {
            let pre30Dana = new Date()
            pre30Dana.setDate(pre30Dana.getDate() - 30)
            let granica = formatDatum(pre30Dana)

            let fakture = await FakturaModel.find({ datum: { $gte: granica } })

            let kolicinePoProizvodu: any = {}
            let ukupnaKolicina = 0

            fakture.forEach((f: any) => {
                f.stavke.forEach((s: any) => {
                    if (!kolicinePoProizvodu[s.naziv]) {
                        kolicinePoProizvodu[s.naziv] = 0
                    }
                    kolicinePoProizvodu[s.naziv] += s.kolicina || 0
                    ukupnaKolicina += s.kolicina || 0
                })
            })

            let rezultat = Object.keys(kolicinePoProizvodu).map((naziv) => ({
                naziv: naziv,
                kolicina: kolicinePoProizvodu[naziv],
                procenat: ukupnaKolicina ? Math.round((kolicinePoProizvodu[naziv] / ukupnaKolicina) * 1000) / 10 : 0
            })).sort((a, b) => b.kolicina - a.kolicina)

            res.json(rezultat)
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'Greška prilikom učitavanja statistike narudžbina.' })
        }
    }

    ocene = async (req: express.Request, res: express.Response) => {
        try {
            let ocene = await OcenaModel.find().sort({ datum: 1, _id: 1 })

            let proizvodi: any = {}

            ocene.forEach((o: any) => {
                if (!proizvodi[o.productId]) {
                    proizvodi[o.productId] = { productId: o.productId, naziv: o.naziv, tacke: [], tekuce: 0 }
                }

                let p = proizvodi[o.productId]
                p.tekuce += o.tip === 'lajk' ? 1 : -1

                let poslednja = p.tacke[p.tacke.length - 1]
                if (poslednja && poslednja.datum === o.datum) {
                    poslednja.vrednost = p.tekuce
                } else {
                    p.tacke.push({ datum: o.datum, vrednost: p.tekuce })
                }
            })

            res.json(Object.values(proizvodi))
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'Greška prilikom učitavanja statistike ocena.' })
        }
    }
}
