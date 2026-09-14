import { AppShell } from "@/components/layout/AppShell";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session?.userId) {
    redirect("/login");
  }

  // Fetch the user's basic info for the sidebar
  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    select: { name: true, email: true }
  });

  return (
    <AppShell user={user}>
      {children}
    </AppShell>
  );
}
