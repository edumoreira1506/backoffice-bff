import { PoultryServiceClient as IPoultryServiceClient } from '@cig-platform/core'

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
}

export default new BreederAggregator(PoultryServiceClient)
