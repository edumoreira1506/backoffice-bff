import { NextFunction, Response } from 'express'
import {
  AuthError,
  BaseController,
  AdvertisingServiceClient as IAdvertisingServiceClient,
  DealServiceClient as IDealServiceClient,
  PoultryServiceClient as IPoultryServiceClient,
  NotFoundError,
} from '@cig-platform/core'
import { ApiErrorType, AuthenticatedRequest } from '@cig-platform/types'

import AdvertisingServiceClient from '@Clients/AdvertisingServiceClient'
import DealServiceClient from '@Clients/DealServiceClient'
import PoultryServiceClient from '@Clients/PoultryServiceClient'

export const withDealPermissionFactory = (
  errorCallback: (res: Response, error: ApiErrorType) => Response,
  advertisingServiceClient: IAdvertisingServiceClient,
  dealServiceClient: IDealServiceClient,
  poultryServiceClient: IPoultryServiceClient
) => async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user
    const merchant = req.merchant

    if (!user || !merchant) throw new AuthError()

    const merchantId = req.merchant.id
    const dealId = req.params.dealId
    const advertisingId = req.params.advertisingId
    const breederId = req.params.breederId

    const breeder = await poultryServiceClient.getBreeder(breederId)

    if (!breeder) throw new NotFoundError()

    const merchantOfBreeder = await advertisingServiceClient.getMerchants(breeder.id)

    if (!merchantOfBreeder?.length) throw new NotFoundError()

    const advertising = await advertisingServiceClient.getAdvertising(merchantOfBreeder[0].id, advertisingId)

    if (!advertising) throw new NotFoundError()

    const deal = await dealServiceClient.getDeal(dealId)

    if (!deal || deal.advertisingId !== advertisingId) throw new NotFoundError()

    const isPartOfDeal = deal.buyerId === merchantId || deal.sellerId === merchantId

    if (!isPartOfDeal) throw new AuthError()

    next()
  } catch(error: any) {
    return errorCallback(res, error?.getError ? error.getError() : error)
  }
}

export default withDealPermissionFactory(
  BaseController.errorResponse,
  AdvertisingServiceClient,
  DealServiceClient,
  PoultryServiceClient
)
