/**
 * Validation Schemas
 * 
 * Joi schemas for request validation across the API.
 * Ensures data integrity at the API boundary.
 */

import Joi from 'joi'

// ============================================
// AUTH VALIDATION SCHEMAS
// ============================================

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
})

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(2).required(),
})

// ============================================
// FAMILY MEMBER VALIDATION SCHEMAS
// ============================================

export const createFamilyMemberSchema = Joi.object({
  name: Joi.string().min(2).required(),
  birth_year: Joi.number().integer().min(1800).max(new Date().getFullYear()),
  death_year: Joi.number().integer().min(1800),
  birth_place: Joi.string(),
  occupation: Joi.string(),
  short_bio: Joi.string().max(500),
})

export const updateFamilyMemberSchema = Joi.object({
  name: Joi.string().min(2),
  birth_year: Joi.number().integer().min(1800).max(new Date().getFullYear()),
  death_year: Joi.number().integer().min(1800),
  birth_place: Joi.string(),
  occupation: Joi.string(),
  short_bio: Joi.string().max(500),
}).min(1)

// ============================================
// ARTICLE VALIDATION SCHEMAS
// ============================================

export const createArticleSchema = Joi.object({
  family_member_id: Joi.number().integer().required(),
  language: Joi.string().length(2).default('sr'),
  content: Joi.string().required(),
})

export const updateArticleSchema = Joi.object({
  content: Joi.string().required(),
})

export const translateArticleSchema = Joi.object({
  targetLanguage: Joi.string().length(2).required(),
})

// ============================================
// VALIDATION MIDDLEWARE FACTORY
// ============================================

/**
 * Creates validation middleware for a given schema
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} source - Where to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    })

    if (error) {
      error.isJoi = true
      return next(error)
    }

    // Replace request data with validated data
    req[source] = value
    next()
  }
}
