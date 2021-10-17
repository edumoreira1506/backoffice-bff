import { breederFactory, poultryFactory } from '@cig-platform/factories'

import { PoultryAggregator } from '@Aggregators/PoultryAggregator'

describe('PoultryAggregator', () => {
  describe('.postPoultry', () => {
    it('post a poultry', async () => {
      const poultry = poultryFactory()
      const breeder = breederFactory()
      const breederId = breeder.id
      const mockPoultryServiceClient: any = {
        postPoultry: jest.fn(),
      }
      const poultryAggregator = new PoultryAggregator(mockPoultryServiceClient)

      await poultryAggregator.postPoultry(poultry, breederId)

      expect(mockPoultryServiceClient.postPoultry).toHaveBeenCalledTimes(1)
      expect(mockPoultryServiceClient.postPoultry).toHaveBeenCalledWith(breederId, poultry)
    })
  })
})
