import {
  PoultryServiceClient as IPoultryServiceClient,
  AdvertisingServiceClient as IAdvertisingServiceClient
} from '@cig-platform/core'
import { IMerchant, IPoultry } from '@cig-platform/types'
import { PoultryGenderCategoryEnum } from '@cig-platform/enums'

import PoultryServiceClient from '@Clients/PoultryServiceClient'
import AdvertisingServiceClient from '@Clients/AdvertisingServiceClient'

export class PoultryAggregator {
  private _poultryServiceClient: IPoultryServiceClient;
  private _advertisingServiceClient: IAdvertisingServiceClient;
  
  constructor(poultryServiceClient: IPoultryServiceClient, advertisingServiceClient: IAdvertisingServiceClient) {
    this._poultryServiceClient = poultryServiceClient
    this._advertisingServiceClient = advertisingServiceClient

    this.postPoultry = this.postPoultry.bind(this)
    this.getPoultries = this.getPoultries.bind(this)
  }

  async postPoultry(poultry: IPoultry, breederId: string, images: File[] = []) {
    const poultryData = await this._poultryServiceClient.postPoultry(breederId, poultry)

    await this._poultryServiceClient.postPoultryImages(breederId, poultryData.id, images)

    return poultryData
  }

  async transferPoultry(
    breederId: string,
    poultryId: string,
    targetBreederId: string
  ) {
    const poultry = await this._poultryServiceClient.getPoultry(breederId, poultryId)

    await this._poultryServiceClient.transferPoultry(breederId, poultryId, targetBreederId)

    const originBreeder = await this._poultryServiceClient.getBreeder(breederId)
    const targetBreeder = await this._poultryServiceClient.getBreeder(targetBreederId)

    await this._poultryServiceClient.postRegister(
      targetBreederId,
      poultryId,
      {
        metadata: { targetBreederId, originBreederId: originBreeder.id },
        type: 'TRANSFERÊNCIA',
        description: `Ave ${poultry.name} transferida de ${originBreeder.name} para ${targetBreeder.name}`
      },
      []
    )
  }

  async updatePoultry(
    breederId: string,
    poultryId: string,
    poultry: Partial<IPoultry>,
    images: File[] = [],
    deletedImages: string[] = []
  ) {
    await this._poultryServiceClient.updatePoultry(breederId, poultryId, poultry)
    await this._poultryServiceClient.postPoultryImages(breederId, poultryId, images)

    deletedImages.forEach(async (deletedImageId) => {
      await this._poultryServiceClient.removePoultryImage(breederId, poultryId, deletedImageId)
    })
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
    const advertisings = await this._advertisingServiceClient.getAdvertisings(merchant.id, poultryData.id)

    return { poultry, advertisings }
  }
}

export default new PoultryAggregator(PoultryServiceClient, AdvertisingServiceClient)
