import { newtonRaphson } from '@fvictorio/newton-raphson-method';
// @ts-ignore
import Big from 'big.js';

export const calcSellAmountInCollateral = (
  sharesToSell: bigint,
  holdings: bigint,
  otherHoldings: bigint[],
  fee: number,
): bigint | null => {
  Big.DP = 90;

  const sharesToSellBig = new Big(sharesToSell.toString());
  const holdingsBig = new Big(holdings.toString());
  const otherHoldingsBig = otherHoldings.map((x) => new Big(x.toString()));

  const f = (r: Big) => {
    // For three outcomes, where the first outcome is the one being sold, the formula is:
    // f(r) = ((y - R) * (z - R)) * (x  + a - R) - x*y*z
    // where:
    //   `R` is r / (1 - fee)
    //   `x`, `y`, `z` are the market maker holdings for each outcome
    //   `a` is the amount of outcomes that are being sold
    //   `r` (the unknown) is the amount of collateral that will be returned in exchange of `a` tokens
    const R = r.div(1 - fee);
    const firstTerm = otherHoldingsBig.map((h) => h.minus(R)).reduce((a, b) => a.mul(b));
    const secondTerm = holdingsBig.plus(sharesToSellBig).minus(R);
    const thirdTerm = otherHoldingsBig.reduce((a, b) => a.mul(b), holdingsBig);
    return firstTerm.mul(secondTerm).minus(thirdTerm);
  };

  const r = newtonRaphson(f, 0, { maxIterations: 100 });

  if (r) {
    const amountToSell = BigInt(r.toFixed(0));
    return amountToSell;
  }

  return null;
};
