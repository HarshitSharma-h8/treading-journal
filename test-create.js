const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = 'placeholder'; // Get a user ID from db
  const user = await prisma.user.findFirst();
  if (!user) return console.log('No user');
  
  try {
    const pnl = 10;
    const trade = await prisma.trade.create({
      data: {
        userId: user.id,
        symbol: "TEST",
        tradeType: "BUY",
        entryPrice: 100,
        exitPrice: 110,
        quantity: 1,
        pnl: pnl,
      }
    });
    console.log("Success", trade.id);
  } catch (err) {
    console.error("Prisma error:", err);
  }
}
main().finally(() => prisma.$disconnect());
