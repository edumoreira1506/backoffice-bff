import { breederFactory, poultryFactory } from '@cig-platform/factories'

import { PoultryAggregator } from '@Aggregators/PoultryAggregator'

describe('PoultryAggregator', () => {
  describe('.postPoultry', () => {
    it('post a poultry', async () => {
      const poultry = poultryFactory()
      const breeder = breederFactory()
      const breederId = breeder.id
      const images = [] as File[]
      const mockPoultryServiceClient: any = {
        postPoultry: jest.fn().mockResolvedValue(poultry),
        postPoultryImages: jest.fn()
      }
      const poultryAggregator = new PoultryAggregator(mockPoultryServiceClient)

      await poultryAggregator.postPoultry(poultry, breederId, images)

      expect(mockPoultryServiceClient.postPoultryImages).toHaveBeenCalledWith(breederId, poultry.id, images)
      expect(mockPoultryServiceClient.postPoultry).toHaveBeenCalledTimes(1)
      expect(mockPoultryServiceClient.postPoultry).toHaveBeenCalledWith(breederId, poultry)
    })
  })

  describe('.getPoultries', () => {
    it('returns the poultries', async () => {
      const poultries = [poultryFactory()]
      const breeder = breederFactory()
      const breederId = breeder.id
      const mockPoultryServiceClient: any = {
        getPoultries: jest.fn().mockResolvedValue(poultries),
      }
      const poultryAggregator = new PoultryAggregator(mockPoultryServiceClient)

      const result = await poultryAggregator.getPoultries(breederId)

      expect(mockPoultryServiceClient.getPoultries).toHaveBeenCalledTimes(1)
      expect(mockPoultryServiceClient.getPoultries).toHaveBeenCalledWith(breederId)
      expect(result).toBe(poultries)
    })
  })
})
