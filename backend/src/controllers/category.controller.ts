import express from 'express'
import CategoryModel from '../models/category'

export class CategoryController{
    getAll = async (req: express.Request, res: express.Response) => {
        CategoryModel.find().then((categories)=>{
            res.json(categories)
        }).catch((err)=>{
            console.log(err)
            res.json({message:"Failed"})
        })
    }

    dodajKategoriju = async (req: express.Request, res: express.Response) => {
        let naziv = req.body.naziv

        if (!naziv) {
            return res.status(400).json({ message: 'Naziv kategorije je obavezan.' })
        }

        try {
            let kategorija = await new CategoryModel({ naziv: naziv, potkategorije: [] }).save()
            res.json({ message: 'ok', _id: kategorija._id })
        } catch (err: any) {
            if (err.code === 11000) {
                return res.json({ message: 'Kategorija sa ovim nazivom već postoji.' })
            }
            console.log(err)
            res.json({ message: 'Greška prilikom dodavanja kategorije.' })
        }
    }

    dodajPotkategoriju = async (req: express.Request, res: express.Response) => {
        let id = req.params.id
        let naziv = req.body.naziv

        if (!naziv) {
            return res.status(400).json({ message: 'Naziv potkategorije je obavezan.' })
        }

        try {
            let kategorija: any = await CategoryModel.findById(id)

            if (!kategorija) {
                return res.status(404).json({ message: 'Kategorija nije pronađena.' })
            }

            if (kategorija.potkategorije.some((p: any) => p.naziv === naziv)) {
                return res.json({ message: 'Potkategorija sa ovim nazivom već postoji.' })
            }

            kategorija.potkategorije.push({ naziv: naziv })
            await kategorija.save()

            res.json({ message: 'ok' })
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'Greška prilikom dodavanja potkategorije.' })
        }
    }
}
