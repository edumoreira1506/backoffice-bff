import Joi from 'joi'

export const storeAdvertisingQuestionAnswerSchema = Joi.object({
  answer: Joi.object().required()
})
