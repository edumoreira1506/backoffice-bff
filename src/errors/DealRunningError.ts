import { ApiError } from '@cig-platform/core'

import i18n from '@Configs/i18n'

export default class DealRunningError extends ApiError {
  constructor() {
    super(i18n.__('advertising.errors.deal-running'))

    this.name = 'DealRunningError'
  }
}
