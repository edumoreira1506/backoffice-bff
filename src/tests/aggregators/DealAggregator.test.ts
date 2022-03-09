import { DealEventValueEnum, RegisterTypeEnum } from '@cig-platform/enums'
import {
  advertisingFactory,
  breederFactory,
  dealFactory,
  merchantFactory,
  poultryFactory,
  poultryRegisterFactory
} from '@cig-platform/factories'

import { DealAggregator } from '@Aggregators/DealAggregator'
import PoultryAggregator from '@Aggregators/PoultryAggregator'
import FinishedDealError from '@Errors/FinishedDealError'
import AlreadyConfirmedError from '@Errors/AlreadyConfirmedError'

describe('DealAggregator', () => {
  describe('getDeals', () => {
    it('returns deals incudling all data', async () => {
      const deal = dealFactory()
      const advertising = advertisingFactory()
      const merchant = merchantFactory()
      const poultry = poultryFactory()
      const breeder = breederFactory()
      const images = [] as any[]
      const pages = 1
      const register = poultryRegisterFactory({
        metadata: {
          weight: 150,
          measurement: 150
        },
        type: RegisterTypeEnum.MeasurementAndWeighing
      })
      const mockPoultryServiceClient: any = {
        getPoultryDirectly: jest.fn().mockResolvedValue(poultry),
        getPoultryImages: jest.fn().mockResolvedValue(images),
        getRegisters: jest.fn().mockResolvedValue([register]),
        getBreeder: jest.fn().mockResolvedValue(breeder)
      }
      const mockDealServiceClient: any = {
        getDeals: jest.fn().mockResolvedValue({
          deals: [deal],
          pages
        })
      }
      const mockAdvertisingServiceClient: any = {
        getAdvertising: jest.fn().mockResolvedValue(advertising),
        getMerchant: jest.fn().mockResolvedValue(merchant)
      }

      const dealAggregator = new DealAggregator(
        mockDealServiceClient,
        mockPoultryServiceClient,
        mockAdvertisingServiceClient
      )

      const data = await dealAggregator.getDeals('SELLER', merchant)

      expect(data).toMatchObject({
        pages,
        deals: [
          {
            deal,
            breeder,
            poultry,
            advertising,
            measurementAndWeight: [register],
          }
        ]
      })
      expect(mockAdvertisingServiceClient.getAdvertising).toHaveBeenCalledWith(deal.sellerId, deal.advertisingId)
      expect(mockAdvertisingServiceClient.getMerchant).toHaveBeenCalledTimes(2)
      expect(mockPoultryServiceClient.getPoultryDirectly).toHaveBeenCalledWith(advertising.externalId)
      expect(mockPoultryServiceClient.getRegisters).toHaveBeenCalled()
      expect(mockPoultryServiceClient.getPoultryImages).toHaveBeenCalled()
      expect(mockPoultryServiceClient.getBreeder).toHaveBeenCalled()
    })
  })

  describe('getDeal', () => {
    it('returns deal incudling all data', async () => {
      const deal = dealFactory()
      const advertising = advertisingFactory()
      const merchant = merchantFactory()
      const poultry = poultryFactory()
      const breeder = breederFactory()
      const events = [] as any[]
      const contacts = [] as any[]
      const mockPoultryServiceClient: any = {
        getPoultryDirectly: jest.fn().mockResolvedValue(poultry),
        getBreeder: jest.fn().mockResolvedValue(breeder),
        getBreederContacts: jest.fn().mockResolvedValue(contacts),
      }
      const mockDealServiceClient: any = {
        getDeal: jest.fn().mockResolvedValue(deal),
        getDealEvents: jest.fn().mockResolvedValue(events)
      }
      const mockAdvertisingServiceClient: any = {
        getAdvertising: jest.fn().mockResolvedValue(advertising),
        getMerchant: jest.fn().mockResolvedValue(merchant)
      }

      const dealAggregator = new DealAggregator(
        mockDealServiceClient,
        mockPoultryServiceClient,
        mockAdvertisingServiceClient
      )

      const data = await dealAggregator.getDeal(merchant, deal.id)

      expect(data).toMatchObject({
        deal,
        breeder,
        poultry,
        advertising,
        events,
        breederContacts: contacts
      })
      expect(mockDealServiceClient.getDeal).toHaveBeenCalledWith(deal.id)
      expect(mockAdvertisingServiceClient.getAdvertising).toHaveBeenCalledWith(deal.sellerId, deal.advertisingId)
      expect(mockPoultryServiceClient.getPoultryDirectly).toHaveBeenCalledWith(advertising.externalId)
      expect(mockAdvertisingServiceClient.getMerchant).toHaveBeenCalledTimes(2)
      expect(mockPoultryServiceClient.getBreeder).toHaveBeenCalledWith(merchant.externalId)
      expect(mockPoultryServiceClient.getBreederContacts).toHaveBeenCalledWith(merchant.externalId)
      expect(mockDealServiceClient.getDealEvents).toHaveBeenCalledWith(deal.id)
    })
  })

  describe('finishDeal', () => {
    it('transfer poultry, register in poultry history, update deal, advertising and poultry', async () => {
      const deal = dealFactory()
      const advertising = advertisingFactory()
      const merchant = merchantFactory()
      const poultry = poultryFactory()
      const breeder = breederFactory()
      const events = [] as any[]
      const contacts = [] as any[]
      const mockTransferPoultry = jest.fn()
      jest.spyOn(PoultryAggregator, 'transferPoultry').mockImplementation(mockTransferPoultry)
      const mockPoultryServiceClient: any = {
        getPoultry: jest.fn().mockResolvedValue(poultry),
        getBreeder: jest.fn().mockResolvedValue(breeder),
        getBreederContacts: jest.fn().mockResolvedValue(contacts),
        updatePoultry: jest.fn()
      }
      const mockDealServiceClient: any = {
        getDeal: jest.fn().mockResolvedValue(deal),
        getDealEvents: jest.fn().mockResolvedValue(events),
        registerDealEvent: jest.fn(),
        updateDeal: jest.fn(),
      }
      const mockAdvertisingServiceClient: any = {
        getAdvertising: jest.fn().mockResolvedValue(advertising),
        getMerchant: jest.fn().mockResolvedValue(merchant),
        updateAdvertising: jest.fn(),
      }

      const dealAggregator = new DealAggregator(
        mockDealServiceClient,
        mockPoultryServiceClient,
        mockAdvertisingServiceClient
      )

      await dealAggregator.finishDeal(deal.id)

      expect(mockDealServiceClient.getDeal).toHaveBeenCalledWith(deal.id)
      expect(mockAdvertisingServiceClient.getMerchant).toHaveBeenCalledTimes(2)
      expect(mockPoultryServiceClient.getBreeder).toHaveBeenCalledTimes(2)
      expect(mockAdvertisingServiceClient.getAdvertising).toHaveBeenCalledWith(deal.sellerId, deal.advertisingId)
      expect(mockPoultryServiceClient.getPoultry).toHaveBeenCalledWith(breeder.id, advertising.externalId)
      expect(mockDealServiceClient.registerDealEvent).toHaveBeenCalledWith(
        deal.id,
        { value: DealEventValueEnum.received, metadata: {} }
      )
      expect(mockDealServiceClient.updateDeal).toHaveBeenCalledWith(deal.id, { finished: true })
      expect(mockAdvertisingServiceClient.updateAdvertising).toHaveBeenCalledWith(
        merchant.id,
        advertising.id,
        advertising.price,
        true
      )
      expect(mockPoultryServiceClient.updatePoultry).toHaveBeenCalledWith(
        breeder.id,
        poultry.id,
        { forSale: false, currentAdvertisingPrice: null }
      )
      expect(mockTransferPoultry).toHaveBeenCalledWith(
        breeder.id,
        poultry.id,
        breeder.id,
        merchant.id
      )
    })

    it('throwns an error when deal is finished or cancelled', async () => {
      const deal = dealFactory({ cancelled: true })
      const advertising = advertisingFactory()
      const merchant = merchantFactory()
      const poultry = poultryFactory()
      const breeder = breederFactory()
      const events = [] as any[]
      const contacts = [] as any[]
      const mockTransferPoultry = jest.fn()
      jest.spyOn(PoultryAggregator, 'transferPoultry').mockImplementation(mockTransferPoultry)
      const mockPoultryServiceClient: any = {
        getPoultry: jest.fn().mockResolvedValue(poultry),
        getBreeder: jest.fn().mockResolvedValue(breeder),
        getBreederContacts: jest.fn().mockResolvedValue(contacts),
        updatePoultry: jest.fn()
      }
      const mockDealServiceClient: any = {
        getDeal: jest.fn().mockResolvedValue(deal),
        getDealEvents: jest.fn().mockResolvedValue(events),
        registerDealEvent: jest.fn(),
        updateDeal: jest.fn(),
      }
      const mockAdvertisingServiceClient: any = {
        getAdvertising: jest.fn().mockResolvedValue(advertising),
        getMerchant: jest.fn().mockResolvedValue(merchant),
        updateAdvertising: jest.fn(),
      }

      const dealAggregator = new DealAggregator(
        mockDealServiceClient,
        mockPoultryServiceClient,
        mockAdvertisingServiceClient
      )

      await expect(dealAggregator.finishDeal(deal.id)).rejects.toThrow(FinishedDealError)

      expect(mockDealServiceClient.getDeal).toHaveBeenCalledWith(deal.id)
      expect(mockAdvertisingServiceClient.getMerchant).toHaveBeenCalledTimes(2)
      expect(mockPoultryServiceClient.getBreeder).toHaveBeenCalledTimes(2)
      expect(mockAdvertisingServiceClient.getAdvertising).toHaveBeenCalledWith(deal.sellerId, deal.advertisingId)
      expect(mockPoultryServiceClient.getPoultry).toHaveBeenCalledWith(breeder.id, advertising.externalId)
      expect(mockDealServiceClient.registerDealEvent).not.toHaveBeenCalled()
      expect(mockDealServiceClient.updateDeal).not.toHaveBeenCalled()
      expect(mockAdvertisingServiceClient.updateAdvertising).not.toHaveBeenCalled()
      expect(mockPoultryServiceClient.updatePoultry).not.toHaveBeenCalled()
      expect(mockTransferPoultry).not.toHaveBeenCalled()
    })
  })

  describe('confirmDeal', () => {
    it('cancel other deals and register confirmed deal event in confirmed deal', async () => {
      const deal = dealFactory()
      const advertising = advertisingFactory()
      const events = [] as any[]
      const mockPoultryServiceClient: any = {}
      const mockDealServiceClient: any = {
        getDeals: jest.fn().mockResolvedValue({
          deals: [deal]
        }),
        getDealEvents: jest.fn().mockResolvedValue(events),
        registerDealEvent: jest.fn(),
        updateDeal: jest.fn()
      }
      const mockAdvertisingServiceClient: any = {}

      const dealAggregator = new DealAggregator(
        mockDealServiceClient,
        mockPoultryServiceClient,
        mockAdvertisingServiceClient
      )

      await dealAggregator.confirmDeal({ dealId: deal.id, advertisingId: advertising.id })

      expect(mockDealServiceClient.getDealEvents).toHaveBeenCalledWith(deal.id)
      expect(mockDealServiceClient.getDeals).toHaveBeenCalledWith({ advertisingId: advertising.id })
      expect(mockDealServiceClient.registerDealEvent).toHaveBeenCalledWith(deal.id, {
        value: DealEventValueEnum.confirmed
      })
    })

    it('throwns an error when some deal has the confirmed event', async () => {
      const deal = dealFactory()
      const advertising = advertisingFactory()
      const events = [
        { value: DealEventValueEnum.placed },
        { value: DealEventValueEnum.confirmed },
      ] as any[]
      const mockPoultryServiceClient: any = {}
      const mockDealServiceClient: any = {
        getDeals: jest.fn().mockResolvedValue({
          deals: [deal]
        }),
        getDealEvents: jest.fn().mockResolvedValue(events),
        registerDealEvent: jest.fn(),
        updateDeal: jest.fn()
      }
      const mockAdvertisingServiceClient: any = {}

      const dealAggregator = new DealAggregator(
        mockDealServiceClient,
        mockPoultryServiceClient,
        mockAdvertisingServiceClient
      )

      await expect(dealAggregator.confirmDeal({ dealId: deal.id, advertisingId: advertising.id })).rejects.toThrow(AlreadyConfirmedError)

      expect(mockDealServiceClient.getDealEvents).toHaveBeenCalledWith(deal.id)
      expect(mockDealServiceClient.getDeals).not.toHaveBeenCalled()
      expect(mockDealServiceClient.registerDealEvent).not.toHaveBeenCalled()
    })
  })

  describe('cancelDeal', () => {
    it('register deal event and update deal', async () => {
      const deal = dealFactory()
      const reason = 'Razão doida!'
      const mockPoultryServiceClient: any = {}
      const mockDealServiceClient: any = {
        registerDealEvent: jest.fn(),
        updateDeal: jest.fn()
      }
      const mockAdvertisingServiceClient: any = {}

      const dealAggregator = new DealAggregator(
        mockDealServiceClient,
        mockPoultryServiceClient,
        mockAdvertisingServiceClient
      )

      await dealAggregator.cancelDeal(deal.id, reason)

      expect(mockDealServiceClient.registerDealEvent).toHaveBeenCalledWith(
        deal.id,
        {
          value: DealEventValueEnum.cancelled,
          metadata: { reason }
        }
      )
      expect(mockDealServiceClient.updateDeal).toHaveBeenCalledWith(deal.id, { cancelled: true })
    })
  })
})
