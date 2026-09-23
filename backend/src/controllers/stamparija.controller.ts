import express from 'express'
import UserModel from '../models/user'

export class StamparijaController{
    getPrintingCompanyNumber = async (req: express.Request, res: express.Response) => {
        UserModel.countDocuments({type: 'stamparija', accepted: true}).then((count)=>{
            res.json(count)
        }).catch((err)=>{
            console.log(err)
            res.json({message:"Failed"})
        })
    }
}
