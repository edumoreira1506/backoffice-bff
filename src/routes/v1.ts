import express from 'express'
import { withBodyValidation } from '@cig-platform/core'

import withBreederPermission from '@Middlewares/withBreederPermission'
import withTokenAuthorization from '@Middlewares/withTokenAuthoritzation'
import { withFileSupportFactory } from '@Middlewares/withFileSupport'

import BreederController from '@Controllers/BreederController'
import PoultryController from '@Controllers/PoultryController'

import { storePoultrySchema } from '@Schemas/PoultrySchemas'

const router = express.Router()

router.patch(
  '/breeders/:breederId',
  withTokenAuthorization,
  withBreederPermission,
  withFileSupportFactory(['newImages']),
  BreederController.update,
)

router.get('/breeders/:breederId', withTokenAuthorization, withBreederPermission, BreederController.show)

router.post(
  '/breeders/:breederId/poultries',
  withTokenAuthorization,
  withBreederPermission,
  withBodyValidation(storePoultrySchema),
  PoultryController.store
)

export default router
