const Joi = require("joi");

const updateRoleSchema = Joi.object({
  role: Joi.string().valid("passenger", "staff", "inspector", "admin").required(),
});

const getUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  role: Joi.string().valid("passenger", "staff", "inspector", "admin"),
  q: Joi.string().trim().allow(""),
  sortBy: Joi.string().valid("createdAt", "name", "email").default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

module.exports = {
  updateRoleSchema,
  getUsersQuerySchema,
};
