import Joi from 'joi'

export const cancelDealSchema = Joi.object({
  reason: Joi.string()
})
