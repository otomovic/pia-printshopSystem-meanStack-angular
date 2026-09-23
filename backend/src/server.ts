import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import userRouter from './routers/user.router'
import productRouter from './routers/product.router'
import stamparijaRouter from './routers/stamparija.router'
import fakturaRouter from './routers/faktura.router'
import categoryRouter from './routers/category.router'
import javnaNabavkaRouter from './routers/javna-nabavka.router'
import statistikaRouter from './routers/statistika.router'

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use('/uploads', express.static('uploads'));

const router = express.Router()

app.use('/', router)
router.use('/users', userRouter)
router.use('/products', productRouter)
router.use('/stamparije', stamparijaRouter)
router.use('/fakture', fakturaRouter)
router.use('/categories', categoryRouter)
router.use('/nabavke', javnaNabavkaRouter)
router.use('/statistika', statistikaRouter)

mongoose.connect("mongodb://localhost:27017/stamparija")
const conn = mongoose.connection
conn.once('open', ()=>{
    console.log("Database connected")
})
conn.on('error', err=>{
    console.error('Database connection error:', err)
})

app.get('/', (req, res)=> {res.send("Hello world!")})
app.listen(4000, ()=>console.log("Express running on port 4000!"))