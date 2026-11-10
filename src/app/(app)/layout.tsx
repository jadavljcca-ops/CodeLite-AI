import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get("codelite_demo_user");

  let user: any = null;

  if (demoCookie?.value) {
    try {
      const parsed = JSON.parse(demoCookie.value);
      user = {
        id: parsed.id || "demo-user-id",
        email: parsed.email || "developer@codelite.ai",
        user_metadata: { full_name: parsed.fullName || "Demo Developer" },
      };
    } catch {
      // Fallback
    }
  }

  if (!user) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      user = data?.user;
    } catch {
      // Ignore network errors in local mode
    }
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AppHeader user={user} />
        <main className="flex-1 overflow-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
