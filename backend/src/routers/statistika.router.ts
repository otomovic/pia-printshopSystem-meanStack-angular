import express from 'express'
import { StatistikaController } from '../controllers/statistika.controller'

const statistikaRouter = express.Router()

statistikaRouter.route('/promet').get(
    (req, res) => new StatistikaController().promet(req, res)
)

statistikaRouter.route('/najnarucivaniji').get(
    (req, res) => new StatistikaController().najnarucivaniji(req, res)
)

statistikaRouter.route('/ocene').get(
    (req, res) => new StatistikaController().ocene(req, res)
)

export default statistikaRouter
