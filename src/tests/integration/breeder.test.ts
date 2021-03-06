import request from 'supertest'
import { breederFactory, userFactory } from '@cig-platform/factories'
import jwt from 'jsonwebtoken'

import App from '@Configs/server'
import i18n from '@Configs/i18n'
import PoultryServiceClient from '@Clients/PoultryServiceClient'
import AccountServiceClient from '@Clients/AccountServiceClient'
import BreederAggregator from '@Aggregators/BreederAggregator'
import AuthBffClient from '@Clients/AuthBffClient'

describe('Breeder actions', () => {
  describe('Update', () => {
    it('is a valid update', async () => {
      const breeder = breederFactory()
      const user = userFactory()
      const mockRefreshToken = jest.fn().mockResolvedValue({ ok: true, token: jwt.sign(user, 'secret')})
      const mockGetUser = jest.fn().mockResolvedValue(user)
      const mockGetBreeders = jest.fn().mockResolvedValue([breeder])
      const newBreeder = {}
      const token = 'fake token'
      const mockUpdateBreederInfo: any = jest.fn()

      jest.spyOn(BreederAggregator, 'updateBreederInfo').mockImplementation(mockUpdateBreederInfo)
      jest.spyOn(AuthBffClient, 'refreshToken').mockImplementation(mockRefreshToken)
      jest.spyOn(AccountServiceClient, 'getUser').mockImplementation(mockGetUser)
      jest.spyOn(PoultryServiceClient, 'getBreeders').mockImplementation(mockGetBreeders)

      const response = await request(App).patch(`/v1/breeders/${breeder.id}`).send(newBreeder).set('X-Cig-Token', token)

      expect(response.statusCode).toBe(200)
      expect(response.body.message).toBe(i18n.__('common.updated'))
      expect(mockRefreshToken).toHaveBeenCalledWith(token)
      expect(mockGetUser).toHaveBeenCalledWith(user.id)
      expect(mockGetBreeders).toHaveBeenCalledWith(user.id)
    })

    it('is an invalid update when token is not sent', async () => {
      const breeder = breederFactory()
      const user = userFactory()
      const mockUpdateBreeder = jest.fn()
      const mockRefreshToken = jest.fn().mockResolvedValue({ ok: true, token: jwt.sign(user, 'secret')})
      const mockGetUser = jest.fn().mockResolvedValue(user)
      const mockGetBreeders = jest.fn().mockResolvedValue([breeder])
      const newBreeder = {}
      const token = 'fake token'

      jest.spyOn(PoultryServiceClient, 'updateBreeder').mockImplementation(mockUpdateBreeder)
      jest.spyOn(AuthBffClient, 'refreshToken').mockImplementation(mockRefreshToken)
      jest.spyOn(AccountServiceClient, 'getUser').mockImplementation(mockGetUser)
      jest.spyOn(PoultryServiceClient, 'getBreeders').mockImplementation(mockGetBreeders)

      const response = await request(App).patch(`/v1/breeders/${breeder.id}`).send(newBreeder)

      expect(response.statusCode).toBe(400)
      expect(response.body).toMatchObject({
        ok: false,
        error: {
          message: i18n.__('auth.errors.invalid-login'),
          name: 'AuthError',
        }
      })
      expect(mockUpdateBreeder).not.toHaveBeenCalledWith(breeder.id, newBreeder)
      expect(mockRefreshToken).not.toHaveBeenCalledWith(token)
      expect(mockGetUser).not.toHaveBeenCalledWith(user.id)
      expect(mockGetBreeders).not.toHaveBeenCalledWith(user.id)
    })
  })

  describe('Show', () => {
    it('returns the breeder when is a valid request', async () => {
      const breeder = breederFactory({ description: 'Nice description' })
      const user = userFactory()
      const mockGetBreederInfo = jest.fn().mockResolvedValue(breeder)
      const mockRefreshToken = jest.fn().mockResolvedValue({ ok: true, token: jwt.sign(user, 'secret')})
      const mockGetUser = jest.fn().mockResolvedValue(user)
      const mockGetBreeders = jest.fn().mockResolvedValue([breeder])
      const token = 'fake token'

      jest.spyOn(BreederAggregator, 'getBreederInfo').mockImplementation(mockGetBreederInfo)
      jest.spyOn(AuthBffClient, 'refreshToken').mockImplementation(mockRefreshToken)
      jest.spyOn(AccountServiceClient, 'getUser').mockImplementation(mockGetUser)
      jest.spyOn(PoultryServiceClient, 'getBreeders').mockImplementation(mockGetBreeders)

      const response = await request(App).get(`/v1/breeders/${breeder.id}`).set('X-Cig-Token', token)

      expect(response.statusCode).toBe(200)
      expect(response.body).toMatchObject({
        ok: true,
        breeder: {
          ...breeder,
          foundationDate: breeder.foundationDate.toISOString(),
          createdAt: breeder.createdAt.toISOString(),
        }
      })
      expect(mockGetBreederInfo).toHaveBeenCalledWith(breeder.id)
      expect(mockRefreshToken).toHaveBeenCalledWith(token)
      expect(mockGetUser).toHaveBeenCalledWith(user.id)
      expect(mockGetBreeders).toHaveBeenCalledWith(user.id)
    })
  })
})
