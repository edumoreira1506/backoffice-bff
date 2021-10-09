import { breederFactory } from '@cig-platform/factories'

import { BreederAggregator } from '@Aggregators/BreederAggregator'

describe('BreederAggregator', () => {
  describe('.getBreederInfo', () => {
    it('returns the breeder and images', async () => {
      const breeder = breederFactory()
      const images: any[] = []
      const mockPoultryServiceClient: any = {
        getBreeder: jest.fn().mockResolvedValue(breeder),
        getBreederImages: jest.fn().mockResolvedValue(images)
      }
      const breederAggregator = new BreederAggregator(mockPoultryServiceClient)
      const breederInfo = await breederAggregator.getBreederInfo(breeder.id)

      expect(breederInfo).toMatchObject({
        ...breederInfo,
        images
      })
    })
  })
})
