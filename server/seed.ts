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
      text: "Grande quantidade de garrafas plásticas e lixo espalhados nesta área. Preocupação ambiental!",
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
      text: "Acúmulo massivo de lixo bloqueando o sistema de drenagem. Isso precisa de limpeza imediata!",
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
      text: "Área completamente limpa com sucesso! Levou 3 horas, mas a drenagem está agora desobstruída.",
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
      text: "Encontrei problema de lixo e limpei parcialmente. Fotos antes e depois mostram o progresso feito.",
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

  // --- Additional Pins for Charqueadas and São Jerônimo ---
  
  // Pin 4: Charqueadas - Rio Jacuí area
  const charqueadasRio = await prisma.pins.create({
    data: {
      latitude: -29.9648,
      longitude: -51.6189,
      lastActionSummary: "ALERT",
    },
  });

  // Pin 5: Charqueadas - Centro area
  const charqueadasCentro = await prisma.pins.create({
    data: {
      latitude: -29.9583,
      longitude: -51.6247,
      lastActionSummary: "CLEANING",
    },
  });

  // Pin 6: São Jerônimo - Arroio area
  const saoJeronimoArroio = await prisma.pins.create({
    data: {
      latitude: -29.9556,
      longitude: -51.7222,
      lastActionSummary: "BOTH",
    },
  });

  // Pin 7: São Jerônimo - Industrial area
  const saoJeronimoIndustrial = await prisma.pins.create({
    data: {
      latitude: -29.9503,
      longitude: -51.7306,
      lastActionSummary: "ALERT",
    },
  });

  // Additional posts for the new pins
  
  // Post for Charqueadas Rio
  const charqueadasRioPost = await prisma.posts.create({
    data: {
      type: PostTypes.ALERT,
      text: "Óleo e resíduos industriais sendo despejados no Rio Jacuí. Situação crítica para a fauna aquática!",
      userId: pinCharqueadas.id,
      pinId: charqueadasRio.id,
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

  // Post for Charqueadas Centro
  const charqueadasCentroPost = await prisma.posts.create({
    data: {
      type: PostTypes.CLEANING,
      text: "Mutirão de limpeza realizado na área central de Charqueadas. Removidos 50kg de resíduos sólidos!",
      userId: pinSaoJeronimo.id,
      pinId: charqueadasCentro.id,
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

  // Post for São Jerônimo Arroio
  const saoJeronimoArroioPost = await prisma.posts.create({
    data: {
      type: PostTypes.BOTH,
      text: "Detectado assoreamento no arroio de São Jerônimo e iniciada limpeza comunitária. Progresso significativo!",
      userId: pinAdminReporter.id,
      pinId: saoJeronimoArroio.id,
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

  // Post for São Jerônimo Industrial
  const saoJeronimoIndustrialPost = await prisma.posts.create({
    data: {
      type: PostTypes.ALERT,
      text: "Vazamento de efluentes químicos na zona industrial de São Jerônimo. Necessária intervenção urgente dos órgãos ambientais!",
      userId: pinCharqueadas.id,
      pinId: saoJeronimoIndustrial.id,
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

  console.log(
    `Created posts: ${alertPost.id}, ${cleaningAlertPost.id}, ${cleaningPost.id}, ${bothPost.id}, ${charqueadasRioPost.id}, ${charqueadasCentroPost.id}, ${saoJeronimoArroioPost.id}, ${saoJeronimoIndustrialPost.id}`
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
