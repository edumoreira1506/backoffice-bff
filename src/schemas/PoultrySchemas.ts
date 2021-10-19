import Joi from 'joi'

export const storePoultrySchema = Joi.object({
  poultry: Joi.object().required()
})

export const updatePoultrySchema = Joi.object({
  poultry: Joi.object().required()
})
