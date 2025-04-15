import { PrismaClient, UserRole, ReservationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const roundsOfHashing = 10;

async function main() {
  // Clear existing data
  await prisma.$transaction([
    prisma.image.deleteMany(),
    prisma.service.deleteMany(),
    prisma.reservation.deleteMany(),
    prisma.bike.deleteMany(),
    prisma.bikeBrand.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Create bike brands
  const brands = await Promise.all([
    prisma.bikeBrand.create({
      data: { name: 'Trek' },
    }),
    prisma.bikeBrand.create({
      data: { name: 'Specialized' },
    }),
    prisma.bikeBrand.create({
      data: { name: 'Giant' },
    }),
    prisma.bikeBrand.create({
      data: { name: 'Cannondale' },
    }),
    prisma.bikeBrand.create({
      data: { name: 'Scott' },
    }),
  ]);

  // Create users
  const customerPassword = await bcrypt.hash('customer123', roundsOfHashing);
  const technicianPassword = await bcrypt.hash('technician123', roundsOfHashing);

  const customer = await prisma.user.create({
    data: {
      name: 'Jan Novák',
      email: 'customer@example.com',
      phone: '+420 123 456 789',
      role: UserRole.CUSTOMER,
      login: 'customer',
      password: customerPassword,
    },
  });

  const technician = await prisma.user.create({
    data: {
      name: 'Pavel Servisní',
      email: 'technician@example.com',
      phone: '+420 987 654 321',
      role: UserRole.TECHNICIAN,
      login: 'technician',
      password: technicianPassword,
    },
  });
  
  const customer2 = await prisma.user.create({
    data: {
      name: 'Jana Nováková',
      email: 'customer2@example.com',
      phone: '+420 555 666 777',
      role: UserRole.CUSTOMER,
      login: 'customer2',
      password: customerPassword,
    },
  });

  // Create bikes for the customer
  const bike1 = await prisma.bike.create({
    data: {
      model: 'Marlin 5',
      type: 'Mountain',
      brandId: brands[0].id,
      details: { 
        color: 'Red',
        wheelSize: 29,
        frameSize: 'M',
        year: 2022
      },
      ownerId: customer.id,
    },
  });

  const bike2 = await prisma.bike.create({
    data: {
      model: 'Tarmac SL7',
      type: 'Road',
      brandId: brands[1].id,
      details: { 
        color: 'Black',
        wheelSize: 700,
        frameSize: 'L',
        year: 2023
      },
      ownerId: customer.id,
    },
  });

  const bike3 = await prisma.bike.create({
    data: {
      model: 'Revolt Advanced',
      type: 'Gravel',
      brandId: brands[2].id,
      details: { 
        color: 'Blue',
        wheelSize: 700,
        frameSize: 'M',
        year: 2021
      },
      ownerId: customer2.id,
    },
  });

  // Create reservations
  const reservation1 = await prisma.reservation.create({
    data: {
      reservationDate: new Date('2025-04-10T10:00:00Z'),
      problemDescription: 'Brake adjustment needed, squeaking when braking',
      status: ReservationStatus.CONFIRMED,
      customerId: customer.id,
      bikeId: bike1.id,
    },
  });

  const reservation2 = await prisma.reservation.create({
    data: {
      reservationDate: new Date('2025-03-25T14:00:00Z'),
      problemDescription: 'Gear shifting issues, unable to shift to higher gears',
      status: ReservationStatus.PROCESSING,
      customerId: customer.id,
      bikeId: bike2.id,
    },
  });

  const reservation3 = await prisma.reservation.create({
    data: {
      reservationDate: new Date('2025-03-20T16:00:00Z'),
      problemDescription: 'Annual maintenance and tune-up',
      status: ReservationStatus.DONE,
      customerId: customer2.id,
      bikeId: bike3.id,
    },
  });

  // Create services
  const service1 = await prisma.service.create({
    data: {
      serviceDate: new Date('2025-03-20T17:00:00Z'),
      repairDescription: 'Complete tune-up performed: adjusted derailleur, lubed chain, checked brake pads, adjusted headset',
      bikeId: bike3.id,
      technicianId: technician.id,
      reservationId: reservation3.id,
    },
  });

  // Add images
  await prisma.image.create({
    data: {
      bikeId: bike1.id,
      path: '/images/bike1.jpg',
      description: 'Mountain bike overview',
    },
  });

  await prisma.image.create({
    data: {
      bikeId: bike2.id,
      path: '/images/bike2.jpg',
      description: 'Road bike overview',
    },
  });

  await prisma.image.create({
    data: {
      serviceId: service1.id,
      path: '/images/service1.jpg',
      description: 'After service cleaning',
    },
  });

  console.log('Database has been seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
