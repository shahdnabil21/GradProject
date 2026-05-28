import mongoose, { model, Schema } from "mongoose";

const analyticsSchema = new Schema({
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    // --- Ticket & Revenue ---
    totalTicketsSold: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    avgTicketPrice: { type: Number, default: 0 },

    // --- Station Statistics ---
    // Array: [{ stationId, stationName, ticketCount }]
    topDepartureStations: [
      {
        stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station" },
        stationName: String,
        ticketCount: Number,
      },
    ],
    topDestinationStations: [
      {
        stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station" },
        stationName: String,
        ticketCount: Number,
      },
    ],

    // --- User Demographics ---
    // Age group buckets: under18, 18-24, 25-34, 35-44, 45-54,
    ageDistribution: {
      under18:  { type: Number, default: 0 },
      age18_24: { type: Number, default: 0 },
      age25_34: { type: Number, default: 0 },
      age35_44: { type: Number, default: 0 },
      age45_54: { type: Number, default: 0 },
      above55:  { type: Number, default: 0 },
    },

    genderDistribution: {
      male:   { type: Number, default: 0 },
      female: { type: Number, default: 0 },
      other:  { type: Number, default: 0 },
    },

    // --- Peak Hours ---
    // 24-slot array, each slot = ticket count for that hour
    peakHours: {
      type: [Number],
      default: Array(24).fill(0),
    },

    // --- Ticket Types ---
    ticketTypeBreakdown: {
      single:  { type: Number, default: 0 },
      roundTrip: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 },
    },

    // --- New vs Returning Users ...........--- 
    newUsers:       { type: Number, default: 0 },
    returningUsers: { type: Number, default: 0 },

    // --- Line Usage ---
    lineUsage: [
      {
        lineName:    String,
        ticketCount: Number,
      },
    ],
  },{
    timestamps:true,
  })

export default model('Analytics', analyticsSchema);