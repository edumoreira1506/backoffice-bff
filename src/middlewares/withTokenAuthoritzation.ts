import { BaseController, withTokenAuthorizationFactory } from '@cig-platform/core'

import TokenService from '@Services/TokenService'
import AccountClient from '@Clients/AccoutnServiceClient'

export default withTokenAuthorizationFactory(TokenService, BaseController.errorResponse, AccountClient)
