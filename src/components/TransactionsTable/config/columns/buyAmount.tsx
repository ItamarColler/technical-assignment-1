import { AmountCell } from "./amountCell";

export const BuyAmountCell = ({ buyAmount, buyCurrency }: { buyAmount: number | null; buyCurrency: string | null }) => (
  <AmountCell amount={buyAmount} currency={buyCurrency} colorClass="text-emerald-400" />
);
