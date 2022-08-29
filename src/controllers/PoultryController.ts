import { Request, Response } from 'express'
import { AuthError, BaseController } from '@cig-platform/core'
import { AuthenticatedRequest } from '@cig-platform/types'

import PoultryAggregator from '@Aggregators/PoultryAggregator'
import i18n from '@Configs/i18n'

class PoultryController {
  constructor() {
    this.store = this.store.bind(this)
    this.storeParents = this.storeParents.bind(this)
    this.index = this.index.bind(this)
    this.show = this.show.bind(this)
    this.update = this.update.bind(this)
    this.transfer = this.transfer.bind(this)
    this.kill = this.kill.bind(this)
  }

  @BaseController.errorHandler()
  async store(req: Request, res: Response) {
    const poultry = BaseController.jsonStringToObject(req.body?.poultry)
    const measurementAndWeight = BaseController.jsonStringToObject(req.body?.measurementAndWeight)
    const breederId = req.params.breederId
    const files = (req.files ?? {}) as Record<string, any[]>
    const poultryData = await PoultryAggregator.postPoultry(poultry, breederId, files?.files, measurementAndWeight)

    return BaseController.successResponse(res, { poultry: poultryData })
  }

  @BaseController.errorHandler()
  @BaseController.actionHandler(i18n.__('common.updated'))
  async storeParents(req: Request) {
    const breederId = req.params.breederId
    const poultryId = req.params.poultryId
    
    await PoultryAggregator.updatePoultry(breederId, poultryId, {
      ...(req.body.momId ? { momId: req.body.momId } : {}),
      ...(req.body.dadId ? { dadId: req.body.dadId } : {}),
    })
  }

  @BaseController.errorHandler()
  @BaseController.actionHandler(i18n.__('common.updated'))
  async update(req: AuthenticatedRequest) {
    const breederId = req.params.breederId
    const poultryId = req.params.poultryId
    const poultry = BaseController.jsonStringToObject(req.body?.poultry)
    const files = (req.files ?? {}) as Record<string, any[]>
    const deletedImages = (req.body.deletedImages ?? '').split(',').filter(Boolean)
    const merchantId = req.merchant?.id

    await PoultryAggregator.updatePoultry(breederId, poultryId, poultry, files?.files, deletedImages, merchantId)
  }

  @BaseController.errorHandler()
  @BaseController.actionHandler(i18n.__('common.updated'))
  async kill(req: AuthenticatedRequest) {
    const breederId = req.params.breederId
    const poultryId = req.params.poultryId
    const merchant = req.merchant

    if (!merchant) throw new AuthError()

    await PoultryAggregator.killPoultry(breederId, poultryId, merchant.id)
  }

  @BaseController.errorHandler()
  @BaseController.actionHandler(i18n.__('common.updated'))
  async transfer(req: AuthenticatedRequest) {
    const breederId = req.params.breederId
    const poultryId = req.params.poultryId
    const targetBreederId = req.body.breederId
    const merchant = req.merchant

    if (!merchant) throw new AuthError()

    await PoultryAggregator.transferPoultry(breederId, poultryId, targetBreederId, merchant.id)
  }

  @BaseController.errorHandler()
  async index(req: Request, res: Response) {
    const breederId = req.params.breederId
    const poultries = await PoultryAggregator.getPoultries(breederId)

    return BaseController.successResponse(res, { ...poultries })
  }

  @BaseController.errorHandler()
  async show(req: AuthenticatedRequest, res: Response) {
    const merchant = req.merchant
    const breederId = req.params.breederId
    const poultryId = req.params.poultryId

    if (!merchant) throw new AuthError()

    const data = await PoultryAggregator.getPoultry(merchant, breederId, poultryId)

    return BaseController.successResponse(res, data)
  }
}

export default new PoultryController()
