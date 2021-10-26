import { PoultryServiceClient as IPoultryServiceClient } from '@cig-platform/core'
import { IPoultry } from '@cig-platform/types'

import PoultryServiceClient from '@Clients/PoultryServiceClient'

export class PoultryAggregator {
  private _poultryServiceClient: IPoultryServiceClient;
  
  constructor(poultryServiceClient: IPoultryServiceClient) {
    this._poultryServiceClient = poultryServiceClient

    this.postPoultry = this.postPoultry.bind(this)
    this.getPoultries = this.getPoultries.bind(this)
  }

  async postPoultry(poultry: IPoultry, breederId: string, images: File[] = []) {
    const poultryData = await this._poultryServiceClient.postPoultry(breederId, poultry)

    await this._poultryServiceClient.postPoultryImages(breederId, poultryData.id, images)

    return poultryData
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
    const reproductivePoultries = await this._poultryServiceClient.getPoultries(breederId, 'REPRODUTOR')
    const matrixPoultries = await this._poultryServiceClient.getPoultries(breederId, 'MATRIZ')
    const malePoultries = await this._poultryServiceClient.getPoultries(breederId, 'FRANGO')
    const femalePoultries = await this._poultryServiceClient.getPoultries(breederId, 'FRANGA')
  
    return {
      reproductives: reproductivePoultries,
      matrix: matrixPoultries,
      male: malePoultries,
      female: femalePoultries,
    }
  }

  async getPoultry(breederId: string, poultryId: string) {
    const poultry = await this._poultryServiceClient.getPoultry(breederId, poultryId)
    const images = await this._poultryServiceClient.getPoultryImages(breederId, poultryId)
    const registers = await this._poultryServiceClient.getRegisters(breederId, poultryId)

    return { ...poultry, images, registers }
  }
}

export default new PoultryAggregator(PoultryServiceClient)
