import express from 'express'

import withBreederPermission from '@Middlewares/withBreederPermission'
import withTokenAuthorization from '@Middlewares/withTokenAuthoritzation'
import BreederController from '@Controllers/BreederController'

const router = express.Router()

router.patch('/breeders/:breederId', withTokenAuthorization, withBreederPermission, BreederController.update)

export default router
