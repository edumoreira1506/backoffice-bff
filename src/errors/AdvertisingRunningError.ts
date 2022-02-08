import { ApiError } from '@cig-platform/core'

import i18n from '@Configs/i18n'

export default class AdvertisingRunningError extends ApiError {
  constructor() {
    super(i18n.__('transfer.errors.advertising-running'))

    this.name = 'AdvertisingRunningError'
  }
}
