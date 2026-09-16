import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Starting backfill for existing trades...")
  
  // Find all trades
  const trades = await prisma.trade.findMany();
  console.log(`Found ${trades.length} trades.`);

  let updatedCount = 0;

  for (const trade of trades) {
    let needsUpdate = false;
    const updateData: any = {};

    if (trade.stopLoss === null) {
      updateData.stopLoss = 0.0001;
      needsUpdate = true;
    }
    if (trade.target === null) {
      updateData.target = 0.0001;
      needsUpdate = true;
    }
    if (trade.setupStrategy === null) {
      updateData.setupStrategy = "Unknown";
      needsUpdate = true;
    }
    if (trade.tradeNote === null) {
      updateData.tradeNote = "Migrated trade";
      needsUpdate = true;
    }

    if (needsUpdate) {
      await prisma.trade.update({
        where: { id: trade.id },
        data: updateData,
      });
      updatedCount++;
    }
  }

  console.log(`Backfilled ${updatedCount} trades with missing required fields.`);
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
