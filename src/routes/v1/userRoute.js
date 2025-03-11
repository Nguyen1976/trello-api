import express from 'express'
import { userValidation } from '~/validations/userValidation'
import { userController } from '~/controllers/userController'

const Router = express.Router()

Router.route('/register').post(
  userValidation.createNew,
  userController.createNew
)

export const userRoute = Router
