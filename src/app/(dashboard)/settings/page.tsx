import { deleteSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-start max-w-xl mx-auto min-h-[50vh] p-4">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>
      
      <div className="bg-card border border-border rounded-xl p-6 w-full">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <p className="text-foreground/60 mb-6 text-sm">Update your profile information (Coming soon).</p>
        
        <div className="border-t border-border pt-6 mt-6">
          <form action={async () => {
            "use server";
            await deleteSession();
            redirect("/login");
          }}>
            <button 
              type="submit"
              className="bg-destructive/10 text-destructive hover:bg-destructive/20 px-4 py-2 rounded-md font-medium transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
