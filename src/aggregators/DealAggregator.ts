import {
  DealServiceClient as IDealServiceClient,
  PoultryServiceClient as IPoultryServiceClient,
  AdvertisingServiceClient as IAdvertisingServiceClient,
} from '@cig-platform/core'

import DealServiceClient from '@Clients/DealServiceClient'
import PoultryServiceClient from '@Clients/PoultryServiceClient'
import AdvertisingServiceClient from '@Clients/AdvertisingServiceClient'
import { DealEventValueEnum, RegisterTypeEnum } from '@cig-platform/enums'
import AlreadyConfirmedError from '@Errors/AlreadyConfirmedError'
import FinishedDealError from '@Errors/FinishedDealError'
import { IMerchant, IPoultry } from '@cig-platform/types'
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
    this.cancelDeal = this.cancelDeal.bind(this)
    this.getDeals = this.getDeals.bind(this)
    this.getDeal = this.getDeal.bind(this)
  }

  async getDeals(filter: string, merchant: IMerchant) {
    const merchantId = merchant.id
    const params = filter === 'SELLER' ? { sellerId: merchantId } : { buyerId: merchantId }
    const deals = await this._dealServiceClient.getDeals(params)
    const dealsWithPoultryAndAdvertising = await Promise.all(deals.map(async (deal) => {
      const advertising = await this._advertisingServiceClient.getAdvertising(deal.sellerId, deal.advertisingId)
      const sellerMerchant = await this._advertisingServiceClient.getMerchant(deal.sellerId)
      const buyerMerchant = await this._advertisingServiceClient.getMerchant(deal.buyerId)
      const poultry = await this._poultryServiceClient.getPoultryDirectly(advertising.externalId) as IPoultry & { breederId: string; }
      const measurementAndWeight = await this._poultryServiceClient.getRegisters(poultry.breederId, poultry.id, RegisterTypeEnum.MeasurementAndWeighing)
      const breeder = await this._poultryServiceClient.getBreeder(
        merchantId === sellerMerchant.id ? buyerMerchant.externalId : sellerMerchant.externalId
      )

      return { deal, advertising, poultry, breeder, measurementAndWeight }
    }))

    return dealsWithPoultryAndAdvertising
  }

  async getDeal(merchant: IMerchant, dealId: string) {
    const deal = await this._dealServiceClient.getDeal(dealId)
    const advertising = await this._advertisingServiceClient.getAdvertising(deal.sellerId, deal.advertisingId)
    const poultry = await this._poultryServiceClient.getPoultryDirectly(advertising.externalId)
    const merchantOfSeller = await this._advertisingServiceClient.getMerchant(deal.sellerId)
    const merchantOfBuyer = await this._advertisingServiceClient.getMerchant(deal.buyerId)
    const breederId = deal.sellerId === merchant.id ? merchantOfBuyer.externalId : merchantOfSeller.externalId
    const breeder = await this._poultryServiceClient.getBreeder(breederId)
    const breederContacts = await this._poultryServiceClient.getBreederContacts(breeder.id)
    const events = await this._dealServiceClient.getDealEvents(dealId)

    return { deal, advertising, poultry, breeder, events, breederContacts }
  }

  async finishDeal(dealId: string) {
    const deal = await this._dealServiceClient.getDeal(dealId)
    const sellerMerchant = await this._advertisingServiceClient.getMerchant(deal.sellerId)
    const sellerBreeder = await this._poultryServiceClient.getBreeder(sellerMerchant.externalId)
    const buyerMerchant = await this._advertisingServiceClient.getMerchant(deal.buyerId)
    const buyerBreeder = await this._poultryServiceClient.getBreeder(buyerMerchant.id)
    const advertising = await this._advertisingServiceClient.getAdvertising(deal.sellerId, deal.advertisingId)
    const poultryOfAdvertising = await this._poultryServiceClient.getPoultry(sellerBreeder.id, advertising.externalId)

    if (deal.finished || deal.cancelled) throw new FinishedDealError()

    await this._dealServiceClient.registerDealEvent(dealId, {
      value: DealEventValueEnum.received,
      metadata: {}
    })

    await this._dealServiceClient.updateDeal(dealId, { finished: true })
    await this._advertisingServiceClient.updateAdvertising(sellerMerchant.id, advertising.id, advertising.price, true)

    await PoultryAggregator.transferPoultry(
      sellerBreeder.id,
      poultryOfAdvertising.id,
      buyerBreeder.id,
      sellerMerchant.id
    )
  }

  async confirmDeal({ dealId, advertisingId }: { dealId: string; advertisingId: string; }) {
    const events = await this._dealServiceClient.getDealEvents(dealId)

    if (events.some(event => event.value === DealEventValueEnum.confirmed)) throw new AlreadyConfirmedError()

    const deals = await this._dealServiceClient.getDeals({ advertisingId })

    deals.forEach(deal => {
      if (deal.id !== dealId) {
        this.cancelDeal(deal.id, 'Anúncio foi comprado por outro criador')
      }
    })

    return this._dealServiceClient.registerDealEvent(dealId, {
      value: DealEventValueEnum.confirmed,
    })
  }

  async cancelDeal(dealId: string, reason: string) {
    await this._dealServiceClient.registerDealEvent(dealId, {
      value: DealEventValueEnum.cancelled,
      metadata: { reason }
    })

    return this._dealServiceClient.updateDeal(dealId, { cancelled: true })
  }
}

export default new DealAggregator(DealServiceClient, PoultryServiceClient, AdvertisingServiceClient)
