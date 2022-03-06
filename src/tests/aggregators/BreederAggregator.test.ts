import faker from '@faker-js/faker'
import { breederFactory } from '@cig-platform/factories'

import { BreederAggregator } from '@Aggregators/BreederAggregator'

describe('BreederAggregator', () => {
  describe('.getBreederInfo', () => {
    it('returns the breeder and images', async () => {
      const breeder = breederFactory()
      const images: any[] = []
      const contacts: any[] = []
      const mockPoultryServiceClient: any = {
        getBreeder: jest.fn().mockResolvedValue(breeder),
        getBreederImages: jest.fn().mockResolvedValue(images),
        getBreederContacts: jest.fn().mockResolvedValue(contacts)
      }
      const breederAggregator = new BreederAggregator(mockPoultryServiceClient)
      const breederInfo = await breederAggregator.getBreederInfo(breeder.id)

      expect(breederInfo).toMatchObject({
        ...breederInfo,
        images,
        contacts
      })
    })
  })

  describe('.updateBreederInfo', () => {
    it('removes the deletedImages', async () => {
      const breeder = breederFactory()
      const breederId = breeder.id
      const deletedImages = [faker.datatype.uuid()]
      const mockPoultryServiceClient: any = {
        removeBreederImage: jest.fn(),
        updateBreeder: jest.fn()
      }
      const breederAggregator = new BreederAggregator(mockPoultryServiceClient)

      await breederAggregator.updateBreederInfo(breederId, breeder, deletedImages)

      expect(mockPoultryServiceClient.removeBreederImage).toHaveBeenCalledTimes(1)
      expect(mockPoultryServiceClient.removeBreederImage).toHaveBeenCalledWith(breederId, deletedImages[0])
    })

    it('removes the deletedContacts', async () => {
      const breeder = breederFactory()
      const breederId = breeder.id
      const deletedContacts = [faker.datatype.uuid()]
      const mockPoultryServiceClient: any = {
        removeBreederContact: jest.fn(),
        updateBreeder: jest.fn(),
        postBreederImages: jest.fn()
      }
      const breederAggregator = new BreederAggregator(mockPoultryServiceClient)

      await breederAggregator.updateBreederInfo(breederId, breeder, [], [], deletedContacts)

      expect(mockPoultryServiceClient.removeBreederContact).toHaveBeenCalledTimes(1)
      expect(mockPoultryServiceClient.removeBreederContact).toHaveBeenCalledWith(breederId, deletedContacts[0])
    })

    it('register the new images', async () => {
      const breeder = breederFactory()
      const breederId = breeder.id
      const deletedImages: any[] = []
      const newImages: any[] = ['']
      const mockPoultryServiceClient: any = {
        removeBreederImage: jest.fn(),
        updateBreeder: jest.fn(),
        postBreederImages: jest.fn()
      }
      const breederAggregator = new BreederAggregator(mockPoultryServiceClient)

      await breederAggregator.updateBreederInfo(breederId, breeder, deletedImages, newImages)

      expect(mockPoultryServiceClient.postBreederImages).toHaveBeenCalledWith(breederId, newImages)
    })

    it('updates the breeder', async () => {
      const breeder = breederFactory()
      const breederId = breeder.id
      const deletedImages: any[] = []
      const mockPoultryServiceClient: any = {
        removeBreederImage: jest.fn(),
        updateBreeder: jest.fn(),
        postBreederImages: jest.fn()
      }
      const breederAggregator = new BreederAggregator(mockPoultryServiceClient)

      await breederAggregator.updateBreederInfo(breederId, breeder, deletedImages)

      expect(mockPoultryServiceClient.updateBreeder).toHaveBeenCalledWith(breederId, breeder)
    })
  })
})
