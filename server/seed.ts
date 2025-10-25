import { PostTypes } from "@prisma/client";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log(`Start seeding ...`);

  // Clear existing data (in order to avoid foreign key constraints)
  console.log(`Clearing existing data...`);
  await prisma.postPhoto.deleteMany();
  await prisma.posts.deleteMany();
  await prisma.pins.deleteMany();
  await prisma.users.deleteMany();
  console.log(`Data cleared.`);

  // Hash passwords for test users
  const testPassword = await bcrypt.hash("test123", 10);

  // --- 1. Create Users ---
  const pinCharqueadas = await prisma.users.upsert({
    where: { username: "charqueadas_user" },
    update: {},
    create: {
      username: "charqueadas_user",
      email: "charqueadas.user@example.com",
      cpf: "85508128204", // Valid CPF for testing
      password: testPassword, // Properly hashed password: "test123"
      points: 150,
    },
  });

  const pinSaoJeronimo = await prisma.users.upsert({
    where: { username: "sao_jeronimo_cleaner" },
    update: {},
    create: {
      username: "sao_jeronimo_cleaner",
      email: "sao.jeronimo.cleaner@example.com",
      cpf: "48330063240", // Valid CPF for testing
      password: testPassword, // Properly hashed password: "test123"
      points: 250,
    },
  });

  const pinAdminReporter = await prisma.users.upsert({
    where: { username: "admin_reporter" },
    update: {},
    create: {
      username: "admin_reporter",
      email: "admin.reporter@example.com",
      cpf: "99794726427", // Valid CPF for testing
      password: testPassword, // Properly hashed password: "test123"
      points: 50,
    },
  });

  console.log(
    `Created users: ${pinCharqueadas.username}, ${pinSaoJeronimo.username}, ${pinAdminReporter.username}`
  );

  // --- 2. Create Pins (Locations) ---
  // Creating pins with null lastActionSummary - will be updated automatically when posts are created

  // Pin 1: Will have ALERT post
  const alertPin = await prisma.pins.create({
    data: {
      latitude: -29.955,
      longitude: -51.625,
      lastActionSummary: "ALERT", 
    },
  });

  // Pin 2: Will have ALERT first, then CLEANING (lastActionSummary will be CLEANING)
  const cleaningPin = await prisma.pins.create({
    data: {
      latitude: -29.959,
      longitude: -51.722,
      lastActionSummary: "CLEANING",
    },
  });

  // Pin 3: Will have BOTH post
  const bothPin = await prisma.pins.create({
    data: {
      latitude: -29.96,
      longitude: -51.63,
      lastActionSummary: "BOTH",
    },
  });

  console.log(
    `Created pins: ${alertPin.id}, ${cleaningPin.id}, ${bothPin.id}`
  );

  // --- 3. Create Posts and Photos ---
  // Posts will automatically update the pin's lastActionSummary when created

  // Post 1: ALERT post (Pin 1)
  const alertPost = await prisma.posts.create({
    data: {
      type: PostTypes.ALERT,
      text: "Large amount of plastic bottles and trash scattered around this area. Environmental concern!",
      userId: pinCharqueadas.id,
      pinId: alertPin.id,
      photos: {
        create: [
          {
            url: "https://h2oglobalnews.com/wp-content/uploads/2021/08/bottles-87342_1920.jpg",
            isBefore: true,
          },
        ],
      },
    },
  });

  // Post 2: ALERT post for cleaning pin (first post - establishes the problem)
  const cleaningAlertPost = await prisma.posts.create({
    data: {
      type: PostTypes.ALERT,
      text: "Massive trash accumulation blocking the drainage system. This needs immediate cleaning!",
      userId: pinAdminReporter.id,
      pinId: cleaningPin.id,
      photos: {
        create: [
          {
            url: "https://h2oglobalnews.com/wp-content/uploads/2021/08/bottles-87342_1920.jpg",
            isBefore: true,
          },
        ],
      },
    },
  });

  // Post 3: CLEANING post (responds to the alert above)
  const cleaningPost = await prisma.posts.create({
    data: {
      type: PostTypes.CLEANING,
      text: "Successfully cleaned up the entire area! Took 3 hours but the drainage is now clear.",
      userId: pinSaoJeronimo.id,
      pinId: cleaningPin.id,
      photos: {
        create: [
          {
            url: "https://www.ocregister.com/wp-content/uploads/2023/01/OCR-L-INLANDTRASH-0117-20.jpeg?w=1600&resize=1600,900",
            isBefore: false,
          },
        ],
      },
    },
  });

  // Post 4: BOTH post (alert and cleaning in one)
  const bothPost = await prisma.posts.create({
    data: {
      type: PostTypes.BOTH,
      text: "Found trash problem and partially cleaned it. Before and after photos show the progress made.",
      userId: pinSaoJeronimo.id,
      pinId: bothPin.id,
      photos: {
        create: [
          {
            url: "https://h2oglobalnews.com/wp-content/uploads/2021/08/bottles-87342_1920.jpg",
            isBefore: true,
          },
          {
            url: "https://www.ocregister.com/wp-content/uploads/2023/01/OCR-L-INLANDTRASH-0117-20.jpeg?w=1600&resize=1600,900",
            isBefore: false,
          },
        ],
      },
    },
  });

  console.log(
    `Created posts: ${alertPost.id}, ${cleaningAlertPost.id}, ${cleaningPost.id}, ${bothPost.id}`
  );

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
