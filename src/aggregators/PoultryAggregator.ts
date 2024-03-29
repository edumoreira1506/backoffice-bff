import {
  PoultryServiceClient as IPoultryServiceClient,
  AdvertisingServiceClient as IAdvertisingServiceClient,
  DealServiceClient as IDealServiceClient
} from '@cig-platform/core'
import { IMerchant, IPoultry } from '@cig-platform/types'
import { DealEventValueEnum, PoultryGenderCategoryEnum, RegisterTypeEnum } from '@cig-platform/enums'

import PoultryServiceClient from '@Clients/PoultryServiceClient'
import AdvertisingServiceClient from '@Clients/AdvertisingServiceClient'
import DealServiceClient from '@Clients/DealServiceClient'
import DealRunningError from '@Errors/DealRunningError'
import DealAggregator from '@Aggregators/DealAggregator'
import AdvertisingAggregator from './AdvertisingAggregator'

export class PoultryAggregator {
  private _poultryServiceClient: IPoultryServiceClient
  private _advertisingServiceClient: IAdvertisingServiceClient
  private _dealServiceClient: IDealServiceClient
  
  constructor(
    poultryServiceClient: IPoultryServiceClient,
    advertisingServiceClient: IAdvertisingServiceClient,
    dealServiceClient: IDealServiceClient
  ) {
    this._poultryServiceClient = poultryServiceClient
    this._advertisingServiceClient = advertisingServiceClient
    this._dealServiceClient = dealServiceClient

    this.postPoultry = this.postPoultry.bind(this)
    this.getPoultries = this.getPoultries.bind(this)
    this.transferPoultry = this.transferPoultry.bind(this)
    this.updatePoultry = this.updatePoultry.bind(this)
  }

  async postPoultry(
    poultry: IPoultry,
    breederId: string,
    images: File[] = [],
    { measurement, weight }: { measurement?: number; weight?: number } = {}
  ) {
    const poultryData = await this._poultryServiceClient.postPoultry(breederId, poultry)

    await this._poultryServiceClient.postPoultryImages(breederId, poultryData.id, images)

    if (measurement || weight) {
      await this._poultryServiceClient.postRegister(breederId, poultryData.id, {
        metadata: { measurement, weight },
        type: RegisterTypeEnum.MeasurementAndWeighing,
      }, [])
    }

    return poultryData
  }

  async killPoultry(
    breederId: string,
    poultryId: string,
    merchantId: string
  ) {
    const advertisings = await this._advertisingServiceClient.getAdvertisings(merchantId, poultryId, false)
    const advertising = advertisings?.[0]

    if (advertising) {
      const { deals } = await this._dealServiceClient.getDeals({ advertisingId: advertising.id })

      deals.filter(deal => !deal.finished && !deal.cancelled).forEach(async deal => {
        await DealAggregator.cancelDeal(deal.id, 'Ave morreu')
      })

      await AdvertisingAggregator.removeAdvertising({
        advertisingId: advertising.id,
        merchantId,
        breederId,
        poultryId
      })
    }
    
    await this._poultryServiceClient.postRegister(
      breederId,
      poultryId,
      {
        type: RegisterTypeEnum.Death,
        description: 'Comunicado de morte'
      },
      []
    )
    
    await this._poultryServiceClient.killPoultry(breederId, poultryId)
  }

  async transferPoultry(
    breederId: string,
    poultryId: string,
    targetBreederId: string,
    merchantId: string
  ) {
    const advertisings = await this._advertisingServiceClient.getAdvertisings(merchantId, poultryId, false)
    const advertising = advertisings?.[0]

    if (advertising) {
      const { deals } = await this._dealServiceClient.getDeals({ advertisingId: advertising.id })
      const dealEvents = await Promise.all(deals.map(async deal => this._dealServiceClient.getDealEvents(deal.id)))
      const hasConfirmedDeals = dealEvents.some((events) =>
        events.some(e => e.value === DealEventValueEnum.confirmed) &&
        events.every(e => e.value !== DealEventValueEnum.cancelled) &&
        events.every(e => e.value !== DealEventValueEnum.received)
      )

      if (hasConfirmedDeals) throw new DealRunningError()

      deals.filter(deal => !deal.finished && !deal.cancelled).map(async deal => {
        await DealAggregator.cancelDeal(deal.id, 'Anúncio cancelado')
      })

      await AdvertisingAggregator.removeAdvertising({
        advertisingId: advertising.id,
        merchantId,
        breederId,
        poultryId
      })
    }

    await this._poultryServiceClient.transferPoultry(breederId, poultryId, targetBreederId)

    const originBreeder = await this._poultryServiceClient.getBreeder(breederId)
    const targetBreeder = await this._poultryServiceClient.getBreeder(targetBreederId)

    await this._poultryServiceClient.postRegister(
      targetBreederId,
      poultryId,
      {
        metadata: { targetBreederId, originBreederId: originBreeder.id },
        type: RegisterTypeEnum.Transfer,
        description: `Ave transferida de ${originBreeder.name} para ${targetBreeder.name}`
      },
      []
    )
  }

  async updatePoultry(
    breederId: string,
    poultryId: string,
    poultry: Partial<IPoultry>,
    images: File[] = [],
    deletedImages: string[] = [],
    merchantId = ''
  ) {
    await this._poultryServiceClient.updatePoultry(breederId, poultryId, poultry)
    await this._poultryServiceClient.postPoultryImages(breederId, poultryId, images)

    deletedImages.forEach(async (deletedImageId) => {
      await this._poultryServiceClient.removePoultryImage(breederId, poultryId, deletedImageId)
    })

    const advertisings = await this._advertisingServiceClient.getAdvertisings(merchantId, poultry.id, false)

    if (advertisings.length) {
      await this._advertisingServiceClient.updateAdvertising({
        merchantId,
        advertisingId: advertisings[0].id,
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
    }
  }

  async getPoultries(breederId: string) {
    const reproductivePoultries = await this._poultryServiceClient.getPoultries(breederId, { genderCategory: PoultryGenderCategoryEnum.Reproductive})
    const matrixPoultries = await this._poultryServiceClient.getPoultries(breederId, { genderCategory: PoultryGenderCategoryEnum.Matrix })
    const malePoultries = await this._poultryServiceClient.getPoultries(breederId, { genderCategory: PoultryGenderCategoryEnum.MaleChicken })
    const femalePoultries = await this._poultryServiceClient.getPoultries(breederId, { genderCategory: PoultryGenderCategoryEnum.FemaleChicken })
  
    return {
      reproductives: reproductivePoultries,
      matrix: matrixPoultries,
      male: malePoultries,
      female: femalePoultries,
    }
  }

  async getPoultry(merchant: IMerchant, breederId: string, poultryId: string) {
    const poultryData = await this._poultryServiceClient.getPoultry(breederId, poultryId)
    const images = await this._poultryServiceClient.getPoultryImages(breederId, poultryId)
    const registers = await this._poultryServiceClient.getRegisters(breederId, poultryId)
    const poultry = {
      ...poultryData, images, registers
    }
    const advertisings = await this._advertisingServiceClient.getAdvertisings(merchant.id, poultryData.id, false)

    return { poultry, advertisings }
  }
}

export default new PoultryAggregator(
  PoultryServiceClient,
  AdvertisingServiceClient,
  DealServiceClient
)
