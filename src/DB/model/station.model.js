import { model , Schema } from 'mongoose';

const stationSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    nameAr:{
        type: String,
        required: true

    }
})
export default model('Station', stationSchema);
