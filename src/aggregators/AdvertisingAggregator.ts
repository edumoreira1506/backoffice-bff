import {
  AdvertisingServiceClient as IAdvertisingServiceClient,
  PoultryServiceClient as IPoultryServiceClient,
  DealServiceClient as IDealServiceClient
} from '@cig-platform/core'
import { IAdvertising } from '@cig-platform/types'
import { DealEventValueEnum, RegisterTypeEnum } from '@cig-platform/enums'

import AdvertisingServiceClient from '@Clients/AdvertisingServiceClient'
import PoultryServiceClient from '@Clients/PoultryServiceClient'
import DealServiceClient from '@Clients/DealServiceClient'
import DealRunningError from '@Errors/DealRunningError'
import DealAggregator from '@Aggregators/DealAggregator'

export class AdvertisingAggregator {
  private _advertisingServiceClient: IAdvertisingServiceClient
  private _poultryServiceClient: IPoultryServiceClient
  private _dealServiceClient: IDealServiceClient
  
  constructor(
    advertisingServiceClient: IAdvertisingServiceClient,
    poultryServiceClient: IPoultryServiceClient,
    dealServiceClient: IDealServiceClient
  ) {
    this._advertisingServiceClient = advertisingServiceClient
    this._poultryServiceClient = poultryServiceClient
    this._dealServiceClient = dealServiceClient

    this.postAdvertising = this.postAdvertising.bind(this)
    this.updateAdvertising = this.updateAdvertising.bind(this)
    this.removeAdvertising = this.removeAdvertising.bind(this)
  }

  async postAdvertising(advertising: Partial<IAdvertising>, merchantId: string, breederId: string) {
    const poultryId = advertising.externalId ?? ''
    const poultry = await this._poultryServiceClient.getPoultry(breederId, poultryId)
    const breeder = await this._poultryServiceClient.getBreeder(breederId)
    const advertisingData = await this._advertisingServiceClient.postAdvertising(merchantId, {
      ...advertising,
      metadata: {
        ...(poultry?.crest ? { crest: poultry.crest } : {}),
        ...(poultry?.description ? { description: poultry.description } : {}),
        ...(poultry?.dewlap ? { dewlap: poultry.dewlap } : {}),
        ...(poultry?.gender ? { gender: poultry.gender } : {}),
        ...(poultry?.genderCategory ? { genderCategory: poultry.genderCategory } : {}),
        ...(poultry?.name ? { name: poultry.name } : {}),
        ...(poultry?.tail ? { tail: poultry.tail } : {}),
        ...(poultry?.type ? { type: poultry.type } : {}),
      }
    })

    await this._poultryServiceClient.postRegister(
      breederId,
      poultryId,
      {
        metadata: { advertisingId: advertisingData.id },
        type: RegisterTypeEnum.Advertising,
        description: `Ave ${poultry.name} anúnciada no ${breeder.name}`
      },
      []
    )
    await this._poultryServiceClient.updatePoultry(breederId, poultryId, {
      forSale: true,
    })

    return advertisingData
  }

  async updateAdvertising({
    merchantId,
    advertisingId,
    price,
  }: {
    merchantId: string;
    advertisingId: string;
    price: number;
  }) {
    const { deals } = await this._dealServiceClient.getDeals({ advertisingId })
    const dealEvents = await Promise.all(deals.map(async deal => this._dealServiceClient.getDealEvents(deal.id)))
    const hasConfirmedDeals = dealEvents.some((events) =>
      events.some(e => e.value === DealEventValueEnum.confirmed) &&
      events.every(e => e.value !== DealEventValueEnum.cancelled) &&
      events.every(e => e.value !== DealEventValueEnum.received)
    )

    if (hasConfirmedDeals) throw new DealRunningError()

    await this._advertisingServiceClient.updateAdvertising({
      advertisingId,
      merchantId,
      price,
    })
  }

  async removeAdvertising({
    merchantId,
    advertisingId,
    breederId,
    poultryId,
  }: {
    merchantId: string,
    advertisingId: string,
    breederId: string,
    poultryId: string,
  }) {
    const { deals } = await this._dealServiceClient.getDeals({ advertisingId })
    const dealEvents = await Promise.all(deals.map(async deal => this._dealServiceClient.getDealEvents(deal.id)))
    const hasConfirmedDeals = dealEvents.some((events) =>
      events.some(e => e.value === DealEventValueEnum.confirmed) &&
      events.every(e => e.value !== DealEventValueEnum.cancelled) &&
      events.every(e => e.value !== DealEventValueEnum.received)
    )

    if (hasConfirmedDeals) throw new DealRunningError()

    const poultry = await this._poultryServiceClient.getPoultry(breederId, poultryId)
    const breeder = await this._poultryServiceClient.getBreeder(breederId)

    deals.map(async deal => {
      await DealAggregator.cancelDeal(deal.id, 'Anúncio cancelado')
    })

    await this._advertisingServiceClient.removeAdvertising(merchantId, advertisingId)
    await this._poultryServiceClient.postRegister(
      breederId,
      poultryId,
      {
        metadata: { advertisingId },
        type: RegisterTypeEnum.RemoveAdvertising,
        description: `Anúncio da ave ${poultry.name} removido pelo ${breeder.name}`
      },
      []
    )
    await this._poultryServiceClient.updatePoultry(breederId, poultryId, {
      forSale: false,
    })
  }
}

export default new AdvertisingAggregator(
  AdvertisingServiceClient,
  PoultryServiceClient,
  DealServiceClient
)
