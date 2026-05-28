import { Schema, model } from 'mongoose';


const categorySchema = new Schema({
      name: {
      type: String,
      required: true
    },
    numberOfStations: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
})
export default model('Category', categorySchema);