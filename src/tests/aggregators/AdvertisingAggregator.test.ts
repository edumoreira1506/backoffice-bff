import { advertisingFactory, breederFactory, dealFactory, merchantFactory, poultryFactory } from '@cig-platform/factories'

import { AdvertisingAggregator } from '@Aggregators/AdvertisingAggregator'
import { DealEventValueEnum, RegisterTypeEnum } from '@cig-platform/enums'
import DealRunningError from '@Errors/DealRunningError'
import DealAggregator from '@Aggregators/DealAggregator'

describe('AdvertisingAggregator', () => {
  describe('postAdvertising', () => {
    it('register info in poultry history and change current advertising price', async () => {
      const advertising = advertisingFactory()
      const breeder = breederFactory()
      const poultry = poultryFactory()
      const merchant = merchantFactory({ externalId: breeder.id })
      const fakeAdvertisingServiceClient: any = {
        postAdvertising: jest.fn().mockResolvedValue(advertising)
      }
      const fakePoultryServiceClient: any = {
        getPoultry: jest.fn().mockResolvedValue(poultry),
        getBreeder: jest.fn().mockResolvedValue(breeder),
        postRegister: jest.fn(),
        updatePoultry: jest.fn()
      }
      const advertisingAggregator = new AdvertisingAggregator(
        fakeAdvertisingServiceClient,
        fakePoultryServiceClient,
        {} as any
      )

      await advertisingAggregator.postAdvertising(advertising, merchant.id, breeder.id)

      expect(fakeAdvertisingServiceClient.postAdvertising).toHaveBeenCalledWith(merchant.id, advertising)
      expect(fakePoultryServiceClient.getPoultry).toHaveBeenCalledWith(breeder.id, advertising.externalId)
      expect(fakePoultryServiceClient.getBreeder).toBeCalledWith(breeder.id)
      expect(fakePoultryServiceClient.postRegister).toHaveBeenCalledWith(
        breeder.id,
        advertising.externalId,
        expect.objectContaining({
          metadata: { advertisingId: advertising.id },
          type: RegisterTypeEnum.Advertising,
        }),
        []
      )
      expect(fakePoultryServiceClient.updatePoultry).toHaveBeenCalledWith(
        breeder.id,
        advertising.externalId,
        { forSale: true, currentAdvertisingPrice: advertising.price }
      )
    })
  })

  describe('updateAdvertising', () => {
    it('updates current advertising price of poultry and advertising price', async () => {
      const newPrice = 150000
      const advertising = advertisingFactory()
      const breeder = breederFactory()
      const poultry = poultryFactory()
      const merchant = merchantFactory({ externalId: breeder.id })
      const fakeDealServiceClient: any = {
        getDeals: jest.fn().mockResolvedValue({ deals: [] }),
        getDealEvents: jest.fn().mockResolvedValue([])
      }
      const fakeAdvertisingServiceClient: any = {
        updateAdvertising: jest.fn()
      }
      const fakePoultryServiceClient: any = {
        updatePoultry: jest.fn()
      }
      const advertisingAggregator = new AdvertisingAggregator(
        fakeAdvertisingServiceClient,
        fakePoultryServiceClient,
        fakeDealServiceClient
      )

      await advertisingAggregator.updateAdvertising({
        advertisingId: advertising.id,
        breederId: breeder.id,
        merchantId: merchant.id,
        poultryId: poultry.id,
        price: newPrice
      })

      expect(fakeDealServiceClient.getDeals).toHaveBeenCalledWith({ advertisingId: advertising.id })
      expect(fakeDealServiceClient.getDealEvents).not.toHaveBeenCalled()
      expect(fakeAdvertisingServiceClient.updateAdvertising).toHaveBeenCalledWith(
        merchant.id,
        advertising.id,
        newPrice
      )
      expect(fakePoultryServiceClient.updatePoultry).toHaveBeenCalledWith(
        breeder.id,
        poultry.id,
        {
          currentAdvertisingPrice: newPrice
        }
      )
    })

    it('throwns an error when has confirmed deals', async () => {
      const newPrice = 150000
      const advertising = advertisingFactory()
      const breeder = breederFactory()
      const poultry = poultryFactory()
      const deal = dealFactory()
      const merchant = merchantFactory({ externalId: breeder.id })
      const fakeDealServiceClient: any = {
        getDeals: jest.fn().mockResolvedValue({ deals: [deal] }),
        getDealEvents: jest.fn().mockResolvedValue([
          { value: DealEventValueEnum.placed, },
          { value: DealEventValueEnum.confirmed, },
        ])
      }
      const fakeAdvertisingServiceClient: any = {
        updateAdvertising: jest.fn()
      }
      const fakePoultryServiceClient: any = {
        updatePoultry: jest.fn()
      }
      const advertisingAggregator = new AdvertisingAggregator(
        fakeAdvertisingServiceClient,
        fakePoultryServiceClient,
        fakeDealServiceClient
      )

      await expect(advertisingAggregator.updateAdvertising({
        advertisingId: advertising.id,
        breederId: breeder.id,
        merchantId: merchant.id,
        poultryId: poultry.id,
        price: newPrice
      })).rejects.toThrow(DealRunningError)

      expect(fakeDealServiceClient.getDeals).toHaveBeenCalledWith({ advertisingId: advertising.id })
      expect(fakeDealServiceClient.getDealEvents).toHaveBeenCalledWith(deal.id)
      expect(fakeAdvertisingServiceClient.updateAdvertising).not.toHaveBeenCalled()
      expect(fakePoultryServiceClient.updatePoultry).not.toHaveBeenCalled()
    })
  })

  describe('removeAdvertising', () => {
    it('cancel deal, remove advertising, post register and update poultry', async () => {
      const mockCancelDeal = jest.fn()

      jest.spyOn(DealAggregator, 'cancelDeal').mockImplementation(mockCancelDeal)

      const advertising = advertisingFactory()
      const breeder = breederFactory()
      const poultry = poultryFactory()
      const merchant = merchantFactory({ externalId: breeder.id })
      const deal = dealFactory()
      const fakeDealServiceClient: any = {
        getDeals: jest.fn().mockResolvedValue({ deals: [deal] }),
        getDealEvents: jest.fn().mockResolvedValue([])
      }
      const fakeAdvertisingServiceClient: any = {
        removeAdvertising: jest.fn()
      }
      const fakePoultryServiceClient: any = {
        updatePoultry: jest.fn(),
        getPoultry: jest.fn().mockResolvedValue(poultry),
        getBreeder: jest.fn().mockResolvedValue(breeder),
        postRegister: jest.fn()
      }
      const advertisingAggregator = new AdvertisingAggregator(
        fakeAdvertisingServiceClient,
        fakePoultryServiceClient,
        fakeDealServiceClient
      )

      await advertisingAggregator.removeAdvertising({
        advertisingId: advertising.id,
        breederId: breeder.id,
        merchantId: merchant.id,
        poultryId: poultry.id
      })

      expect(fakeDealServiceClient.getDeals).toHaveBeenCalledWith({
        advertisingId: advertising.id
      })
      expect(fakeDealServiceClient.getDealEvents).toHaveBeenCalledWith(deal.id)
      expect(fakePoultryServiceClient.getPoultry).toHaveBeenCalledWith(breeder.id, poultry.id)
      expect(fakePoultryServiceClient.getBreeder).toHaveBeenCalledWith(breeder.id)
      expect(mockCancelDeal).toHaveBeenCalledWith(deal.id, 'Anúncio cancelado')
      expect(fakeAdvertisingServiceClient.removeAdvertising).toHaveBeenCalledWith(merchant.id, advertising.id)
      expect(fakePoultryServiceClient.postRegister).toHaveBeenCalledWith(
        breeder.id,
        poultry.id,
        expect.objectContaining({
          metadata: { advertisingId: advertising.id },
          type: RegisterTypeEnum.RemoveAdvertising,
        }),
        []
      )
      expect(fakePoultryServiceClient.updatePoultry).toHaveBeenCalledWith(
        breeder.id,
        poultry.id,
        {
          forSale: false,
          currentAdvertisingPrice: null
        }
      )
    })

    it('throwns an error when has confirmed deals', async () => {
      const mockCancelDeal = jest.fn()

      jest.spyOn(DealAggregator, 'cancelDeal').mockImplementation(mockCancelDeal)

      const advertising = advertisingFactory()
      const breeder = breederFactory()
      const poultry = poultryFactory()
      const merchant = merchantFactory({ externalId: breeder.id })
      const deal = dealFactory()
      const fakeDealServiceClient: any = {
        getDeals: jest.fn().mockResolvedValue({ deals: [deal] }),
        getDealEvents: jest.fn().mockResolvedValue([
          { value: DealEventValueEnum.placed, },
          { value: DealEventValueEnum.confirmed, },
        ])
      }
      const fakeAdvertisingServiceClient: any = {
        removeAdvertising: jest.fn()
      }
      const fakePoultryServiceClient: any = {
        updatePoultry: jest.fn(),
        getPoultry: jest.fn().mockResolvedValue(poultry),
        getBreeder: jest.fn().mockResolvedValue(breeder),
        postRegister: jest.fn()
      }
      const advertisingAggregator = new AdvertisingAggregator(
        fakeAdvertisingServiceClient,
        fakePoultryServiceClient,
        fakeDealServiceClient
      )

      await expect(advertisingAggregator.removeAdvertising({
        advertisingId: advertising.id,
        breederId: breeder.id,
        merchantId: merchant.id,
        poultryId: poultry.id
      })).rejects.toThrow(DealRunningError)
      expect(fakeDealServiceClient.getDeals).toHaveBeenCalledWith({
        advertisingId: advertising.id
      })
      expect(fakeDealServiceClient.getDealEvents).toHaveBeenCalledWith(deal.id)
      expect(fakePoultryServiceClient.getPoultry).not.toHaveBeenCalled()
      expect(fakePoultryServiceClient.getBreeder).not.toHaveBeenCalled()
      expect(mockCancelDeal).not.toHaveBeenCalled()
      expect(fakeAdvertisingServiceClient.removeAdvertising).not.toHaveBeenCalled()
      expect(fakePoultryServiceClient.postRegister).not.toHaveBeenCalledWith()
      expect(fakePoultryServiceClient.updatePoultry).not.toHaveBeenCalledWith()
    })
  })
})