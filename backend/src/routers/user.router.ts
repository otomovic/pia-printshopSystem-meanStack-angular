import express, { Router } from 'express'
import { UserController } from '../controllers/user.controller'
import { upload } from '../storage/storage'

const userRouter = express.Router()

userRouter.route('/login').post(
    (req, res) => new UserController().login(req, res)
)
userRouter.route('/loginAdmin').post(
    (req, res) => new UserController().loginAdmin(req, res)
)

userRouter.post(
    '/register',
    upload.single('profileImage'),
    (req, res) => new UserController().register(req, res)
);

userRouter.route('/accepted').get(
    (req, res) => new UserController().getAcceptedUsers(req, res)
)

userRouter.route('/unaccepted').get(
    (req, res) => new UserController().getUnacceptedUsers(req, res)
)

userRouter.route('/accept').post(
    (req, res) => new UserController().acceptUser(req, res)
)

userRouter.route('/reject').post(
    (req, res) => new UserController().rejectUser(req, res)
)

userRouter.route('/delete').post(
    (req, res) => new UserController().deleteUser(req, res)
)

userRouter.post(
    '/update',
    upload.single('profileImage'),
    (req, res) => new UserController().updateProfile(req, res)
);

export default userRouter