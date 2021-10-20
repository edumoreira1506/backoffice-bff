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

  async postPoultry(poultry: IPoultry, breederId: string) {
    const poultryData = await this._poultryServiceClient.postPoultry(breederId, poultry)

    return poultryData
  }

  async updatePoultry(breederId: string, poultryId: string, poultry: Partial<IPoultry>) {
    await this._poultryServiceClient.updatePoultry(breederId, poultryId, poultry)
  }

  async getPoultries(breederId: string) {
    const poultries = await this._poultryServiceClient.getPoultries(breederId)
  
    return poultries
  }

  async getPoultry(breederId: string, poultryId: string) {
    const poultry = await this._poultryServiceClient.getPoultry(breederId, poultryId)
    const images = await this._poultryServiceClient.getPoultryImages(breederId, poultryId)

    return { ...poultry, images }
  }
}

export default new PoultryAggregator(PoultryServiceClient)
