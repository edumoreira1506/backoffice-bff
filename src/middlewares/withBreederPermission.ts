import { NextFunction, Response } from 'express'
import { AuthError, BaseController, PoultryServiceClient } from '@cig-platform/core'
import { ApiErrorType } from '@cig-platform/types'

import { AuthenticatedRequest } from '@Types/request'
import BreederClient from '@Clients/PoultryServiceClient'

export const withBreederPermisionFactory = (errorCallback: (res: Response, error: ApiErrorType) => Response, poultryServiceClient: PoultryServiceClient) => async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user

    if (!user) throw new AuthError()

    const breederId = req.params.breederId

    if (!breederId) throw new AuthError()

    const breeders = await poultryServiceClient.getBreeders(user.id)
    const breedersIds = breeders.map(breeder => breeder.id)

    if (!breedersIds.includes(breederId)) throw new AuthError()

    next()
  } catch(error: any) {
    return errorCallback(res, error?.getError ? error.getError() : error)
  }
}

export default withBreederPermisionFactory(BaseController.errorResponse, BreederClient)
