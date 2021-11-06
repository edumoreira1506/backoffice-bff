import { Request, Response } from 'express'
import { BaseController } from '@cig-platform/core'

import RegisterAggregator from '@Aggregators/RegisterAggregator'

class RegisterController {
  constructor() {
    this.store = this.store.bind(this)
    this.index = this.index.bind(this)
  }

  @BaseController.errorHandler()
  async store(req: Request, res: Response) {
    const register = JSON.parse(req.body?.register ?? '{}')
    const breederId = req.params.breederId
    const poultryId = req.params.poultryId
    const files = (req.files ?? {}) as Record<string, any[]>
    const registerData = await RegisterAggregator.postRegister(register, breederId, poultryId, files?.files)

    return BaseController.successResponse(res, { register: registerData })
  }

  @BaseController.errorHandler()
  async index(req: Request, res: Response) {
    const breederId = req.params.breederId
    const poultryId = req.params.poultryId
    const registers = await RegisterAggregator.getRegisters(breederId, poultryId)

    return BaseController.successResponse(res, { registers })
  }
}

export default new RegisterController()