import Joi from 'joi'

export const storeAdvertisingSchema = Joi.object({
  advertising: Joi.object().required()
})

export const updateAdvertisingSchema = Joi.object({
  price: Joi.number().required()
})
