import {
  DealServiceClient as IDealServiceClient,
  PoultryServiceClient as IPoultryServiceClient,
  AdvertisingServiceClient as IAdvertisingServiceClient,
  AuthError,
} from '@cig-platform/core'

import DealServiceClient from '@Clients/DealServiceClient'
import PoultryServiceClient from '@Clients/PoultryServiceClient'
import AdvertisingServiceClient from '@Clients/AdvertisingServiceClient'
import { DealEventValueEnum } from '@cig-platform/enums'
import AlreadyConfirmedError from '@Errors/AlreadyConfirmedError'
import FinishedDealError from '@Errors/FinishedDealError'
import { IMerchant } from '@cig-platform/types'
import PoultryAggregator from './PoultryAggregator'

export class DealAggregator {
  private _dealServiceClient: IDealServiceClient;
  private _poultryServiceClient: IPoultryServiceClient;
  private _advertisingServiceClient: IAdvertisingServiceClient;
  
  constructor(
    dealServiceClient: IDealServiceClient,
    poultryServiceClient: IPoultryServiceClient,
    advertisingServiceClient: IAdvertisingServiceClient
  ) {
    this._dealServiceClient = dealServiceClient
    this._poultryServiceClient = poultryServiceClient
    this._advertisingServiceClient = advertisingServiceClient

    this.confirmDeal = this.confirmDeal.bind(this)
    this.finishDeal = this.finishDeal.bind(this)
  }

  async finishDeal(dealId: string, merchant: IMerchant) {
    const breederOfRequest = await this._poultryServiceClient.getBreeder(merchant.externalId)
    const deal = await this._dealServiceClient.getDeal(dealId)
    const sellerMerchant = await this._advertisingServiceClient.getMerchant(deal.sellerId)
    const sellerBreeder = await this._poultryServiceClient.getBreeder(sellerMerchant.externalId)
    const advertising = await this._advertisingServiceClient.getAdvertising(deal.sellerId, deal.advertisingId)
    const poultryOfAdvertising = await this._poultryServiceClient.getPoultry(sellerBreeder.id, advertising.externalId)
    const isBuyer = deal.buyerId === merchant.id

    if (deal.finished || deal.cancelled) throw new FinishedDealError()
    if (!isBuyer) throw new AuthError()

    await this._dealServiceClient.updateDeal(dealId, { finished: true })
    
    await this._advertisingServiceClient.updateAdvertising(sellerMerchant.id, advertising.id, advertising.price, true)

    await this._dealServiceClient.registerDealEvent(dealId, {
      value: DealEventValueEnum.received,
      metadata: {}
    })

    await PoultryAggregator.transferPoultry(sellerBreeder.id, poultryOfAdvertising.id, breederOfRequest.id)
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

export default new DealAggregator(DealServiceClient, PoultryServiceClient, AdvertisingServiceClient)
