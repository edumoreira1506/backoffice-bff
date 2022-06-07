import { Response } from 'express'
import { BaseController, NotFoundError } from '@cig-platform/core'

import ReviewServiceClient from '@Clients/ReviewServiceClient'
import { AuthenticatedRequest } from '@cig-platform/types'
import AdvertisingServiceClient from '@Clients/AdvertisingServiceClient'

class ReviewController {
  constructor() {
    this.store = this.store.bind(this)
  }

  @BaseController.errorHandler()
  async store(req: AuthenticatedRequest, res: Response) {
    const advertisingId = req?.params?.advertisingId?.toString()
    const dealId = req?.params?.dealId?.toString()
    const dealFeedback = req.body.dealFeedback?.toString()
    const merchantFeedback = req.body.dealFeedback?.toString()
    const score = Number(req.body.score)
    const merchant = req.merchant
    const user = req.user

    if (!advertisingId || !merchant || !user) throw new NotFoundError()

    const { advertisings } = await AdvertisingServiceClient.searchAdvertisings({
      advertisingIds: [advertisingId],
    })

    if (!advertisings.length) throw new NotFoundError()

    const review = await ReviewServiceClient.postReview({
      advertisingId,
      dealId,
      metadata: {
        dealFeedback,
        merchantFeedback,
        score
      },
      reviewerExternalId: user.id,
      reviewerMerchantId: merchant.id,
      reviewedMerchantId: advertisings?.[0]?.merchantId
    })

    return BaseController.successResponse(res, { review })
  }
}

export default new ReviewController()
