import { useState, useMemo, useEffect, useRef } from "react";
import { Popover } from "@base-ui/react/popover";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

interface DatePickerProps {
  value?: string;       // YYYY-MM-DD
  onChange?: (val: string) => void;
  min?: string;         // YYYY-MM-DD
  placeholder?: string;
  className?: string;
}

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseLocal(iso: string): Date {
  const parts = iso.split("-").map(Number);
  return new Date(parts[0]!, parts[1]! - 1, parts[2]!);
}

// Display format: DD/MM/YYYY
function toDisplay(iso: string) {
  const d = parseLocal(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// Try to parse user-typed text to YYYY-MM-DD; returns null if invalid
function parseTyped(text: string): string | null {
  const t = text.trim();
  // DD/MM/YYYY or D/M/YYYY
  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t);
  if (dmy) {
    const d = new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
    if (!isNaN(d.getTime()) && d.getMonth() === Number(dmy[2]) - 1) return toISO(d);
  }
  // YYYY-MM-DD
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (ymd) {
    const d = new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
    if (!isNaN(d.getTime()) && d.getMonth() === Number(ymd[2]) - 1) return toISO(d);
  }
  return null;
}

export function DatePicker({ value, onChange, min, placeholder = "MM/DD/YYYY", className }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState(() => value ? toDisplay(value) : "");
  const anchorRef = useRef<HTMLDivElement>(null);
  const today = toISO(new Date());

  const parsed = value ? parseLocal(value) : null;
  const [view, setView] = useState(() => {
    const d = parsed ?? new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // Sync display text when value changes externally (e.g. clear-all)
  useEffect(() => {
    setInputText(value ? toDisplay(value) : "");
    if (value) {
      const d = parseLocal(value);
      setView({ year: d.getFullYear(), month: d.getMonth() });
    }
  }, [value]);

  function handleTextChange(text: string) {
    setInputText(text);
    if (!text) { onChange?.(""); return; }
    const iso = parseTyped(text);
    if (iso) {
      onChange?.(iso);
      const d = parseLocal(iso);
      setView({ year: d.getFullYear(), month: d.getMonth() });
    }
  }

  // Close on scroll or pointer-down outside the anchor
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", close, { capture: true });
  }, [open]);

  function handleBlur() {
    // Reformat to display format on blur, or reset to last valid value
    if (!inputText) return;
    const iso = parseTyped(inputText);
    if (iso) setInputText(toDisplay(iso));
    else setInputText(value ? toDisplay(value) : "");
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange?.("");
    setInputText("");
  }

  function prevMonth() {
    setView(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 });
  }
  function nextMonth() {
    setView(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 });
  }

  const cells = useMemo(() => {
    const firstDow = new Date(view.year, view.month, 1).getDay();
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    const daysInPrev = new Date(view.year, view.month, 0).getDate();
    const out: { date: Date; current: boolean }[] = [];
    for (let i = firstDow - 1; i >= 0; i--)
      out.push({ date: new Date(view.year, view.month - 1, daysInPrev - i), current: false });
    for (let d = 1; d <= daysInMonth; d++)
      out.push({ date: new Date(view.year, view.month, d), current: true });
    const tail = 7 - (out.length % 7);
    if (tail < 7)
      for (let d = 1; d <= tail; d++)
        out.push({ date: new Date(view.year, view.month + 1, d), current: false });
    return out;
  }, [view]);

  function selectDay(iso: string) {
    onChange?.(iso);
    setInputText(toDisplay(iso));
    setOpen(false);
  }

  return (
    <>
      {/* Input container — anchors the popover */}
      <div
        ref={anchorRef}
        className={cn(
          "flex items-center gap-1",
          "rounded-[min(var(--radius-md),10px)] border border-input bg-transparent",
          "h-7 pl-2.5 pr-1.5 text-xs transition-colors",
          "dark:bg-input/30",
          "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          value ? "border-amber-500/50" : "",
          className
        )}
      >
        <input
          type="text"
          value={inputText}
          onChange={e => handleTextChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            "bg-transparent outline-none text-xs w-[78px] shrink-0",
            value ? "text-amber-400" : "text-muted-foreground",
            "placeholder:text-muted-foreground/50"
          )}
        />
        {value
          ? (
            <button type="button" onClick={clear} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
              <X className="size-3" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setOpen(v => !v)}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <CalendarDays className="size-3.5" />
            </button>
          )
        }
      </div>

      {/* Calendar popover — anchored to the container div */}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Portal>
          <Popover.Positioner
            anchor={anchorRef}
            side="bottom"
            align="start"
            sideOffset={6}
            className="z-50"
          >
            <Popover.Popup
              className={cn(
                "w-[248px] rounded-xl border border-border bg-card p-3 shadow-xl outline-none",
                "transition-all duration-150 ease-out",
                "data-[starting-style]:opacity-0 data-[starting-style]:-translate-y-1 data-[starting-style]:scale-[0.98]",
                "data-[ending-style]:opacity-0 data-[ending-style]:-translate-y-1 data-[ending-style]:scale-[0.98]",
              )}
            >
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-2">
                <button type="button" onClick={prevMonth}
                  className="size-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <ChevronLeft className="size-3.5" />
                </button>
                <span className="text-xs font-medium tabular-nums">
                  {MONTHS[view.month]} {view.year}
                </span>
                <button type="button" onClick={nextMonth}
                  className="size-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <ChevronRight className="size-3.5" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAYS.map(d => (
                  <div key={d} className="flex items-center justify-center h-6 text-[10px] font-medium text-muted-foreground/50">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-y-0.5">
                {cells.map(({ date, current }, i) => {
                  const iso = toISO(date);
                  const selected = iso === value;
                  const isToday = iso === today;
                  const disabled = !!min && iso < min;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={disabled}
                      onClick={() => selectDay(iso)}
                      className={cn(
                        "flex items-center justify-center h-7 w-full rounded-md text-xs transition-colors",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                        selected
                          ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40 font-semibold"
                          : isToday && current
                          ? "ring-1 ring-border font-medium text-foreground hover:bg-accent"
                          : current
                          ? "text-foreground hover:bg-accent"
                          : "text-muted-foreground/30 hover:bg-accent/50",
                        disabled && "opacity-25 cursor-not-allowed pointer-events-none",
                      )}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </>
  );
}
