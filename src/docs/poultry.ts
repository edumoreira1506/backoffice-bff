import { createDoc } from '@cig-platform/docs'
import { storeAdvertisingSchema } from '@Schemas/AdvertisingSchemas'

import { storePoultrySchema, updatePoultrySchema } from '@Schemas/PoultrySchemas'
import { storeRegisterSchema } from '@Schemas/RegisterSchema'

const poultryDocs = {
  ...createDoc('/breeders/{breederId}/poultries', ['Poultries'], [
    {
      method: 'post',
      title: 'Register poultry',
      description: 'Route to register poultry',
      headerParams: [{ type: 'string', name: 'X-Cig-Token' }],
      objectSchema: storePoultrySchema,
      files: ['files'],
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
    },
    {
      method: 'patch',
      title: 'Update poultry',
      description: 'Route to update poultry',
      headerParams: [{ type: 'string', name: 'X-Cig-Token' }],
      objectSchema: updatePoultrySchema,
      files: ['files'],
    }
  ], { pathVariables: [{ type: 'string', name: 'breederId' }, { type: 'string', name: 'poultryId' }] }),
  ...createDoc('/breeders/{breederId}/poultries/{poultryId}/registers', ['Poultry registers'], [
    {
      method: 'post',
      title: 'Register poultry register',
      description: 'Route to register poultry register',
      headerParams: [{ type: 'string', name: 'X-Cig-Token' }],
      objectSchema: storeRegisterSchema,
      files: ['files'],
    },
    {
      method: 'get',
      title: 'Get poultry registers',
      description: 'Route to get poultry registers',
      headerParams: [{ type: 'string', name: 'X-Cig-Token' }],
    }
  ], { pathVariables: [{ type: 'string', name: 'breederId' }, { type: 'string', name: 'poultryId' }] }),
  ...createDoc('/breeders/{breederId}/poultries/{poultryId}/advertisings', ['Poultry advertisings'], [
    {
      method: 'post',
      title: 'Register poultry advertising',
      description: 'Route to register poultry advertising',
      headerParams: [{ type: 'string', name: 'X-Cig-Token' }],
      objectSchema: storeAdvertisingSchema,
    },
  ], { pathVariables: [{ type: 'string', name: 'breederId' }, { type: 'string', name: 'poultryId' }] }),
  ...createDoc('/breeders/{breederId}/poultries/{poultryId}/advertisings/{advertisingId}', ['Remove advertising'], [
    {
      method: 'delete',
      title: 'Remove poultry advertising',
      description: 'Route to remove poultry advertising',
      headerParams: [{ type: 'string', name: 'X-Cig-Token' }],
    },
  ], {
    pathVariables: [
      { type: 'string', name: 'breederId' },
      { type: 'string', name: 'poultryId' },
      { type: 'string', name: 'advertisingId' },
    ]
  }),
}

export default poultryDocs
