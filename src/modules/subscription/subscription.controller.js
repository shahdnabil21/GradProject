import Joi from "joi";
import {
    createSubscriptionService,
    reviewSubscriptionService,
} from "./subscription.service.js";
import AppError from "../../utils/appError.js";


const schema = Joi.object({
    duration: Joi.number().valid(3, 5).required(),
});
//=====user submit Documents======
export const createSubscription = async (req, res, next) => {
    try {
        const{error, value}=schema.validate(req.body, { convert: true });
        if(error){
            return next(new AppError(error.message, 400))
        };
        const {duration} = value;

        const data = await createSubscriptionService(
            req.user._id, 
            req.files, 
            duration);

        res.status(201).json({
            success: true,
            message: "Subscription submitted successfully. Please visit any Cairo Metro station that has a Subscription option within 2 days to pay the fees and collect your card. Bring your original National ID",
            data: {
                subscriptionId: data._id,
                duration:       data.duration,
                status:         data.status,
                submittedAt:    data.createdAt,
            },
        });
    } catch (error) {
        
        next(error);
    }
};


export const reviewSubscription = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, note } = req.validData;

        const data = await reviewSubscriptionService(
            id,
            status,
            req.user._id,
            note
        );

        res.status(200).json({
            success: true,
            message: `Subscription has been ${status} successfully.`,
            data,
        });
    } catch (error) {
        next(error);
    }
};