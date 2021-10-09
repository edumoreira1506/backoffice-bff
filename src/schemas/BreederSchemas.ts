import Joi from 'joi'

export const updateBreederSchema = Joi.object({
  deletedImages: Joi.array()
})
