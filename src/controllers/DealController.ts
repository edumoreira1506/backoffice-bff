import { BaseController } from '@cig-platform/core'
import { AuthenticatedRequest } from '@cig-platform/types'

import DealAggregator from '@Aggregators/DealAggregator'
import i18n from '@Configs/i18n'

class DealController {
  constructor() {
    this.confirm = this.confirm.bind(this)
    this.cancel = this.cancel.bind(this)
  }

  @BaseController.errorHandler()
  @BaseController.actionHandler(i18n.__('common.updated'))
  async confirm(req: AuthenticatedRequest) {
    const dealId = req.params.dealId

    await DealAggregator.confirmDeal(dealId)
  }

  @BaseController.errorHandler()
  @BaseController.actionHandler(i18n.__('common.updated'))
  async cancel(req: AuthenticatedRequest) {
    const dealId = req.params.dealId
    const reason = req.body.deal

    await DealAggregator.cancelDeal(dealId, reason)
  }
}

export default new DealController()
