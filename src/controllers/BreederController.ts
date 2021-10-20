import { Request, Response } from 'express'
import { BaseController } from '@cig-platform/core'

import i18n from '@Configs/i18n'
import BreederAggregator from '@Aggregators/BreederAggregator'

class BreederController {
  constructor() {
    this.update = this.update.bind(this)
    this.show = this.show.bind(this)
  }

  @BaseController.errorHandler()
  @BaseController.actionHandler(i18n.__('common.updated'))
  async update(req: Request) {
    const breeder = req.body
    const files = (req.files ?? {}) as Record<string, any[]>
    const deletedImages = (breeder?.deletedImages ?? '').split(',').filter(Boolean)
    const deletedContacts = (breeder?.deletedContacts ?? '').split(',').filter(Boolean)

    delete breeder['deletedImages']

    const newImages = files.newImages
    const breederId = req.params.breederId

    await BreederAggregator.updateBreederInfo(
      breederId,
      { ...breeder, ...(files.files ? ({ files: files.files }) : ({})) },
      deletedImages,
      newImages,
      deletedContacts
    )
  }

  @BaseController.errorHandler()
  async show(req: Request, res: Response) {
    const breederId = req.params.breederId
    const breeder = await BreederAggregator.getBreederInfo(breederId)

    return BaseController.successResponse(res, { breeder })
  }
}

export default new BreederController()
