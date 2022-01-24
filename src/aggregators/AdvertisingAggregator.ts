import {
  AdvertisingServiceClient as IAdvertisingServiceClient,
  PoultryServiceClient as IPoultryServiceClient,
} from '@cig-platform/core'
import { IAdvertising } from '@cig-platform/types'
import { RegisterTypeEnum } from '@cig-platform/enums'

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
        type: RegisterTypeEnum.Advertising,
        description: `Ave ${poultry.name} anúnciada no ${breeder.name}`
      },
      []
    )

    return advertisingData
  }

  async updateAdvertising({
    merchantId,
    advertisingId,
    price
  }: {
    merchantId: string;
    advertisingId: string;
    price: number;
  }) {
    await this._advertisingServiceClient.updateAdvertising(merchantId, advertisingId, price)
  }

  async removeAdvertising({
    merchantId,
    advertisingId,
    breederId,
    poultryId,
  }: {
    merchantId: string,
    advertisingId: string,
    breederId: string,
    poultryId: string,
  }) {
    const poultry = await this._poultryServiceClient.getPoultry(breederId, poultryId)
    const breeder = await this._poultryServiceClient.getBreeder(breederId)

    await this._advertisingServiceClient.removeAdvertising(merchantId, advertisingId)
    await this._poultryServiceClient.postRegister(
      breederId,
      poultryId,
      {
        metadata: { advertisingId },
        type: RegisterTypeEnum.RemoveAdvertising,
        description: `Anúncio da ave ${poultry.name} removido pelo ${breeder.name}`
      },
      []
    )
  }
}

export default new AdvertisingAggregator(AdvertisingServiceClient, PoultryServiceClient)
