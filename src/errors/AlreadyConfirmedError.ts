import { ApiError } from '@cig-platform/core'

import i18n from '@Configs/i18n'

export default class AlreadyConfirmedError extends ApiError {
  constructor() {
    super(i18n.__('deal.errors.already-confirmed'))

    this.name = 'AlreadyConfirmedError'
  }
}
