import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Driftinställningar – kan ändras av admin i UI:t efteråt.
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      swishPhone: "070-123 45 67", // BYT till ert riktiga Swish-nummer i admin
      priceAmount: 50000, // 500 kr per pass, i ören
      slotMinutes: 300, // 5 timmar
      holdMinutes: 30,
    },
  });

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin1234";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "kund@example.com" },
    update: {},
    create: {
      name: "Test Kund",
      email: "kund@example.com",
      phone: "+46701234567",
      passwordHash: await bcrypt.hash("kund1234", 12),
      role: "CUSTOMER",
    },
  });

  const codes = ["4711", "2580", "1379", "8642", "5926", "3048"];
  for (let i = 1; i <= 6; i++) {
    await prisma.cart.upsert({
      where: { name: `Bil ${i}` },
      update: {},
      create: {
        name: `Bil ${i}`,
        model: "Yamaha Drive2",
        unlockCode: codes[i - 1],
        status: i === 6 ? "MAINTENANCE" : "ACTIVE",
        note: i === 6 ? "Byte av däck" : null,
      },
    });
  }

  console.log("Seed klar: inställningar, admin, testkund och 6 bilar.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
