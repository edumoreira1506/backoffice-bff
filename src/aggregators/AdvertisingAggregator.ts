import {
  AdvertisingServiceClient as IAdvertisingServiceClient,
  PoultryServiceClient as IPoultryServiceClient,
} from '@cig-platform/core'
import { IAdvertising } from '@cig-platform/types'

import AdvertisingServiceClient from '@Clients/AdvertisingServiceClient'
import PoultryServiceClient from '@Clients/PoultryServiceClient'

export class AdvertisingAggregator {
  private _advertisingServiceClient: IAdvertisingServiceClient;
  private _poultryServiceClient: IPoultryServiceClient;
  
  constructor(
    advertisingServiceClient: IAdvertisingServiceClient,
    poultryServiceClient: IPoultryServiceClient
  ) {
    this._advertisingServiceClient = advertisingServiceClient
    this._poultryServiceClient = poultryServiceClient

    this.postAdvertising = this.postAdvertising.bind(this)
  }

  async postAdvertising(advertising: Partial<IAdvertising>, merchantId: string, breederId: string) {
    const poultryId = advertising.externalId ?? ''
    const advertisingData = await this._advertisingServiceClient.postAdvertising(merchantId, advertising)
    const poultry = await this._poultryServiceClient.getPoultry(breederId, poultryId)
    const breeder = await this._poultryServiceClient.getBreeder(breederId)

    await this._poultryServiceClient.postRegister(
      breederId,
      poultryId,
      {
        metadata: { advertisingId: advertisingData.id },
        type: 'ANÚNCIO',
        poultryId,
        description: `Ave ${poultry.name} anúnciada no criatório ${breeder.name}`
      },
      []
    )

    return advertisingData
  }

  async removeAdvertising(merchantId: string, advertisingId: string) {
    await this._advertisingServiceClient.removeAdvertising(merchantId, advertisingId)
  }
}

export default new AdvertisingAggregator(AdvertisingServiceClient, PoultryServiceClient)
