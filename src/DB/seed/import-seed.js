import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Station from '../model/station.model.js';
import Line from '../model/line.model.js';
import LineStations from '../model/lineStation.model.js';
import InterChangeStations from '../model/InterChangeStation.model.js';
import Category from '../model/category.model.js';

dotenv.config({ path: './config/.env.development' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

await mongoose.connect(DB);
console.log('DB connection successful!');

const allStations = JSON.parse(readFileSync(join(__dirname, 'station.seed.json'), 'utf-8'));
const linesData = JSON.parse(readFileSync(join(__dirname, 'line.seed.json'), 'utf-8'));
const lineStationsData = JSON.parse(readFileSync(join(__dirname, 'lineStation.seed.json'), 'utf-8'));
const interChangeStationsData = JSON.parse(readFileSync(join(__dirname, 'interChangeStations.seed.json'), 'utf-8'));
const categoriesData = JSON.parse(readFileSync(join(__dirname, 'category.seed.json'), 'utf-8'));

const importStations = async () => {
  try {
    await Station.deleteMany();

    const uniqueStations = [];
    const seen = new Set();
    for (const station of allStations) {
      if (!seen.has(station.name)) {
        seen.add(station.name);
        uniqueStations.push(station);
      }
    }

    await Station.create(uniqueStations);
    console.log(`✅ ${uniqueStations.length} stations seeded!`);
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await mongoose.connection.close();
  }
};
const importLines = async () => {
  try {
    await Line.deleteMany();
    await Line.create(linesData);
    console.log(`✅ ${linesData.length} lines seeded!`);
  } catch (err) {
    console.error('❌ Error seeding lines:', err);
  } finally {
    await mongoose.connection.close();
  }
};

const importLineStations = async () => {
  try {
    await LineStations.deleteMany();
    await LineStations.create(lineStationsData);
    console.log(`✅ Seeded ${lineStationsData.length} stations successfully`);
  } catch (err) {
    console.error('❌ Error seeding line stations:', err);
  } finally {
    await mongoose.connection.close();
  }
};


const importInterChangeStations = async () => {
  try {
    await InterChangeStations.deleteMany();
    await InterChangeStations.create(interChangeStationsData);
    console.log(`✅ Seeded ${interChangeStationsData.length} inter-change stations successfully`);
  } catch (err) {
    console.error('❌ Error seeding inter-change stations:', err);
  } finally {
    await mongoose.connection.close();
  }
};
const importCategories = async () => {
  try {
    await Category.deleteMany();
    await Category.create(categoriesData);
    console.log(`✅ ${categoriesData.length} categories seeded!`);
  } catch (err) {
    console.error('❌ Error seeding categories:', err);
  } finally {
    await mongoose.connection.close();
  }
};

async function deleteData() {
  try {
    await Station.deleteMany();
    console.log('✅ Data deleted!');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await mongoose.connection.close();
  }
}

if (process.argv[2] === '--importStations') {
  importStations();
} else if (process.argv[2] === '--importLines') {
  importLines();
  } else if (process.argv[2] === '--importLineStations') {
  importLineStations();
  } else if (process.argv[2] === '--importInterChangeStations') {
  importInterChangeStations();
  } else if (process.argv[2] === '--importCategories') {
  importCategories();
} else if (process.argv[2] === '--delete') {
  deleteData();
}