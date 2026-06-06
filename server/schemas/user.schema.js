const Joi = require('joi');
// For registration
const signupSchema = Joi.object({
    username: Joi.string()
        .trim()
        .min(3)
        .max(30)
        .required()
        .messages({
            'string.empty': 'Username is required',
            'string.min': 'Username must be at least 3 characters',
            'string.max': 'Username must be at most 30 characters',
            'any.required': 'Username is required'
        }),
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.email': 'Please enter a valid email',
            'string.empty': 'Email is required',
            'any.required': 'Email is required'
        }),

    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 6 characters',
            'any.required': 'Password is required'
        }),

    occupation: Joi.string()
        .trim()
        .allow('')
        .default('')
        .messages({
            'string.base': 'Occupation must be a string'
        }),

    ageGroup: Joi.string()
        .valid('18-25', '26-35', '36-45', '46+')
        .allow(null)
        .default(null)
        .messages({
            'any.only': 'Age group must be one of: 18-25, 26-35, 36-45, 46+'
        }),
});

// For login
const loginSchema = Joi.object({
    username: Joi.string()
        .trim()
        .required()
        .messages({
            'string.empty': 'Username is required',
            'any.required': 'Username is required'
        }),

    password: Joi.string()
        .required()
        .messages({
            'string.empty': 'Password is required',
            'any.required': 'Password is required'
        }),
});

// For profile update
const updateUserSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .messages({
            'string.email': 'Please enter a valid email',
        }),

    occupation: Joi.string()
        .trim()
        .allow('')
        .messages({
            'string.base': 'Occupation must be a string'
        }),

    ageGroup: Joi.string()
        .valid('18-25', '26-35', '36-45', '46+')
        .allow(null)
        .messages({
            'any.only': 'Age group must be one of: 18-25, 26-35, 36-45, 46+'
        }),
}).min(1).messages({
    'object.min': 'At least one field is required to update'
});
module.exports = { signupSchema, loginSchema, updateUserSchema };
