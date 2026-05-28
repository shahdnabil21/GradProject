import { Schema, model } from 'mongoose';


const lineSchema = new Schema({
      name: {
      type: String,
      required: true
    },
    nameAr: {
      type: String,
      required: true
    }
})
export default model('Lines', lineSchema);