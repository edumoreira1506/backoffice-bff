import express from 'express'

import withBreederPermission from '@Middlewares/withBreederPermission'
import withTokenAuthorization from '@Middlewares/withTokenAuthoritzation'
import BreederController from '@Controllers/BreederController'
import withFileSupport from '@Middlewares/withFileSupport'

const router = express.Router()

router.patch('/breeders/:breederId', withTokenAuthorization, withBreederPermission, withFileSupport, BreederController.update)

export default router
