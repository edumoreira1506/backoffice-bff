import { AdvertisingServiceClient as IAdvertisingServiceClient } from '@cig-platform/core'
import { IAdvertising } from '@cig-platform/types'

import AdvertisingServiceClient from '@Clients/AdvertisingServiceClient'

export class AdvertisingAggregator {
  private _advertisingServiceClient: IAdvertisingServiceClient;
  
  constructor(advertisingServiceClient: IAdvertisingServiceClient) {
    this._advertisingServiceClient = advertisingServiceClient

    this.postAdvertising = this.postAdvertising.bind(this)
  }

  async postAdvertising(advertising: Partial<IAdvertising>, merchantId: string) {
    const advertisingData = await this._advertisingServiceClient.postAdvertising(merchantId, advertising)

    return advertisingData
  }
}

export default new AdvertisingAggregator(AdvertisingServiceClient)
