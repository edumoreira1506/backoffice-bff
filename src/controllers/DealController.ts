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
    this.show = this.show.bind(this)
  }

  @BaseController.errorHandler()
  async index(req: AuthenticatedRequest, res: Response) {
    const merchant = req.merchant

    if (!merchant) throw new AuthError()

    const filter = String(req?.query?.as ?? 'SELLER')
    const page = Number(req?.query?.page ?? 0)
    const data = await DealAggregator.getDeals(filter, merchant, page)

    return BaseController.successResponse(res, data)
  }

  @BaseController.errorHandler()
  async show(req: AuthenticatedRequest, res: Response) {
    const merchant = req.merchant
    const dealId = req.params.dealId

    if (!merchant) throw new AuthError()

    const deal = await DealAggregator.getDeal(merchant, dealId)

    return BaseController.successResponse(res, deal)
  }

  @BaseController.errorHandler()
  @BaseController.actionHandler(i18n.__('common.updated'))
  async confirm(req: AuthenticatedRequest) {
    const dealId = req.params.dealId
    const advertisingId = req.params.advertisingId

    await DealAggregator.confirmDeal({ dealId, advertisingId })
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

    await DealAggregator.finishDeal(dealId)
  }
}

export default new DealController()
