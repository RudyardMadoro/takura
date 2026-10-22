# Communications activation runbook

Production email remains disabled until an operator records all of the following:

- The business owns the sending domain and approves the From identity and reply route.
- SPF includes the chosen sender without exceeding DNS lookup limits; SES DKIM tokens are published and verified; DMARC starts with an approved monitoring policy and reporting mailbox before enforcement is increased.
- SES production access, region, configuration set, SNS topic/account/environment and bounce/complaint ownership are confirmed. The application role receives send access only for the approved identity.
- `SES_ENABLED=true` is supplied only in production with credentials from the platform secret store. Local/demo profiles always route to the `example.invalid` sink and reject arbitrary addresses.
- The SNS subscription uses HTTPS. Signature verification permits only the documented AWS SNS certificate hosts/path, rejects redirects, checks the exact topic ARN and deduplicates MessageId.
- Perform the isolated real-service harness against controlled owned recipients, then record delivery, bounce and complaint evidence. Do not interpret SES acceptance as inbox delivery or reading.

Templates are plain text and escape dynamic data by construction. Enquiry acknowledgements contain the reference and response expectation. Staff alerts contain only reference, service family and an authenticated staff link—never descriptions, plans or attachments. Quote issue is the only template allowed to resolve an encrypted customer-access secret in worker memory.

Twilio SMS/WhatsApp stays disabled. Activation requires official provider review of sender/template/consent/opt-out rules, verified callback signatures, replay protection, destination suppression and explicit spend caps. Click-to-call and WhatsApp configuration remains null in demo; message URLs must never contain plans or personal details.

Outbox retry delays are 1, 5, 15, 60 and 240 minutes. Permanent failures stop. A timeout that may have been accepted becomes `DELIVERY_UNKNOWN` and is never automatically retried. An authorised user must investigate provider evidence and supply a reason; manual retries are capped at three.
