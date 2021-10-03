import { Request } from 'express'
import { BaseController } from '@cig-platform/core'

import BreederServiceClient from '@Clients/BreederServiceClient'
import i18n from '@Configs/i18n'

class BreederController {
  constructor() {
    this.update = this.update.bind(this)
  }

  @BaseController.errorHandler()
  @BaseController.actionHandler(i18n.__('common.updated'))
  async update(req: Request) {
    const breeder = req.body
    const files = req.files
    const breederId = req.params.breederId

    await BreederServiceClient.updateBreeder(breederId, { ...breeder, files })
  }
}

export default new BreederController()
