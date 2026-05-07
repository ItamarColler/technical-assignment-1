import { AmountCell } from "./amountCell";

export const FeeAmountCell = ({ feeAmount, feeCurrency }: { feeAmount: number | null; feeCurrency: string | null }) => (
  <AmountCell amount={feeAmount} currency={feeCurrency} colorClass="text-muted-foreground" />
);
