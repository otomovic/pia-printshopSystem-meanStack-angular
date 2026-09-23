import express from 'express'
import { JavnaNabavkaController } from '../controllers/javna-nabavka.controller'

const javnaNabavkaRouter = express.Router()

javnaNabavkaRouter.route('/').post(
    (req, res) => new JavnaNabavkaController().kreiraj(req, res)
)

javnaNabavkaRouter.route('/moje').get(
    (req, res) => new JavnaNabavkaController().moje(req, res)
)

javnaNabavkaRouter.route('/otvorene').get(
    (req, res) => new JavnaNabavkaController().otvorene(req, res)
)

javnaNabavkaRouter.route('/ponuda').post(
    (req, res) => new JavnaNabavkaController().posaljiPonudu(req, res)
)

javnaNabavkaRouter.route('/mojePonude').get(
    (req, res) => new JavnaNabavkaController().mojePonude(req, res)
)

export default javnaNabavkaRouter
