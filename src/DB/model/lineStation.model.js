import { Schema, model } from 'mongoose';
import Station from './station.model.js';
import Line from './line.model.js';
const lineStations = new Schema({
    station:{
        type: Schema.Types.ObjectId,
        ref: 'Station',
        required: true,
    },
    line:{
        type: Schema.Types.ObjectId,
        ref: 'Line',
        required: true,
    },
    order:{
        type: Number,
        required: true,
    },
      branch:{ 
        type: String,
        default: null } 

})
export default model('LineStations', lineStations);