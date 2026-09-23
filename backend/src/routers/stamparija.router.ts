import express from 'express'
import { StamparijaController } from '../controllers/stamparija.controller'

const stamparijaRouter = express.Router()

stamparijaRouter.route('/printingCompanyNumber').get(
    (req, res) => new StamparijaController().getPrintingCompanyNumber(req, res)
)

export default stamparijaRouter
