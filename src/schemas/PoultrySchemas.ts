import Joi from 'joi'

export const storePoultrySchema = Joi.object({
  poultry: Joi.object().required(),
  measurementAndWeight: Joi.object(),
})

export const updatePoultrySchema = Joi.object({
  poultry: Joi.object().required(),
  deletedImages: Joi.array()
})

export const transferPoultrySchema = Joi.object({
  breederId: Joi.string().required(),
})

export const storePoultryParentsSchema = Joi.object({
  dadId: Joi.string(),
  momId: Joi.string()
})
