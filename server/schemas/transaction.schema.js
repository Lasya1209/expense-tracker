const Joi = require('joi');
const transactionSchema = Joi.object({
    title: Joi.string()
        .trim()
        .required()
        .messages({
            'string.empty': 'Title is required',
            'any.required': 'Title is required'
        }),

    amount: Joi.number()
        .positive()
        .required()
        .messages({
            'number.base': 'Amount must be a number',
            'number.positive': 'Amount must be positive',
            'any.required': 'Amount is required'
        }),

    type: Joi.string()
        .valid('income', 'expense')
        .required()
        .messages({
            'any.only': 'Type must be either income or expense',
            'any.required': 'Type is required'
        }),

    category: Joi.string()
        .valid(
            'salary', 'freelance', 'returns',
            'grocery', 'bill', 'emi', 'fees',
            'health', 'transport', 'entertainment',
            'investment', 'other'
        )
        .default('other')
        .required()
        .messages({
            'any.only': 'Invalid category',
            'any.required': 'Category is required'
        }),

    date: Joi.date()
        .default(Date.now)
        .messages({
            'date.base': 'Invalid date format'
        }),

    note: Joi.string()
        .allow('')
        .default('')
        .messages({
            'string.base': 'Note must be a string'
        }),
});
module.exports = { transactionSchema };
