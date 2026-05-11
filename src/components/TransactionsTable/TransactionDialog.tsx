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
  const hasBuy  = data && (data.buyAmount != null || data.buyToken != null)
  const hasSell = data && (data.sellAmount != null || data.sellToken != null)
  const hasFee  = data && (data.feeAmount != null || data.feeToken != null)

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

          <div className="flex-1 overflow-y-auto px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
            {data && (
              <>
                <DialogSection title="Details" span={2} innerClassName="grid grid-cols-1 sm:grid-cols-2">
                  <DialogField label="Date" value={formatDate(data.date)} />
                  <DialogField label="Method" value={data.method} />
                  <DialogField label="Network" value={data.network} />
                  <DialogField label="Block Height" value={data.blockHeight} mono />
                  <div className="sm:col-span-2">
                    <DialogField label="Tx Hash" value={data.txHash} mono copyable />
                  </div>
                </DialogSection>

                {hasBuy && (
                  <DialogSection title="Buy" span={hasSell ? 1 : 2}>
                    <DialogField label="Amount" value={formatAmountOrNull(data.buyAmount, data.buyCurrency)} mono />
                    <DialogField label="Token" value={data.buyToken} mono copyable />
                  </DialogSection>
                )}

                {hasSell && (
                  <DialogSection title="Sell" span={hasBuy ? 1 : 2}>
                    <DialogField label="Amount" value={formatAmountOrNull(data.sellAmount, data.sellCurrency)} mono />
                    <DialogField label="Token" value={data.sellToken} mono copyable />
                  </DialogSection>
                )}

                {hasFee && (
                  <DialogSection title="Fee" span={hasAddresses ? 1 : 2}>
                    <DialogField label="Amount" value={formatAmountOrNull(data.feeAmount, data.feeCurrency)} mono />
                    <DialogField label="Token" value={data.feeToken} mono copyable />
                  </DialogSection>
                )}

                {hasAddresses && (
                  <DialogSection title="Addresses" span={hasFee ? 1 : 2}>
                    <DialogField label="Sender" value={data.senderAddress} mono copyable />
                    <DialogField label="Receiver" value={data.receiverAddress} mono copyable />
                    <DialogField label="Smart Contract" value={data.smartContract} mono copyable />
                  </DialogSection>
                )}

                {data.comments && (
                  <DialogSection title="Notes" span={2}>
                    <div className="px-3 py-3 min-h-[72px]">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{data.comments}</p>
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

function DialogSection({
  title,
  children,
  span = 1,
  innerClassName,
}: {
  title: string
  children: React.ReactNode
  span?: 1 | 2
  innerClassName?: string
}) {
  return (
    <div className={cn(span === 2 && "sm:col-span-2")}>
      <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground mb-2">
        {title}
      </p>
      <div className={cn(
        "rounded-lg border border-border/60 bg-background/40",
        innerClassName ?? "divide-y divide-border/40"
      )}>
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
  if (!value) return null

  return (
    <div className="grid grid-cols-[6rem_1fr_auto] items-start gap-2 px-3 py-2.5">
      <span className="text-xs text-muted-foreground pt-px">{label}</span>
      <span className={cn("text-xs text-foreground min-w-0", mono && "font-mono break-all")}>
        {value}
      </span>
      {copyable ? <CopyButton value={value} /> : null}
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

function formatAmountOrNull(
  amount: number | null | undefined,
  currency: string | null | undefined,
): string | null {
  if (amount == null) return null
  return formatAmount(amount, currency ?? null)
}
