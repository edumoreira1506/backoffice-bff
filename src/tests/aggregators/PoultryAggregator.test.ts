import { advertisingFactory, breederFactory, dealFactory, merchantFactory, poultryFactory } from '@cig-platform/factories'

import { PoultryAggregator } from '@Aggregators/PoultryAggregator'
import { DealEventValueEnum, RegisterTypeEnum } from '@cig-platform/enums'
import AdvertisingAggregator from '@Aggregators/AdvertisingAggregator'
import DealAggregator from '@Aggregators/DealAggregator'
import DealRunningError from '@Errors/DealRunningError'

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
      const mockAdvertisingServiceClient: any = {}
      const mockDealServiceClient: any = {}
      const poultryAggregator = new PoultryAggregator(
        mockPoultryServiceClient,
        mockAdvertisingServiceClient,
        mockDealServiceClient
      )

      await poultryAggregator.postPoultry(poultry, breederId, images)

      expect(mockPoultryServiceClient.postPoultryImages).toHaveBeenCalledWith(breederId, poultry.id, images)
      expect(mockPoultryServiceClient.postPoultry).toHaveBeenCalledTimes(1)
      expect(mockPoultryServiceClient.postPoultry).toHaveBeenCalledWith(breederId, poultry)
    })

    it('post a register in poultry history', async () => {
      const register = { weight: 150, measurement: 150 }
      const poultry = poultryFactory()
      const breeder = breederFactory()
      const breederId = breeder.id
      const images = [] as File[]
      const mockPoultryServiceClient: any = {
        postPoultry: jest.fn().mockResolvedValue(poultry),
        postPoultryImages: jest.fn(),
        postRegister: jest.fn()
      }
      const mockAdvertisingServiceClient: any = {}
      const mockDealServiceClient: any = {}
      const poultryAggregator = new PoultryAggregator(
        mockPoultryServiceClient,
        mockAdvertisingServiceClient,
        mockDealServiceClient
      )

      await poultryAggregator.postPoultry(poultry, breederId, images, register)

      expect(mockPoultryServiceClient.postRegister).toHaveBeenCalledWith(
        breeder.id,
        poultry.id,
        {
          metadata: register,
          type: RegisterTypeEnum.MeasurementAndWeighing,
        },
        []
      )
    })
  })

  describe('.transferPoultry', () => {
    it('cancel deals, remove advertising, transfer poultry and register in poultry history', async () => {
      const poultry = poultryFactory()
      const breeder = breederFactory()
      const targetBreeder = breederFactory()
      const merchant = merchantFactory()
      const advertising = advertisingFactory()
      const deal= dealFactory()
      const mockRemoveAdvertising = jest.fn()
      const mockCancelDeal = jest.fn()
      jest.spyOn(AdvertisingAggregator, 'removeAdvertising').mockImplementation(mockRemoveAdvertising)
      jest.spyOn(DealAggregator, 'cancelDeal').mockImplementation(mockCancelDeal)
      const mockPoultryServiceClient: any = {
        getPoultry: jest.fn().mockResolvedValue(poultry),
        transferPoultry: jest.fn(),
        getBreeder: jest.fn().mockResolvedValue(breeder),
        postRegister: jest.fn()
      }
      const mockAdvertisingServiceClient: any = {
        getAdvertisings: jest.fn().mockResolvedValue([advertising]),
      }
      const mockDealServiceClient: any = {
        getDeals: jest.fn().mockResolvedValue({
          deals: [deal]
        }),
        getDealEvents: jest.fn().mockResolvedValue([]),
        registerDealEvent: jest.fn(),
        updateDeal: jest.fn(),
      }
      const poultryAggregator = new PoultryAggregator(
        mockPoultryServiceClient,
        mockAdvertisingServiceClient,
        mockDealServiceClient
      )

      await poultryAggregator.transferPoultry(breeder.id, poultry.id, targetBreeder.id, merchant.id)

      expect(mockAdvertisingServiceClient.getAdvertisings).toHaveBeenCalledWith(merchant.id, poultry.id, false)
      expect(mockDealServiceClient.getDeals).toHaveBeenCalledWith({ advertisingId: advertising.id })
      expect(mockDealServiceClient.getDealEvents).toHaveBeenCalledWith(deal.id)
      expect(mockCancelDeal).toHaveBeenCalledWith(deal.id, 'Anúncio cancelado')
      expect(mockRemoveAdvertising).toHaveBeenCalledWith({
        advertisingId: advertising.id,
        merchantId: merchant.id,
        breederId: breeder.id,
        poultryId: poultry.id,
      })
      expect(mockPoultryServiceClient.getPoultry).toHaveBeenCalledWith(breeder.id, poultry.id)
      expect(mockPoultryServiceClient.transferPoultry).toHaveBeenCalledWith(breeder.id, poultry.id, targetBreeder.id)
      expect(mockPoultryServiceClient.getBreeder).toHaveBeenCalledTimes(2)
      expect(mockPoultryServiceClient.getBreeder).toHaveBeenCalledWith(breeder.id)
      expect(mockPoultryServiceClient.getBreeder).toHaveBeenCalledWith(targetBreeder.id)
      expect(mockPoultryServiceClient.postRegister).toHaveBeenCalledWith(targetBreeder.id, poultry.id, expect.objectContaining({
        metadata: { targetBreederId: targetBreeder.id, originBreederId: breeder.id },
        type: RegisterTypeEnum.Transfer,
      }), [])
    })

    it('throwns an error when has a confirmed deal', async () => {
      const poultry = poultryFactory()
      const breeder = breederFactory()
      const targetBreeder = breederFactory()
      const merchant = merchantFactory()
      const advertising = advertisingFactory()
      const deal= dealFactory()
      const mockRemoveAdvertising = jest.fn()
      const mockCancelDeal = jest.fn()
      jest.spyOn(AdvertisingAggregator, 'removeAdvertising').mockImplementation(mockRemoveAdvertising)
      jest.spyOn(DealAggregator, 'cancelDeal').mockImplementation(mockCancelDeal)
      const mockPoultryServiceClient: any = {
        getPoultry: jest.fn().mockResolvedValue(poultry),
        transferPoultry: jest.fn(),
        getBreeder: jest.fn().mockResolvedValue(breeder),
        postRegister: jest.fn()
      }
      const mockAdvertisingServiceClient: any = {
        getAdvertisings: jest.fn().mockResolvedValue([advertising]),
      }
      const mockDealServiceClient: any = {
        getDeals: jest.fn().mockResolvedValue({
          deals: [deal]
        }),
        getDealEvents: jest.fn().mockResolvedValue([
          { value: DealEventValueEnum.placed },
          { value: DealEventValueEnum.confirmed },
        ]),
        registerDealEvent: jest.fn(),
        updateDeal: jest.fn(),
      }
      const poultryAggregator = new PoultryAggregator(
        mockPoultryServiceClient,
        mockAdvertisingServiceClient,
        mockDealServiceClient
      )

      await expect(poultryAggregator.transferPoultry(breeder.id, poultry.id, targetBreeder.id, merchant.id)).rejects.toThrow(DealRunningError)

      expect(mockAdvertisingServiceClient.getAdvertisings).toHaveBeenCalledWith(merchant.id, poultry.id, false)
      expect(mockDealServiceClient.getDeals).toHaveBeenCalledWith({ advertisingId: advertising.id })
      expect(mockDealServiceClient.getDealEvents).toHaveBeenCalledWith(deal.id)
      expect(mockCancelDeal).not.toHaveBeenCalled()
      expect(mockRemoveAdvertising).not.toHaveBeenCalled()
      expect(mockPoultryServiceClient.getPoultry).not.toHaveBeenCalled()
      expect(mockPoultryServiceClient.transferPoultry).not.toHaveBeenCalled()
      expect(mockPoultryServiceClient.getBreeder).not.toHaveBeenCalled()
      expect(mockPoultryServiceClient.postRegister).not.toHaveBeenCalled()
    })
  })

  describe('.updatePoultry', () => {
    it('update poultry, post poultry images and remove poultry images', async () => {
      const poultry = poultryFactory()
      const breeder = breederFactory()
      const deletedImages = ['Example']
      const images = [] as any[]
      const mockPoultryServiceClient: any = {
        updatePoultry: jest.fn(),
        postPoultryImages: jest.fn(),
        removePoultryImage: jest.fn(),
      }
      const mockAdvertisingServiceClient: any = {}
      const mockDealServiceClient: any = {}
      const poultryAggregator = new PoultryAggregator(
        mockPoultryServiceClient,
        mockAdvertisingServiceClient,
        mockDealServiceClient
      )

      await poultryAggregator.updatePoultry(breeder.id, poultry.id, poultry, images, deletedImages)

      expect(mockPoultryServiceClient.updatePoultry).toHaveBeenCalledWith(breeder.id, poultry.id, poultry)
      expect(mockPoultryServiceClient.postPoultryImages).toHaveBeenCalledWith(breeder.id, poultry.id, images)
      expect(mockPoultryServiceClient.removePoultryImage).toHaveBeenCalledTimes(deletedImages.length)

      deletedImages.forEach(deletedImage => {
        expect(mockPoultryServiceClient.removePoultryImage).toHaveBeenCalledWith(breeder.id, poultry.id, deletedImage)
      })
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
      const mockAdvertisingServiceClient: any = {}
      const mockDealServiceClient: any = {}
      const poultryAggregator = new PoultryAggregator(
        mockPoultryServiceClient,
        mockAdvertisingServiceClient,
        mockDealServiceClient
      )

      const result = await poultryAggregator.getPoultries(breederId)

      expect(mockPoultryServiceClient.getPoultries).toHaveBeenCalledTimes(4)
      expect(result).toMatchObject({
        reproductives: poultries,
        matrix: poultries,
        male: poultries,
        female: poultries,
      })
    })
  })

  describe('.getPoultry', () => {
    it('returns poultry and advertisings', async () => {
      const poultry = poultryFactory()
      const breeder = breederFactory()
      const merchant = merchantFactory()
      const images = [] as any[]
      const registers = [] as any[]
      const advertisings = [] as any[]
      const mockPoultryServiceClient: any = {
        getPoultry: jest.fn().mockResolvedValue(poultry),
        getPoultryImages: jest.fn().mockResolvedValue(images),
        getRegisters: jest.fn().mockResolvedValue(registers),
      }
      const mockAdvertisingServiceClient: any = {
        getAdvertisings: jest.fn().mockResolvedValue(advertisings)
      }
      const mockDealServiceClient: any = {}
      const poultryAggregator = new PoultryAggregator(
        mockPoultryServiceClient,
        mockAdvertisingServiceClient,
        mockDealServiceClient
      )

      const poultryData = await poultryAggregator.getPoultry(merchant, breeder.id, poultry.id)

      expect(poultryData).toMatchObject({
        poultry: {
          ...poultry,
          images,
          registers
        },
        advertisings
      })
      expect(mockPoultryServiceClient.getPoultry).toHaveBeenCalledWith(breeder.id, poultry.id)
      expect(mockPoultryServiceClient.getPoultryImages).toHaveBeenCalledWith(breeder.id, poultry.id)
      expect(mockPoultryServiceClient.getRegisters).toHaveBeenCalledWith(breeder.id, poultry.id)
      expect(mockAdvertisingServiceClient.getAdvertisings).toHaveBeenCalledWith(merchant.id, poultry.id, false)
    })
  })
})
