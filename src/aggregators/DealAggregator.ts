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
      dealId,
      value: DealEventValueEnum.confirmed,
    })
  }
}

export default new DealAggregator(DealServiceClient)
