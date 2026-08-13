import { CheckCircle2, Clock } from "lucide-react"

export function StatusBadge({status}: {status: "Pending" | "Reviewed"}) {
  if(status =="Reviewed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-[var(--ds-color-success-soft)] px-2 py-0.5 text-xs font-medium text-[var(--ds-color-success)]">
        <CheckCircle2 className="size-3" />
        Reviewed
      </span>
    )
  }

  return (
   <span className="inline-flex items-center gap-1 rounded-md bg-[var(--ds-color-warning-soft)] px-2 py-0.5 text-xs font-medium text-[var(--ds-color-warning)]">
      <Clock className="size-3" />
      Pending
    </span>
  )
  
}