import type { TransactionRow } from "@/api/types";
import { AmountCell } from "./AmountCell";

type Props = Pick<TransactionRow, "feeAmount" | "feeCurrency">;

export const FeeAmountCell = ({ feeAmount, feeCurrency }: Props) => (
  <AmountCell amount={feeAmount} currency={feeCurrency} colorClass="text-muted-foreground" />
);
