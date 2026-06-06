// utils/validateUser.js
const { signupSchema, loginSchema, updateUserSchema } = require('../schemas/user.schema.js');
const CustomError = require('./CustomError.js');

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const message = error.details.map(d => d.message).join(', ');
        return next(new CustomError(400, message));
    }
    next();
};

module.exports = {
    validateSignup: validate(signupSchema),
    validateLogin:    validate(loginSchema),
    validateUpdate:   validate(updateUserSchema),
};