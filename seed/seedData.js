const mongoose = require('mongoose');
const dns = require('dns');
const dotenv = require('dotenv');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}
const User = require('../models/User');
const Bus = require('../models/Bus');
const Booking = require('../models/Booking');

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/routelk';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany();
    await Bus.deleteMany();
    await Booking.deleteMany();
    console.log('Cleared existing Users, Buses, and Bookings.');

    // 1. Create Users
    // Password will be hashed automatically by User model pre-save hook
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@routelk.lk',
      password: 'admin123',
      phone: '0771112233',
      role: 'admin',
    });

    const owner1 = await User.create({
      name: 'Sunil Travels (Owner)',
      email: 'owner1@routelk.lk',
      password: 'owner123',
      phone: '0772223344',
      role: 'owner',
    });

    const owner2 = await User.create({
      name: 'Lanka Express (Owner)',
      email: 'owner2@routelk.lk',
      password: 'owner123',
      phone: '0773334455',
      role: 'owner',
    });

    const passenger1 = await User.create({
      name: 'Kasun Perera',
      email: 'kasun@routelk.lk',
      password: 'pass123',
      phone: '0774445566',
      role: 'passenger',
    });

    const passenger2 = await User.create({
      name: 'Dilshan Silva',
      email: 'dilshan@routelk.lk',
      password: 'pass123',
      phone: '0775556677',
      role: 'passenger',
    });

    const passenger3 = await User.create({
      name: 'Anushka Fernando',
      email: 'anushka@routelk.lk',
      password: 'pass123',
      phone: '0776667788',
      role: 'passenger',
    });

    console.log('Created 6 users (1 Admin, 2 Owners, 3 Passengers)');

    // 2. Create Realistic Sri Lankan Buses
    const buses = await Bus.create([
      {
        busNumber: 'NB-1234',
        busType: 'AC',
        operatorName: 'Sunil Travels',
        from: 'Colombo',
        to: 'Kandy',
        routeStops: ['Colombo', 'Kadawatha', 'Kegalle', 'Mawanella', 'Kandy'],
        departureTime: '08:00',
        arrivalTime: '11:00',
        fare: 500,
        totalSeats: 40,
        isActive: true,
        ownerId: owner1._id,
      },
      {
        busNumber: 'NC-5678',
        busType: 'NON_AC',
        operatorName: 'Lanka Express',
        from: 'Colombo',
        to: 'Kandy',
        routeStops: ['Colombo', 'Nittambuwa', 'Waradapola', 'Kegalle', 'Kandy'],
        departureTime: '09:30',
        arrivalTime: '13:00',
        fare: 350,
        totalSeats: 50,
        isActive: true,
        ownerId: owner2._id,
      },
      {
        busNumber: 'ND-4321',
        busType: 'AC',
        operatorName: 'Sunil Travels',
        from: 'Colombo',
        to: 'Galle',
        routeStops: ['Colombo', 'Panadura', 'Kalutara', 'Hikkaduwa', 'Galle'],
        departureTime: '07:30',
        arrivalTime: '09:30',
        fare: 450,
        totalSeats: 40,
        isActive: true,
        ownerId: owner1._id,
      },
      {
        busNumber: 'NE-8765',
        busType: 'NON_AC',
        operatorName: 'Lanka Express',
        from: 'Colombo',
        to: 'Galle',
        routeStops: ['Colombo', 'Moratuwa', 'Kalutara', 'Bentota', 'Ambalangoda', 'Galle'],
        departureTime: '06:45',
        arrivalTime: '09:45',
        fare: 300,
        totalSeats: 52,
        isActive: true,
        ownerId: owner2._id,
      },
      {
        busNumber: 'NF-2468',
        busType: 'AC',
        operatorName: 'Sunil Travels',
        from: 'Colombo',
        to: 'Matara',
        routeStops: ['Colombo', 'Galle', 'Weligama', 'Matara'],
        departureTime: '06:00',
        arrivalTime: '08:30',
        fare: 650,
        totalSeats: 45,
        isActive: true,
        ownerId: owner1._id,
      },
      {
        busNumber: 'NG-1357',
        busType: 'AC',
        operatorName: 'Lanka Express',
        from: 'Colombo',
        to: 'Jaffna',
        routeStops: ['Colombo', 'Kurunegala', 'Anuradhapura', 'Vavuniya', 'Kilinochchi', 'Jaffna'],
        departureTime: '21:00',
        arrivalTime: '05:30',
        fare: 1300,
        totalSeats: 40,
        isActive: true,
        ownerId: owner2._id,
      },
      {
        busNumber: 'NH-9876',
        busType: 'NON_AC',
        operatorName: 'Lanka Express',
        from: 'Colombo',
        to: 'Jaffna',
        routeStops: ['Colombo', 'Kurunegala', 'Anuradhapura', 'Medawachchiya', 'Vavuniya', 'Jaffna'],
        departureTime: '20:00',
        arrivalTime: '06:00',
        fare: 900,
        totalSeats: 54,
        isActive: true,
        ownerId: owner2._id,
      },
      {
        busNumber: 'NJ-5432',
        busType: 'NON_AC',
        operatorName: 'Sunil Travels',
        from: 'Colombo',
        to: 'Kurunegala',
        routeStops: ['Colombo', 'Mirigama', 'Alawwa', 'Polgahawela', 'Kurunegala'],
        departureTime: '07:00',
        arrivalTime: '09:15',
        fare: 280,
        totalSeats: 48,
        isActive: true,
        ownerId: owner1._id,
      },
      {
        busNumber: 'NK-7654',
        busType: 'AC',
        operatorName: 'Sunil Travels',
        from: 'Kandy',
        to: 'Colombo',
        routeStops: ['Kandy', 'Mawanella', 'Kegalle', 'Kadawatha', 'Colombo'],
        departureTime: '14:00',
        arrivalTime: '17:00',
        fare: 500,
        totalSeats: 40,
        isActive: true,
        ownerId: owner1._id,
      },
      {
        busNumber: 'NL-3141',
        busType: 'AC',
        operatorName: 'Lanka Express',
        from: 'Negombo',
        to: 'Colombo',
        routeStops: ['Negombo', 'Ja-Ela', 'Wattala', 'Colombo'],
        departureTime: '07:15',
        arrivalTime: '08:15',
        fare: 200,
        totalSeats: 35,
        isActive: true,
        ownerId: owner2._id,
      },
    ]);

    console.log(`Created ${buses.length} sample Sri Lankan buses.`);

    // 3. Create Sample Bookings (with future dates)
    const demoDate1 = '2026-09-10';
    const demoDate2 = '2026-09-15';

    await Booking.create([
      {
        bookingId: 'RLK-10001',
        userId: passenger1._id,
        busId: buses[0]._id, // NB-1234 Colombo -> Kandy
        travelDate: demoDate1,
        seats: [3, 5, 6, 12],
        passengerCount: 4,
        farePerSeat: buses[0].fare,
        totalFare: buses[0].fare * 4,
        status: 'CONFIRMED',
      },
      {
        bookingId: 'RLK-10002',
        userId: passenger2._id,
        busId: buses[2]._id, // ND-4321 Colombo -> Galle
        travelDate: demoDate1,
        seats: [1, 2],
        passengerCount: 2,
        farePerSeat: buses[2].fare,
        totalFare: buses[2].fare * 2,
        status: 'CONFIRMED',
      },
      {
        bookingId: 'RLK-10003',
        userId: passenger3._id,
        busId: buses[5]._id, // NG-1357 Colombo -> Jaffna
        travelDate: demoDate2,
        seats: [10, 11, 12],
        passengerCount: 3,
        farePerSeat: buses[5].fare,
        totalFare: buses[5].fare * 3,
        status: 'CONFIRMED',
      },
    ]);

    console.log('Created 3 demo bookings with occupied seats for testing.');
    console.log('\n--- SEED COMPLETED SUCCESSFULLY ---');
    console.log('Test Accounts:');
    console.log('Admin:     admin@routelk.lk    / admin123');
    console.log('Owner 1:   owner1@routelk.lk   / owner123');
    console.log('Owner 2:   owner2@routelk.lk   / owner123');
    console.log('Passenger: kasun@routelk.lk    / pass123');
    console.log('------------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error(`Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();

