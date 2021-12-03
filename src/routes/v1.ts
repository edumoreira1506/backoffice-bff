import express from 'express'
import { withBodyValidation } from '@cig-platform/core'

import withBreederPermission from '@Middlewares/withBreederPermission'
import withTokenAuthorization from '@Middlewares/withTokenAuthoritzation'
import withFileSupport, { withFileSupportFactory } from '@Middlewares/withFileSupport'

import BreederController from '@Controllers/BreederController'
import PoultryController from '@Controllers/PoultryController'
import RegisterController from '@Controllers/RegisterController'
import AdvertisingController from '@Controllers/AdvertisingController'
import { storeAdvertisingSchema } from '@Schemas/AdvertisingSchemas'

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

router.post(
  '/breeders/:breederId/poultries/:poultryId/registers',
  withTokenAuthorization,
  withBreederPermission,
  withFileSupport,
  RegisterController.store
)

router.get(
  '/breeders/:breederId/poultries/:poultryId/registers',
  withTokenAuthorization,
  withBreederPermission,
  RegisterController.index
)

router.post(
  '/breeders/:breederId/poultries/:poultryId/advertisings',
  withBodyValidation(storeAdvertisingSchema),
  withTokenAuthorization,
  withBreederPermission,
  AdvertisingController.store
)

router.delete(
  '/breeders/:breederId/poultries/:poultryId/advertisings/:advertisingId',
  withTokenAuthorization,
  withBreederPermission,
  AdvertisingController.remove
)

export default router
