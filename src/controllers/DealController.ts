import { Response } from 'express'
import { AuthError, BaseController } from '@cig-platform/core'
import { AuthenticatedRequest } from '@cig-platform/types'

import DealAggregator from '@Aggregators/DealAggregator'
import i18n from '@Configs/i18n'

class DealController {
  constructor() {
    this.confirm = this.confirm.bind(this)
    this.cancel = this.cancel.bind(this)
    this.receive = this.receive.bind(this)
    this.index = this.index.bind(this)
  }

  @BaseController.errorHandler()
  async index(req: AuthenticatedRequest, res: Response) {
    const merchant = req.merchant

    if (!merchant) throw new AuthError()

    const filter = String(req?.query?.as ?? 'SELLER')
    const deals = await DealAggregator.getDeals(filter, merchant)

    return BaseController.successResponse(res, { deals })
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
    const reason = req.body.reason

    await DealAggregator.cancelDeal(dealId, reason)
  }

  @BaseController.errorHandler()
  @BaseController.actionHandler(i18n.__('common.updated'))
  async receive(req: AuthenticatedRequest) {
    const dealId = req.params.dealId
    const merchant = req.merchant

    if (!merchant) throw new AuthError()

    await DealAggregator.finishDeal(dealId, merchant)
  }
}

export default new DealController()
