import { PoultryServiceClient as IPoultryServiceClient } from '@cig-platform/core'
import { IBreeder } from '@cig-platform/types'

import PoultryServiceClient from '@Clients/PoultryServiceClient'

export class BreederAggregator {
  private _poultryServiceClient: IPoultryServiceClient;
  
  constructor(poultryServiceClient: IPoultryServiceClient) {
    this._poultryServiceClient = poultryServiceClient

    this.getBreederInfo = this.getBreederInfo.bind(this)
  }

  async getBreederInfo(breederId: string) {
    const breeder = await this._poultryServiceClient.getBreeder(breederId)
    const breederImages = await this._poultryServiceClient.getBreederImages(breederId)

    return { ...breeder, images: breederImages }
  }

  async updateBreederInfo(breederId: string, breeder: Partial<IBreeder>, deletedImages: string[], newImages?: File[]) {
    deletedImages.forEach(async (breederImageId) => {
      await this._poultryServiceClient.removeBreederImage(breederId, breederImageId)
    })

    if (newImages) {
      await this._poultryServiceClient.postBreederImages(breederId, newImages)
    }

    if (breeder) {
      await this._poultryServiceClient.updateBreeder(breederId, breeder)
    }
  }
}

export default new BreederAggregator(PoultryServiceClient)
