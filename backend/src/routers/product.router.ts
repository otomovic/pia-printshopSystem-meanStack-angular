import express, { Router } from 'express'
import { UserController } from '../controllers/user.controller'
import { ProductController } from '../controllers/product.controller'
import { uploadProduct } from '../storage/storage'

const productRouter = express.Router()

productRouter.route('/top5').get(
    (req, res) => new ProductController().getTop5Products(req, res)
)

productRouter.route('/categories').get(
    (req, res) => new ProductController().getCategories(req, res)
)

productRouter.route('/search').get(
    (req, res) => new ProductController().search(req, res)
)

productRouter.post(
    '/',
    uploadProduct.fields([{ name: 'slikaGlavna', maxCount: 1 }, { name: 'dodatneSlike', maxCount: 3 }]),
    (req, res) => new ProductController().addProduct(req, res)
);

productRouter.route('/mine').get(
    (req, res) => new ProductController().mine(req, res)
)

productRouter.route('/kolicina').post(
    (req, res) => new ProductController().updateKolicina(req, res)
)

productRouter.route('/:id').get(
    (req, res) => new ProductController().getById(req, res)
)

productRouter.route('/:id/reaguj').post(
    (req, res) => new ProductController().reaguj(req, res)
)

productRouter.route('/:id/komentari').get(
    (req, res) => new ProductController().komentari(req, res)
)

export default productRouter