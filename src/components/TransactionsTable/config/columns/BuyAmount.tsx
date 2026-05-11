import type { TransactionRow } from "@/api/types";
import { AmountCell } from "./AmountCell";

type Props = Pick<TransactionRow, "buyAmount" | "buyCurrency">;

export const BuyAmountCell = ({ buyAmount, buyCurrency }: Props) => (
  <AmountCell amount={buyAmount} currency={buyCurrency} colorClass="text-emerald-400" />
);
