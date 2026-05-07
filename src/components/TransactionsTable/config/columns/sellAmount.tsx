import { AmountCell } from "./amountCell";

export const SellAmountCell = ({ sellAmount, sellCurrency }: { sellAmount: number | null; sellCurrency: string | null }) => (
  <AmountCell amount={sellAmount} currency={sellCurrency} colorClass="text-rose-400" />
);
