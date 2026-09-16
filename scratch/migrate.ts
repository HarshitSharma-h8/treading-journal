const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting migration...");

  // 1. Migrate Journal Entries to ensure they have status
  const journals = await prisma.journal.findMany();
  for (const journal of journals) {
    console.log(`Migrating journal: ${journal.id}`);
    if (!journal.status) {
      await prisma.journal.update({
        where: { id: journal.id },
        data: { status: "COMPLETED" }, // Since it was created manually in the past
      });
    }
  }

  // 2. Migrate Trades
  const trades = await prisma.trade.findMany({
    include: { journal: true },
  });

  for (const trade of trades) {
    console.log(`Migrating trade: ${trade.id} for user ${trade.userId}`);
    
    const entryDateObj = new Date(trade.entryTime);
    const tradingDate = new Date(
      entryDateObj.getFullYear(),
      entryDateObj.getMonth(),
      entryDateObj.getDate()
    );

    let journalId = trade.journalId;

    // If trade has no journal attached, find or create one for its date
    if (!journalId) {
      let journal = await prisma.journal.findFirst({
        where: {
          userId: trade.userId,
          date: tradingDate,
        },
      });

      if (!journal) {
        journal = await prisma.journal.create({
          data: {
            userId: trade.userId,
            date: tradingDate,
            status: "DRAFT", // Automatically created ones are DRAFT
          },
        });
        console.log(`Created new Journal ${journal.id} for Trade ${trade.id}`);
      }

      journalId = journal.id;
    }

    // Default exit reason and source for legacy trades
    const exitReason = "MANUAL";
    const source = "MANUAL";
    const tradeTypeNew = trade.tradeType || "INTRADAY";

    // Because direction is mapped to the old tradeType column, we can't just easily update the mapped column if Prisma thinks it's already there. 
    // Prisma knows `direction` maps to `tradeType` and `tradeType` maps to `tradeTypeNew`. 
    // However, during migration from older schema, the old `tradeType` string might be missing from Prisma's new enum if we aren't careful, but since we used @map("tradeType") for direction, `direction` will read the old BUY/SELL perfectly.

    await prisma.trade.update({
      where: { id: trade.id },
      data: {
        journalId,
        exitReason,
        source,
      },
    });
  }

  console.log("Migration complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
