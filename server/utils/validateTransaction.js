const {transactionSchema} = require('../schemas/transaction.schema.js');
const CustomError = require('./CustomError.js');

const validateTransaction = (req, res, next) => {
    const { error } = transactionSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const message = error.details.map(d => d.message).join(', ');
        return next(new CustomError(400, message));
    }
    next();
};
module.exports=validateTransaction;
