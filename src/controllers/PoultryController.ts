import { Request, Response } from 'express'
import { BaseController } from '@cig-platform/core'
import { AuthenticatedRequest } from '@cig-platform/types'

import PoultryAggregator from '@Aggregators/PoultryAggregator'
import i18n from '@Configs/i18n'

class PoultryController {
  constructor() {
    this.store = this.store.bind(this)
    this.index = this.index.bind(this)
    this.show = this.show.bind(this)
    this.update = this.update.bind(this)
  }

  @BaseController.errorHandler()
  async store(req: Request, res: Response) {
    const poultry = JSON.parse(req.body?.poultry ?? '{}')
    const breederId = req.params.breederId
    const files = (req.files ?? {}) as Record<string, any[]>
    const poultryData = await PoultryAggregator.postPoultry(poultry, breederId, files?.files)

    return BaseController.successResponse(res, { poultry: poultryData })
  }

  @BaseController.errorHandler()
  @BaseController.actionHandler(i18n.__('common.updated'))
  async update(req: Request) {
    const breederId = req.params.breederId
    const poultryId = req.params.poultryId
    const poultry = JSON.parse(req.body?.poultry ?? '{}')
    const files = (req.files ?? {}) as Record<string, any[]>
    const deletedImages = (req.body.deletedImages ?? '').split(',').filter(Boolean)

    await PoultryAggregator.updatePoultry(breederId, poultryId, poultry, files?.files, deletedImages)
  }

  @BaseController.errorHandler()
  async index(req: Request, res: Response) {
    const breederId = req.params.breederId
    const poultries = await PoultryAggregator.getPoultries(breederId)

    return BaseController.successResponse(res, { ...poultries })
  }

  @BaseController.errorHandler()
  async show(req: AuthenticatedRequest, res: Response) {
    const breederId = req.params.breederId
    const poultryId = req.params.poultryId
    const data = await PoultryAggregator.getPoultry(req.merchant, breederId, poultryId)

    return BaseController.successResponse(res, data)
  }
}

export default new PoultryController()
