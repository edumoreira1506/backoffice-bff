import { PoultryServiceClient as IPoultryServiceClient } from '@cig-platform/core'
import { IBreeder, IBreederContact } from '@cig-platform/types'

import PoultryServiceClient from '@Clients/PoultryServiceClient'

export class BreederAggregator {
  private _poultryServiceClient: IPoultryServiceClient;
  
  constructor(poultryServiceClient: IPoultryServiceClient) {
    this._poultryServiceClient = poultryServiceClient

    this.getBreederInfo = this.getBreederInfo.bind(this)
  }

  async getBreederInfo(breederId: string) {
    const breeder = await this._poultryServiceClient.getBreeder(breederId)
    const breederImages = await this._poultryServiceClient.getBreederImages(breederId)
    const contacts = await this._poultryServiceClient.getBreederContacts(breederId)

    return { ...breeder, images: breederImages, contacts }
  }

  async updateBreederInfo(
    breederId: string,
    breeder: Partial<IBreeder> & { contacts?: Partial<IBreederContact>[] },
    deletedImages: string[],
    newImages?: File[],
    deletedContacts: string[] = []
  ) {
    deletedImages.forEach(async (breederImageId) => {
      await this._poultryServiceClient.removeBreederImage(breederId, breederImageId)
    })

    deletedContacts.forEach(async (contactId) => {
      await this._poultryServiceClient.removeBreederContact(breederId, contactId)
    })

    if (breeder.contacts) {
      breeder.contacts.forEach(async (contact) => {
        if (contact.id) {
          await this._poultryServiceClient.updateBreederContact(breederId, contact.id, contact)
        } else {
          await this._poultryServiceClient.postBreederContact(breederId, { value: contact.value, type: contact.type })
        }
      })
    }

    if (newImages) {
      await this._poultryServiceClient.postBreederImages(breederId, newImages)
    }

    delete breeder['contacts']

    if (breeder) {
      await this._poultryServiceClient.updateBreeder(breederId, breeder)
    }
  }
}

export default new BreederAggregator(PoultryServiceClient)
