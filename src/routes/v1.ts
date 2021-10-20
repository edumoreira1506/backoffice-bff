import express from 'express'

import withBreederPermission from '@Middlewares/withBreederPermission'
import withTokenAuthorization from '@Middlewares/withTokenAuthoritzation'
import withFileSupport, { withFileSupportFactory } from '@Middlewares/withFileSupport'

import BreederController from '@Controllers/BreederController'
import PoultryController from '@Controllers/PoultryController'

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
  withFileSupport,
  PoultryController.store
)

router.get(
  '/breeders/:breederId/poultries',
  withTokenAuthorization,
  withBreederPermission,
  PoultryController.index
)

router.get(
  '/breeders/:breederId/poultries/:poultryId',
  withTokenAuthorization,
  withBreederPermission,
  PoultryController.show,
)

router.patch(
  '/breeders/:breederId/poultries/:poultryId',
  withTokenAuthorization,
  withBreederPermission,
  withFileSupport,
  PoultryController.update
)

export default router
