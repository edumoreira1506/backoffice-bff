import express from 'express'

import withBreederPermission from '@Middlewares/withBreederPermission'
import withTokenAuthorization from '@Middlewares/withTokenAuthoritzation'
import BreederController from '@Controllers/BreederController'
import { withFileSupportFactory } from '@Middlewares/withFileSupport'

const router = express.Router()

router.patch(
  '/breeders/:breederId',
  withTokenAuthorization,
  withBreederPermission,
  withFileSupportFactory(['deletedFiles', 'newFiles']),
  BreederController.update,
)

router.get('/breeders/:breederId', withTokenAuthorization, withBreederPermission, BreederController.show)

export default router
