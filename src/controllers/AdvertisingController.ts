import { Response } from 'express'
import { BaseController, NotFoundError } from '@cig-platform/core'
import { AuthenticatedRequest } from '@cig-platform/types'

import AdvertisingAggregator from '@Aggregators/AdvertisingAggregator'

class AdvertisingController {
  constructor() {
    this.store = this.store.bind(this)
  }

  @BaseController.errorHandler()
  async store(req: AuthenticatedRequest, res: Response) {
    const advertising = req.body.advertising
    const poultryId = req.params.poultryId
    const merchant = req.merchant

    if (!merchant) throw new NotFoundError()

    const advertisingData = await AdvertisingAggregator.postAdvertising({ ...advertising, externalId: poultryId }, merchant.id)

    return BaseController.successResponse(res, { advertising: advertisingData })
  }

  @BaseController.errorHandler()
  async remove(req: AuthenticatedRequest) {
    const merchant = req.merchant

    if (!merchant) throw new NotFoundError()

    const merchantId = merchant.id
    const advertisingId = req.params.advertisingId

    await AdvertisingAggregator.removeAdvertising(merchantId, advertisingId)
  }
}

export default new AdvertisingController()
