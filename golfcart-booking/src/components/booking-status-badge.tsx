import type { BookingStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

const LABELS: Record<BookingStatus, { label: string; variant: "success" | "warning" | "muted" | "destructive" }> = {
  AWAITING_PAYMENT: { label: "Väntar på betalning", variant: "warning" },
  CONFIRMED: { label: "Bekräftad", variant: "success" },
  CANCELLED: { label: "Avbokad", variant: "destructive" },
  COMPLETED: { label: "Avslutad", variant: "muted" },
  EXPIRED: { label: "Utgången", variant: "muted" },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { label, variant } = LABELS[status];
  return <Badge variant={variant}>{label}</Badge>;
}
