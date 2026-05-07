import { TransactionsTable } from "./components/TransactionsTable";
import "./index.css";

export function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-7 rounded-md bg-amber-500/20 ring-1 ring-amber-500/30 flex items-center justify-center">
            <span className="text-amber-400 font-mono text-xs font-bold select-none">₿</span>
          </div>
          <div>
            <p className="text-sm font-semibold leading-none tracking-tight">Bloxtax</p>
            <p className="text-xs text-muted-foreground mt-0.5">Transaction Ledger</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 w-full max-w-7xl mx-auto">
        <div className="mb-5">
          <h1 className="text-base font-semibold">Transactions</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Crypto transactions across all wallets and networks
          </p>
        </div>
        <TransactionsTable />
      </main>
    </div>
  );
}

export default App;
