import { prisma } from "./lib/prisma";
import { PostTypes } from "@prisma/client";

async function main() {
  console.log(`Start seeding ...`);

  // --- 1. Create Users ---
  const user1 = await prisma.users.upsert({
    where: { username: "charqueadas_user" },
    update: {},
    create: {
      username: "charqueadas_user",
      email: "charqueadas.user@example.com",
      password: "hashed_password_1", // In a real app, this should be a proper hash
      points: 150,
    },
  });

  const user2 = await prisma.users.upsert({
    where: { username: "sao_jeronimo_cleaner" },
    update: {},
    create: {
      username: "sao_jeronimo_cleaner",
      email: "sao.jeronimo.cleaner@example.com",
      password: "hashed_password_2",
      points: 250,
    },
  });

  const user3 = await prisma.users.upsert({
    where: { username: "admin_reporter" },
    update: {},
    create: {
      username: "admin_reporter",
      email: "admin.reporter@example.com",
      password: "hashed_password_3",
      points: 50,
    },
  });

  console.log(
    `Created users: ${user1.username}, ${user2.username}, ${user3.username}`
  );

  // --- 2. Create Pins (Locations) ---

  // Pin in Charqueadas (Approx. -29.955, -51.625)
  const pinCharqueadas = await prisma.pins.upsert({
    where: { id: "charqueadas-pin-1" }, // Using a custom ID for predictable seeding
    update: { lastActionSummary: "Reported an alert and a cleaning post" },
    create: {
      id: "charqueadas-pin-1",
      latitude: -29.955,
      longitude: -51.625,
      lastActionSummary: "Needs cleaning (Alert and Cleaning)",
    },
  });

  // Pin in São Jerônimo (Approx. -29.959, -51.722)
  const pinSaoJeronimo = await prisma.pins.upsert({
    where: { id: "sao-jeronimo-pin-1" },
    update: { lastActionSummary: "Reported an alert and a cleaning post" },
    create: {
      id: "sao-jeronimo-pin-1",
      latitude: -29.959,
      longitude: -51.722,
      lastActionSummary: "Hazard reported (Alert)",
    },
  });

  // Another Pin in Charqueadas (slightly different location)
  const pinCharqueadas2 = await prisma.pins.upsert({
    where: { id: "charqueadas-pin-2" },
    update: { lastActionSummary: "Alert reported by admin" },
    create: {
      id: "charqueadas-pin-2",
      latitude: -29.96,
      longitude: -51.63,
      lastActionSummary: "Alert reported by admin",
    },
  });

  console.log(
    `Created pins: ${pinCharqueadas.id}, ${pinSaoJeronimo.id}, ${pinCharqueadas2.id}`
  );

  // --- 3. Create Posts and Photos ---

  // Post 1: ALERT in Charqueadas
  const post1 = await prisma.posts.create({
    data: {
      type: PostTypes.ALERT,
      text: "Large amount of trash blocking the drain on this street corner. High flood risk!",
      userId: user3.id,
      pinId: pinCharqueadas.id,
      photos: {
        create: [
          {
            url: "https://example.com/photo-charqueadas-before.jpg",
            isBefore: true,
          },
        ],
      },
    },
  });

  // Post 2: CLEANING in Charqueadas (response to Post 1)
  const post2 = await prisma.posts.create({
    data: {
      type: PostTypes.CLEANING,
      text: "Successfully cleaned up the drain! Took about 2 hours. Much better now.",
      userId: user1.id,
      pinId: pinCharqueadas.id,
      photos: {
        create: [
          {
            url: "https://example.com/photo-charqueadas-after.jpg",
            isBefore: false,
          },
        ],
      },
    },
  });

  // Post 3: BOTH in São Jerônimo
  const post3 = await prisma.posts.create({
    data: {
      type: PostTypes.BOTH,
      text: "Found some abandoned electronics (Alert), and I took a small part of it away (Cleaning). Still a lot left.",
      userId: user2.id,
      pinId: pinSaoJeronimo.id,
      photos: {
        create: [
          {
            url: "https://example.com/photo-saojeronimo-before-1.jpg",
            isBefore: true,
          },
          {
            url: "https://example.com/photo-saojeronimo-after-1.jpg",
            isBefore: false,
          },
        ],
      },
    },
  });

  // Post 4: ALERT in Charqueadas (Pin 2)
  const post4 = await prisma.posts.create({
    data: {
      type: PostTypes.ALERT,
      text: "Chemical spill near the industrial area. Needs urgent attention!",
      userId: user3.id,
      pinId: pinCharqueadas2.id,
    },
  });

  console.log(
    `Created posts: ${post1.id}, ${post2.id}, ${post3.id}, ${post4.id}`
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
