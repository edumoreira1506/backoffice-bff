import express from 'express'
import { withBodyValidation } from '@cig-platform/core'

import withBreederPermission from '@Middlewares/withBreederPermission'
import withDealPermission, { withDirectlyDealPermission } from '@Middlewares/withDealPermission'
import withTokenAuthorization from '@Middlewares/withTokenAuthoritzation'
import withFileSupport, { withFileSupportFactory } from '@Middlewares/withFileSupport'

import BreederController from '@Controllers/BreederController'
import PoultryController from '@Controllers/PoultryController'
import RegisterController from '@Controllers/RegisterController'
import AdvertisingController from '@Controllers/AdvertisingController'
import AdvertisingQuestionAnswerController from '@Controllers/AdvertisingQuestionAnswerController'
import DealController from '@Controllers/DealController'

import { storeAdvertisingSchema, updateAdvertisingSchema } from '@Schemas/AdvertisingSchemas'
import { transferPoultrySchema } from '@Schemas/PoultrySchemas'
import { storeAdvertisingQuestionAnswerSchema } from '@Schemas/AdvertisingQuestionAnswerSchemas'
import { cancelDealSchema } from '@Schemas/DealSchemas'

const router = express.Router()

router.patch(
  '/breeders/:breederId',
  withTokenAuthorization,
  withBreederPermission,
  withFileSupportFactory(['newImages']),
  BreederController.update,
)

router.get('/breeders/:breederId', withTokenAuthorization, withBreederPermission, BreederController.show)

router.get(
  '/breeders/:breederId/deals',
  withTokenAuthorization,
  withBreederPermission,
  DealController.index
)

router.get(
  '/breeders/:breederId/deals/:dealId',
  withTokenAuthorization,
  withBreederPermission,
  withDirectlyDealPermission,
  DealController.show
)

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
  '/breeders/:breederId/poultries/:poultryId/transfer',
  withBodyValidation(transferPoultrySchema),
  withTokenAuthorization,
  withBreederPermission,
  PoultryController.transfer
)

router.post(
  '/breeders/:breederId/poultries/:poultryId/advertisings',
  withBodyValidation(storeAdvertisingSchema),
  withTokenAuthorization,
  withBreederPermission,
  AdvertisingController.store
)

router.patch(
  '/breeders/:breederId/poultries/:poultryId/advertisings/:advertisingId',
  withBodyValidation(updateAdvertisingSchema),
  withTokenAuthorization,
  withBreederPermission,
  AdvertisingController.update
)

router.delete(
  '/breeders/:breederId/poultries/:poultryId/advertisings/:advertisingId',
  withTokenAuthorization,
  withBreederPermission,
  AdvertisingController.remove
)

router.post(
  '/breeders/:breederId/poultries/:poultryId/advertisings/:advertisingId/questions/:questionId/answers',
  withBodyValidation(storeAdvertisingQuestionAnswerSchema),
  withTokenAuthorization,
  withBreederPermission,
  AdvertisingQuestionAnswerController.store
)

router.post(
  '/breeders/:breederId/poultries/:poultryId/advertisings/:advertisingId/deals/:dealId/confirm',
  withTokenAuthorization,
  withBreederPermission,
  DealController.confirm
)

router.post(
  '/breeders/:breederId/poultries/:poultryId/advertisings/:advertisingId/deals/:dealId/cancel',
  withBodyValidation(cancelDealSchema),
  withTokenAuthorization,
  withDealPermission,
  DealController.cancel
)

router.post(
  '/breeders/:breederId/poultries/:poultryId/advertisings/:advertisingId/deals/:dealId/receive',
  withTokenAuthorization,
  withDealPermission,
  DealController.receive
)

export default router
