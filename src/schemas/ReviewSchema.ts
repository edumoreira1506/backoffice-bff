import Joi from 'joi'

export const storeReviewSchema = Joi.object({
  dealFeedback: Joi.string(),
  merchantFeedback: Joi.string(),
  score: Joi.number(),
})
