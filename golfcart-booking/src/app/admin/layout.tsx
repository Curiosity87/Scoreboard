import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { Button } from "@/components/ui/button";

// OBS: skyddet här är inte den enda spärren – varje admin-action anropar
// dessutom requireAdmin() själv (defense in depth).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-1 border-b pb-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin">Dashboard</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/bokningar">Bokningar</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/bilar">Bilar</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/installningar">Inställningar</Link>
        </Button>
      </nav>
      {children}
    </div>
  );
}
