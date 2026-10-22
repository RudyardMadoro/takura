# Disabled future payment contract

`PaymentGateway` is an isolated extension port only. `payment_enabled=false` is invariant for R1; there are no checkout routes, ledger, receipts, credentials or charges.

Future activation requires an accepted exact quote revision and milestone, server-frozen amount/currency/merchant, unique provider event and transaction references, verified callbacks, reconciliation and explicit refund permission. A browser redirect never establishes payment. A partial deposit never clears the full contract. Forged, replayed, wrong-merchant and wrong-amount fixtures must remain failing before any sandbox work. Payfast is provisional and requires a new provider/rules review.
