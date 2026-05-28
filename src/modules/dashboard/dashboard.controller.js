import { MESSAGES } from "../../constant/message.constant.js";
import {
    getOverviewService,
    getTopStationsService,
    getUserDemographicsService,
    getPeakHoursService,
    getRevenueService,
    getLineUsageService,
} from "./dashboard.service.js";

export const getOverview = async (req, res, next) => {
    try {
        const { period } = req.validData;
        const data = await getOverviewService(period);
        return res.status(200).json({
            message: MESSAGES.dashboard.fetched,
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const getTopStations = async (req, res, next) => {
    try {
        const { period, limit } = req.validData;
        const data = await getTopStationsService(period, limit);
        return res.status(200).json({
            message: MESSAGES.dashboard.fetched,
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const getUserDemographics = async (req, res, next) => {
    try {
        const data = await getUserDemographicsService();
        return res.status(200).json({
            message: MESSAGES.dashboard.fetched,
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const getPeakHours = async (req, res, next) => {
    try {
        const { period } = req.validData;
        const data = await getPeakHoursService(period);
        return res.status(200).json({
            message: MESSAGES.dashboard.fetched,
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const getRevenue = async (req, res, next) => {
    try {
        const { period } = req.validData;
        const data = await getRevenueService(period);
        return res.status(200).json({
            message: MESSAGES.dashboard.fetched,
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const getLineUsage = async (req, res, next) => {
    try {
        const { period } = req.validData;
        const data = await getLineUsageService(period);
        return res.status(200).json({
            message: MESSAGES.dashboard.fetched,
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};