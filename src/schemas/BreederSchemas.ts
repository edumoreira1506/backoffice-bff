import Joi from 'joi'

export const updateBreederSchema = Joi.object({
  deletedImages: Joi.array(),
  deletedContacts: Joi.array(),
  contacts: Joi.string()
})
