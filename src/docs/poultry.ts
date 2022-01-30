import { createDoc } from '@cig-platform/docs'

import { storeAdvertisingQuestionAnswerSchema } from '@Schemas/AdvertisingQuestionAnswerSchemas'
import { storeAdvertisingSchema, updateAdvertisingSchema } from '@Schemas/AdvertisingSchemas'
import { storePoultrySchema, transferPoultrySchema, updatePoultrySchema } from '@Schemas/PoultrySchemas'
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
      queryParams: [{ type: 'string', name: 'registerType' }],
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
    {
      method: 'patch',
      title: 'Update poultry advertising',
      description: 'Route to update poultry advertising',
      headerParams: [{ type: 'string', name: 'X-Cig-Token' }],
      objectSchema: updateAdvertisingSchema
    },
  ], {
    pathVariables: [
      { type: 'string', name: 'breederId' },
      { type: 'string', name: 'poultryId' },
      { type: 'string', name: 'advertisingId' },
    ]
  }),
  ...createDoc('/breeders/{breederId}/poultries/{poultryId}/advertisings/{advertisingId}/questions/{questionId}/answers', ['Advertising question answer'], [
    {
      method: 'post',
      title: 'Register poultry advertising question answer',
      description: 'Route to register poultry advertising question answer',
      headerParams: [{ type: 'string', name: 'X-Cig-Token' }],
      objectSchema: storeAdvertisingQuestionAnswerSchema
    },
  ], {
    pathVariables: [
      { type: 'string', name: 'breederId' },
      { type: 'string', name: 'poultryId' },
      { type: 'string', name: 'advertisingId' },
      { type: 'string', name: 'questionId' },
    ]
  }),
  ...createDoc('/breeders/{breederId}/poultries/{poultryId}/advertisings/{advertisingId}/deals/{dealId}/confirm', ['Deal'], [
    {
      method: 'post',
      title: 'Confirm deal',
      description: 'Route to confirm deal',
      headerParams: [{ type: 'string', name: 'X-Cig-Token' }],
    },
  ], {
    pathVariables: [
      { type: 'string', name: 'breederId' },
      { type: 'string', name: 'poultryId' },
      { type: 'string', name: 'advertisingId' },
      { type: 'string', name: 'dealId' },
    ]
  }),
  ...createDoc('/breeders/{breederId}/poultries/{poultryId}/transfer', ['Transfer poultry'], [
    {
      method: 'post',
      title: 'Transfer poultry',
      headerParams: [{ type: 'string', name: 'X-Cig-Token' }],
      objectSchema: transferPoultrySchema,
    },
  ], {
    pathVariables: [
      { type: 'string', name: 'breederId' },
      { type: 'string', name: 'poultryId' },
    ]
  }),
}

export default poultryDocs
