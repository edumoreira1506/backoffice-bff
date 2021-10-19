import { Request, Response } from 'express'
import { BaseController } from '@cig-platform/core'

import PoultryAggregator from '@Aggregators/PoultryAggregator'

class PoultryController {
  constructor() {
    this.store = this.store.bind(this)
    this.index = this.index.bind(this)
    this.show = this.show.bind(this)
  }

  @BaseController.errorHandler()
  async store(req: Request, res: Response) {
    const poultry = req.body?.poultry
    const breederId = req.params.breederId
    const poultryData = await PoultryAggregator.postPoultry(poultry, breederId)

    return BaseController.successResponse(res, { poultry: poultryData })
  }

  @BaseController.errorHandler()
  async index(req: Request, res: Response) {
    const breederId = req.params.breederId
    const poultries = await PoultryAggregator.getPoultries(breederId)

    return BaseController.successResponse(res, { poultries })
  }

  @BaseController.errorHandler()
  async show(req: Request, res: Response) {
    const breederId = req.params.breederId
    const poultryId = req.params.poultryId
    const poultry = await PoultryAggregator.getPoultry(breederId, poultryId)

    return BaseController.successResponse(res, { poultry })
  }
}

export default new PoultryController()
