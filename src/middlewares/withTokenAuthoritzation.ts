import { BaseController, withTokenAuthorizationFactory } from '@cig-platform/core'

import AccountClient from '@Clients/AccountServiceClient'
import AuthBffClient from '@Clients/AuthBffClient'

export default withTokenAuthorizationFactory(AuthBffClient, BaseController.errorResponse, AccountClient)
