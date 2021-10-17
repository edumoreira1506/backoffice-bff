import { PoultryServiceClient as IPoultryServiceClient } from '@cig-platform/core'
import { IPoultry } from '@cig-platform/types'

import PoultryServiceClient from '@Clients/PoultryServiceClient'

export class PoultryAggregator {
  private _poultryServiceClient: IPoultryServiceClient;
  
  constructor(poultryServiceClient: IPoultryServiceClient) {
    this._poultryServiceClient = poultryServiceClient

    this.postPoultry = this.postPoultry.bind(this)
  }

  async postPoultry(poultry: IPoultry, breederId: string) {
    const poultryData = this._poultryServiceClient.postPoultry(breederId, poultry)

    return poultryData
  }
}

export default new PoultryAggregator(PoultryServiceClient)
