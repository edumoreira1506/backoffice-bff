import { createDoc } from '@cig-platform/docs'

const breederDocs = {
  ...createDoc('/breeders/{breederId}', ['Breeders'], [
    {
      method: 'patch',
      title: 'Update breeder',
      description: 'Route to update breeder',
      headerParams: [{ type: 'string', name: 'X-Cig-Token' }],
      files: ['files']
    },
    {
      method: 'get',
      title: 'Get breeder',
      description: 'Route to get breeder infos',
      headerParams: [{ type: 'string', name: 'X-Cig-Token' }]
    }
  ], { pathVariables: [{ type: 'string', name: 'breederId' }] }),
}

export default breederDocs
