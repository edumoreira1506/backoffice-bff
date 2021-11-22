import Joi from 'joi'

export const storeAdvertisingSchema = Joi.object({
  advertising: Joi.object().required()
})
