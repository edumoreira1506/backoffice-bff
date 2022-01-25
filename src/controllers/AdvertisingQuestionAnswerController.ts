import { Response } from 'express'
import { BaseController, NotFoundError } from '@cig-platform/core'
import { AuthenticatedRequest } from '@cig-platform/types'

import AdvertisingQuestionAnswerAggregator from '@Aggregators/AdvertisingQuestionAnswerAggregator'

class AdvertisingQuestionAnswerController {
  constructor() {
    this.store = this.store.bind(this)
  }

  @BaseController.errorHandler()
  async store(req: AuthenticatedRequest, res: Response) {
    const merchant = req.merchant
    const user = req.user
    const answer = req.body.answer
    const advertisingId = req.params.advertisingId
    const questionId = req.params.questionId

    if (!merchant || !user) throw new NotFoundError()

    const savedAnswer = await AdvertisingQuestionAnswerAggregator.postQuestionAnswer(
      merchant.id,
      advertisingId,
      questionId,
      answer
    )

    return BaseController.successResponse(res, { answer: savedAnswer })
  }
}

export default new AdvertisingQuestionAnswerController()
