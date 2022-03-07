import {AdvertisingServiceClient as IAdvertisingServiceClient } from '@cig-platform/core'
import { IAdvertisingQuestionAnswer } from '@cig-platform/types'

import AdvertisingServiceClient from '@Clients/AdvertisingServiceClient'

export class AdvertisingQuestionAnswerAggregator {
  private _advertisingServiceClient: IAdvertisingServiceClient
  
  constructor(
    advertisingServiceClient: IAdvertisingServiceClient,
  ) {
    this._advertisingServiceClient = advertisingServiceClient

    this.postQuestionAnswer = this.postQuestionAnswer.bind(this)
  }

  async postQuestionAnswer(merchantId: string, advertisingId: string, questionId: string, answer: Partial<IAdvertisingQuestionAnswer>) {
    return this._advertisingServiceClient.postAdvertisingQuestionAnswer(
      merchantId, advertisingId, questionId, answer
    )
  }
}

export default new AdvertisingQuestionAnswerAggregator(AdvertisingServiceClient)
