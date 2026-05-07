import { useRef, useState } from "react"
import { X, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatAmount, formatDate } from "@/lib/formatters"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import type { TransactionRow } from "@/api/types"

interface TransactionDialogProps {
  row: TransactionRow | null
  onClose: () => void
}

export function TransactionDialog({ row, onClose }: TransactionDialogProps) {
  // Preserve content during exit animation — hold last non-null row
  const activeRowRef = useRef<TransactionRow | null>(null)
  if (row !== null) activeRowRef.current = row
  const data = activeRowRef.current

  const hasAddresses = data && (data.senderAddress || data.receiverAddress || data.smartContract)

  return (
    <Dialog open={row !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup>
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <div>
              <p className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">
                Transaction
              </p>
              <DialogTitle className="text-sm font-semibold font-mono mt-0.5 m-0">
                #{data?.id ?? "—"}
              </DialogTitle>
            </div>
            <DialogClose
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Close">
                  <X />
                </Button>
              }
            />
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {data && (
              <>
                <DialogSection title="Details">
                  <DialogField label="Date" value={formatDate(data.date)} />
                  <DialogField label="Method" value={data.method} />
                  <DialogField label="Network" value={data.network} />
                  <DialogField label="Block Height" value={data.blockHeight} mono />
                  <DialogField label="Tx Hash" value={data.txHash} mono copyable />
                </DialogSection>

                <DialogSection title="Buy">
                  <DialogField label="Amount" value={formatAmount(data.buyAmount, data.buyCurrency)} mono />
                  <DialogField label="Token" value={data.buyToken} mono copyable />
                </DialogSection>

                <DialogSection title="Sell">
                  <DialogField label="Amount" value={formatAmount(data.sellAmount, data.sellCurrency)} mono />
                  <DialogField label="Token" value={data.sellToken} mono copyable />
                </DialogSection>

                <DialogSection title="Fee">
                  <DialogField label="Amount" value={formatAmount(data.feeAmount, data.feeCurrency)} mono />
                  <DialogField label="Token" value={data.feeToken} mono copyable />
                </DialogSection>

                {hasAddresses && (
                  <DialogSection title="Addresses">
                    <DialogField label="Sender" value={data.senderAddress} mono copyable />
                    <DialogField label="Receiver" value={data.receiverAddress} mono copyable />
                    <DialogField label="Smart Contract" value={data.smartContract} mono copyable />
                  </DialogSection>
                )}

                {data.comments && (
                  <DialogSection title="Notes">
                    <div className="px-3 py-3 min-h-[72px]">
                      {
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{data.comments}</p>

                      }
                    </div>
                  </DialogSection>
                )}
              </>
            )}
          </div>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  )
}

function DialogSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground mb-2">
        {title}
      </p>
      <div className="rounded-lg border border-border/60 bg-background/40 divide-y divide-border/40">
        {children}
      </div>
    </div>
  )
}

function DialogField({
  label,
  value,
  mono = false,
  copyable = false,
}: {
  label: string
  value: string | null | undefined
  mono?: boolean
  copyable?: boolean
}) {
  const display = value ?? "—"
  const isEmpty = !value

  return (
    <div className="grid grid-cols-[6rem_1fr_auto] items-start gap-2 px-3 py-2.5">
      <span className="text-xs text-muted-foreground pt-px">{label}</span>
      <span
        className={cn(
          "text-xs text-foreground min-w-0",
          mono && "font-mono break-all",
          isEmpty && "text-muted-foreground/50"
        )}
      >
        {display}
      </span>
      {copyable && !isEmpty ? (
        <CopyButton value={display} />
      ) : copyable ? (
        <span className="size-4" />
      ) : null}
    </div>
  )
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="shrink-0 size-4 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Copy to clipboard"
    >
      {copied
        ? <Check className="size-3 text-emerald-400" />
        : <Copy className="size-3" />
      }
    </button>
  )
}
