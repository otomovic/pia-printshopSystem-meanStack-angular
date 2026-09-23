import express from 'express'
import { FakturaController } from '../controllers/faktura.controller'

const fakturaRouter = express.Router()

fakturaRouter.route('/confirm').post(
    (req, res) => new FakturaController().confirm(req, res)
)

fakturaRouter.route('/mine').get(
    (req, res) => new FakturaController().mine(req, res)
)

fakturaRouter.route('/otkazi').post(
    (req, res) => new FakturaController().otkazi(req, res)
)

fakturaRouter.route('/primi').post(
    (req, res) => new FakturaController().primi(req, res)
)

fakturaRouter.route('/zaStamparija').get(
    (req, res) => new FakturaController().zaStamparija(req, res)
)

fakturaRouter.route('/napreduj').post(
    (req, res) => new FakturaController().napreduj(req, res)
)

export default fakturaRouter
