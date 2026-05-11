import type { TransactionRow } from "@/api/types";
import { AmountCell } from "./amountCell";

type Props = Pick<TransactionRow, "sellAmount" | "sellCurrency">;

export const SellAmountCell = ({ sellAmount, sellCurrency }: Props) => (
  <AmountCell amount={sellAmount} currency={sellCurrency} colorClass="text-rose-400" />
);
