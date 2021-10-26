import { PoultryServiceClient as IPoultryServiceClient } from '@cig-platform/core'
import { IPoultryRegister } from '@cig-platform/types'

import PoultryServiceClient from '@Clients/PoultryServiceClient'

export class RegisterAggregator {
  private _poultryServiceClient: IPoultryServiceClient;
  
  constructor(poultryServiceClient: IPoultryServiceClient) {
    this._poultryServiceClient = poultryServiceClient

    this.postRegister = this.postRegister.bind(this)
  }

  async postRegister(register: IPoultryRegister, breederId: string, poultryId: string, files: File[] = []) {
    const registerData = await this._poultryServiceClient.postRegister(breederId, poultryId, register, files)

    return registerData
  }
}

export default new RegisterAggregator(PoultryServiceClient)
