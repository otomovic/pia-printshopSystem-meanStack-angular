import express from 'express'
import { CategoryController } from '../controllers/category.controller'

const categoryRouter = express.Router()

categoryRouter.route('/').get(
    (req, res) => new CategoryController().getAll(req, res)
)

categoryRouter.route('/').post(
    (req, res) => new CategoryController().dodajKategoriju(req, res)
)

categoryRouter.route('/:id/potkategorija').post(
    (req, res) => new CategoryController().dodajPotkategoriju(req, res)
)

export default categoryRouter
