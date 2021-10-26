import Joi from 'joi'

export const storeRegisterSchema = Joi.object({
  register: Joi.object().required()
})
