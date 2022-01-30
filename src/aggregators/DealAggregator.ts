import {
  DealServiceClient as IDealServiceClient,
} from '@cig-platform/core'

import DealServiceClient from '@Clients/DealServiceClient'
import { DealEventValueEnum } from '@cig-platform/enums'
import AlreadyConfirmedError from '@Errors/AlreadyConfirmedError'

export class DealAggregator {
  private _dealServiceClient: IDealServiceClient;
  
  constructor(
    dealServiceClient: IDealServiceClient,
  ) {
    this._dealServiceClient = dealServiceClient

    this.confirmDeal = this.confirmDeal.bind(this)
  }

  async confirmDeal(dealId: string) {
    const events = await this._dealServiceClient.getDealEvents(dealId)

    if (events.some(event => event.value === DealEventValueEnum.confirmed)) throw new AlreadyConfirmedError()

    return this._dealServiceClient.registerDealEvent(dealId, {
      value: DealEventValueEnum.confirmed,
    })
  }

  async cancelDeal(dealId: string, reason: string) {
    await this._dealServiceClient.updateDeal(dealId, { cancelled: true })

    return this._dealServiceClient.registerDealEvent(dealId, {
      value: DealEventValueEnum.cancelled,
      metadata: { reason }
    })
  }
}

export default new DealAggregator(DealServiceClient)
