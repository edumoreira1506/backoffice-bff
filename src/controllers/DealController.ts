import { Response } from 'express'
import { BaseController } from '@cig-platform/core'
import { AuthenticatedRequest } from '@cig-platform/types'

import DealAggregator from '@Aggregators/DealAggregator'

class DealController {
  constructor() {
    this.confirm = this.confirm.bind(this)
  }

  @BaseController.errorHandler()
  async confirm(req: AuthenticatedRequest, res: Response) {
    const dealId = req.params.dealId

    await DealAggregator.confirmDeal(dealId)

    return BaseController.successResponse(res, {})
  }
}

export default new DealController()
