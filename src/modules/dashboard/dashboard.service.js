
import {Analytics, Ticket, User} from "../../DB/model/index.js";
import {getDateRange} from "../../utils/dateRange.utilis.js"; 

//=====Service one to get all the important information the admin want As OverView=========
export const getOverviewService = async (period) => {
    const { start, end } = getDateRange(period);

    const snapshots = await Analytics.find({
        date: { $gte: start, $lte: end }
    });

    if (snapshots.length > 0) {
        const totalTickets = snapshots.reduce((sum, s) => sum + s.totalTicketsSold, 0);
        const totalRevenue = snapshots.reduce((sum, s) => sum + s.totalRevenue, 0);
        return { period, totalTickets, totalRevenue, source: "snapshot" };
    }

    // Fallback — use createdAt instead of purchasedAt
    const [totalTickets, newUsers] = await Promise.all([
        Ticket.countDocuments({ }),
        User.countDocuments({ }),
    ]);

    return {
        period,
        totalTickets,
        totalRevenue: 0, // no price field in ticket — needs category lookup
        newUsers,
        source: "live",
    };
};
//=======Service TWO to get all top checkedin and checkout out Stations by(WEEK/MONTH/YEAR)=========
export const getTopStationsService = async (period, limit) => {
    const { start, end } = getDateRange(period);

    const snapshots = await Analytics.find({
        date: { $gte: start, $lte: end }
    });

    if (snapshots.length > 0) {
        const departureMap = {};
        const destinationMap = {};

        snapshots.forEach((s) => {
            s.topDepartureStations.forEach(({ stationName, ticketCount }) => {
                departureMap[stationName] = (departureMap[stationName] || 0) + ticketCount;
            });
            s.topDestinationStations.forEach(({ stationName, ticketCount }) => {
                destinationMap[stationName] = (destinationMap[stationName] || 0) + ticketCount;
            });
        });

        const topDeparture = Object.entries(departureMap)
            .map(([stationName, count]) => ({ stationName, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);

        const topDestination = Object.entries(destinationMap)
            .map(([stationName, count]) => ({ stationName, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);

        return { topDeparture, topDestination, source: "snapshot" };
    }
    //use checkInStation and checkOutStation + createdAt
    const [topDeparture, topDestination] = await Promise.all([

        Ticket.aggregate([
            {
                $match: {
                    //createdAt: { $gte: start, $lte: end },
                    checkInStation: { $exists: true, $ne: null }, // only tickets that have check-in
                }
            },
            {
                $group: {
                    _id: "$checkInStation",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: "stations",        // join with stations collection
                    localField: "_id",
                    foreignField: "_id",
                    as: "station",
                }
            },
            { $unwind: { path: "$station", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    stationName: { $ifNull: ["$station.name", "Unknown Station"] },
                    count: 1,
                    _id: 0,
                }
            },
        ]),

        Ticket.aggregate([
            {
                $match: {
                   // createdAt: { $gte: start, $lte: end },
                    checkOutStation: { $exists: true, $ne: null }, // only tickets that have check-out
                }
            },
            {
                $group: {
                    _id: "$checkOutStation", // ← was destinationStation, now checkOutStation
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: "stations",
                    localField: "_id",
                    foreignField: "_id",
                    as: "station",
                }
            },
            { $unwind: {
                 path: "$station",
                preserveNullAndEmptyArrays: true 
                } },
            {
                $project: {
                    stationName: { $ifNull: ["$station.name", "Unknown Station"] },
                    count: 1,
                    _id: 0,
                }
            },
        ]),
    ]);

    return { topDeparture, topDestination, source: "live" };
};

//=======Service THREE to get the Info of the users(AGES/GENDER/TOTAL USER USE WEBSITE)
export const getUserDemographicsService = async () => {
    const latestSnapshot = await Analytics.findOne().sort({ date: -1 });

    if (latestSnapshot) {
        return {
            ageDistribution:    latestSnapshot.ageDistribution,
            genderDistribution: latestSnapshot.genderDistribution,
            source: "snapshot",
        };
    }

    const now = new Date();
    const [ageGroups, genderStats, totalUsers] = await Promise.all([
        //age group only if user enter the date of birth
        User.aggregate([
            { $match: { dateOfBirth: { $exists: true , $ne: null} } },
            {
                $project: {
                    age: {
                        $floor: {
                            $divide: [
                                { $subtract: [now, "$dateOfBirth"] },
                                1000 * 60 * 60 * 24 * 365,
                            ],
                        },
                    },
                },
            },
            {
                $bucket: {
                    groupBy: "$age",
                    boundaries: [0, 18, 25, 35, 45, 55, 120],
                    default: "unknown",
                    output: { count: { $sum: 1 } },
                },
            },
        ]),
        User.aggregate([
            { $match: { gender: { $exists: true, $ne: null } } }, // skip null gender
            { $group: { _id: "$gender", count: { $sum: 1 } } },
        ]),
        User.countDocuments({role:"user"}),  //Users counts overall
    ]);

    return {
        totalUsers,
        ageGroups: ageGroups.length > 0
            ? ageGroups
            : "No age data available — users have no dateOfBirth saved",
        genderStats: genderStats.length > 0
            ? genderStats
            : "No gender data available — users have no gender saved",
        source: "live",
    };
};

//====Service FOUR to the Peak Hours of the congeestion=========
export const getPeakHoursService = async (period) => {
    const { start, end } = getDateRange(period);

    const snapshots = await Analytics.find({
        date: { $gte: start, $lte: end }
    });

    if (snapshots.length > 0) {
        const totals = Array(24).fill(0);
        snapshots.forEach((s) => {
            s.peakHours.forEach((count, hour) => {
                totals[hour] += count;
            });
        });
        return totals.map((total, hour) => ({
            hour,
            label:  `${hour}:00 - ${hour + 1}:00`,
            count:  Math.round(total / snapshots.length),
            source: "snapshot",
        }));
    }

    // Fallback — use createdAt instead of purchasedAt
    const hourlyData = await Ticket.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
            $group: {
                _id: { $hour: "$createdAt" }, // ← was purchasedAt, now createdAt
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } },
    ]);

    const peakHours = Array(24).fill(0);
    hourlyData.forEach(({ _id: hour, count }) => {
        peakHours[hour] = count;
    });

    return peakHours.map((count, hour) => ({
        hour,
        label:  `${hour}:00 - ${hour + 1}:00`,
        count,
        source: "live",
    }))
      .filter(slot => slot.count > 0);
};

//===Service FIVE to get the revenues and total tichets that have been purchased====
export const getRevenueService = async (period) => {
    const { start, end } = getDateRange(period);

    const snapshots = await Analytics.find(
        { date: { $gte: start, $lte: end } },
        { date: 1, totalRevenue: 1, totalTicketsSold: 1 }
    ).sort({ date: 1 });

    if (snapshots.length > 0) {
        return snapshots.map((s) => ({
            date:         s.date,
            dailyRevenue: s.totalRevenue,
            dailyTickets: s.totalTicketsSold,
            source:       "snapshot",
        }));
    }
    // Fallback — group by day using createdAt
    const revenueData = await Ticket.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
          {
            // join ticket with its category to get price
            $lookup: {
                from:         "categories", // MongoDB collection name
                localField:   "category",
                foreignField: "_id",
                as:           "categoryData",
            }
        },
         {
            $unwind: {
                path: "$categoryData",
                preserveNullAndEmptyArrays: true,
            }
        },
        {
            $group: {
                _id: {
                    day:   { $dayOfMonth: "$createdAt" }, // ← was purchasedAt
                    month: { $month: "$createdAt" },
                    year:  { $year: "$createdAt" },
                },
                dailyTickets: { $sum: 1 },
                dailyRevenue: { $sum: "$categoryData.price" },
            },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);
    //=====✅ check Before CREATEDAT is in the tickets schema====
    if (revenueData.length === 0) {
        return {
            message: "No revenue data found for this period. Will populate once tickets have createdAt saved.",
            period,
            dailyTickets: 0,
            dailyRevenue: 0,
            data: [],
        };
    }
    
    return revenueData;
};

//=====Service Six to get the most common lines that is used=======
export const getLineUsageService = async (period) => {
    const { start, end } = getDateRange(period);

    const snapshots = await Analytics.find({
        date: { $gte: start, $lte: end }
    });

    if (snapshots.length > 0) {
        const lineMap = {};
        snapshots.forEach((s) => {
            s.lineUsage.forEach(({ lineName, ticketCount }) => {
                lineMap[lineName] = (lineMap[lineName] || 0) + ticketCount;
            });
        });
        return Object.entries(lineMap)
            .map(([lineName, ticketCount]) => ({ lineName, ticketCount }))
            .sort((a, b) => b.ticketCount - a.ticketCount);
    }

    // Fallback — group by category (ticket type)
    const lineData = await Ticket.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
            $lookup: {
                from:         "categories",
                localField:   "category",
                foreignField: "_id",
                as:           "categoryData",
            }
        },
        {
            $unwind: {
                path: "$categoryData",
                preserveNullAndEmptyArrays: true,
            }
        },
        {
            $group: {
                _id: {
                    $ifNull: ["$categoryData.name", "Unknown Category"]
                },
                ticketCount:      { $sum: 1 },
                totalRevenue:     { $sum: "$categoryData.price" },
            }
        },
        { $sort: { ticketCount: -1 } },
        {
            $project: {
                categoryName: "$_id",
                ticketCount:  1,
                totalRevenue: 1,
                _id:          0,
            }
        },
    ]);

    if (lineData.length === 0) {
        return {
            message: "No usage data found for this period.",
            period,
            data: [],
        };
    }

    return lineData;
};