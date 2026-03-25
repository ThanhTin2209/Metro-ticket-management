const Joi = require("joi");

const validateEntrySchema = Joi.object({
  stationCode: Joi.string().trim().min(2).max(20).required(),
});

const manualInspectionSchema = Joi.object({
  reason: Joi.string().trim().min(5).max(300).required(),
});

module.exports = {
  validateEntrySchema,
  manualInspectionSchema,
};
