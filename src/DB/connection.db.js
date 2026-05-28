import { connect } from 'mongoose';

export const connectDB = async ()=>{ 
   try {

    const DB = process.env.DATABASE.replace(
     '<PASSWORD>',
     process.env.DATABASE_PASSWORD
    );

    await connect(DB);
    console.log('✅ DB connection successful!');
       } catch (err) {
    console.error('💥 DB connection error:', err.message);
    process.exit(1);
  }
  }
