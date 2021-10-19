import { createDoc } from '@cig-platform/docs'

import { storePoultrySchema } from '@Schemas/PoultrySchemas'

const poultryDocs = {
  ...createDoc('/breeders/{breederId}/poultries', ['Poultries'], [
    {
      method: 'post',
      title: 'Register poultry',
      description: 'Route to register poultry',
      headerParams: [{ type: 'string', name: 'X-Cig-Token' }],
      objectSchema: storePoultrySchema
    },
    {
      method: 'get',
      title: 'Get poultries',
      description: 'Route to get poultries',
      headerParams: [{ type: 'string', name: 'X-Cig-Token' }],
    }
  ], { pathVariables: [{ type: 'string', name: 'breederId' }] }),
  ...createDoc('/breeders/{breederId}/poultries/{poultryId}', ['Poultries'], [
    {
      method: 'get',
      title: 'Get poultries',
      description: 'Route to get poultries',
      headerParams: [{ type: 'string', name: 'X-Cig-Token' }],
    }
  ], { pathVariables: [{ type: 'string', name: 'breederId' }, { type: 'string', name: 'poultryId' }] }),
}

export default poultryDocs
