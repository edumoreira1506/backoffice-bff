import { Response } from 'express'
import { BaseController, NotFoundError } from '@cig-platform/core'
import { AuthenticatedRequest } from '@cig-platform/types'

import AdvertisingAggregator from '@Aggregators/AdvertisingAggregator'
import i18n from '@Configs/i18n'

class AdvertisingController {
  constructor() {
    this.store = this.store.bind(this)
    this.update = this.update.bind(this)
  }

  @BaseController.errorHandler()
  async store(req: AuthenticatedRequest, res: Response) {
    const advertising = req.body.advertising
    const poultryId = req.params.poultryId
    const breederId = req.params.breederId
    const merchant = req.merchant

    if (!merchant) throw new NotFoundError()

    const advertisingData = await AdvertisingAggregator.postAdvertising(
      { ...advertising, externalId: poultryId },
      merchant.id,
      breederId
    )

    return BaseController.successResponse(res, { advertising: advertisingData })
  }

  @BaseController.errorHandler()
  @BaseController.actionHandler(i18n.__('common.removed'))
  async remove(req: AuthenticatedRequest) {
    const merchant = req.merchant

    if (!merchant) throw new NotFoundError()

    const merchantId = merchant.id
    const advertisingId = req.params.advertisingId
    const breederId = req.params.breederId
    const poultryId = req.params.poultryId

    await AdvertisingAggregator.removeAdvertising({ merchantId, advertisingId, breederId, poultryId })
  }

  @BaseController.errorHandler()
  @BaseController.actionHandler(i18n.__('common.updated'))
  async update(req: AuthenticatedRequest) {
    const merchant = req.merchant

    if (!merchant) throw new NotFoundError()

    const merchantId = merchant.id
    const advertisingId = req.params.advertisingId
    const price = Number(req.body.price)

    await AdvertisingAggregator.updateAdvertising({ advertisingId, merchantId, price })
  }
}

export default new AdvertisingController()
