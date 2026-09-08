# nahtnam Action Center — planned SMS opt-in

**Verification review document · September 7, 2026**

**This document describes a planned, unpublished enrollment form. No recipients have been enrolled through this form.** The current deployment is a founder-operated pilot. Broader onboarding and commercialization are under evaluation. Outbound Action Center SMS remains disabled pending verification and implementation of the enrollment and messaging controls below.

## Proposed authenticated account-settings form

**SMS workflow alerts (optional)**

Receive transactional updates about your configured workflows. Web access remains available without SMS.

**Mobile phone number**

`[ Enter your own number, including country code ]`

`☐` **Consent checkbox — optional and unchecked by default:**

> I agree to receive recurring automated SMS from nahtnam Action Center about my configured workflows, including time-sensitive task reminders, schedule updates, and service alerts. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. SMS enrollment is optional. [SMS Terms] [Privacy Policy]

**SMS Terms and Privacy Policy: pending publication.** The bracketed labels above represent planned links; no published policies are claimed by this document. Enrollment will not open until those policies and the required controls are available.

**Button:** `Enable SMS alerts`

The planned service will record the selected consent text/version and timestamp, verify control of the entered number, and send the confirmation below before workflow alerts begin. Merely entering a number, opening the dashboard, or scanning a receipt QR code will not enroll a recipient.

## Planned confirmation and message controls

**Enrollment confirmation:**

> nahtnam Action Center: You're subscribed to workflow alerts. Message frequency varies. Msg & data rates may apply. Reply STOP to opt out or HELP for help.

Alerts will identify nahtnam Action Center. STOP instructions will appear in the first message and every third message, or at least monthly at lower volume. Short reply acknowledgments will omit the full repeated footer; per-recipient cadence will still be tracked.

Freeform replies will be stored verbatim for the workflow agent to interpret on its next scheduled run. They will not be restricted to Y/N commands.

STOP will suppress further workflow SMS and ordinary reply acknowledgments until a valid re-enrollment. Required carrier-managed control responses will be respected without duplicate custom STOP confirmations. HELP routing and suppression will be verified before activation.

**Planned HELP response:**

> nahtnam Action Center provides alerts about your configured workflows. For help, visit https://www.nahtnam.com/contact. Reply STOP to opt out. Msg & data rates may apply.

Public contact: [nahtnam.com/contact](https://www.nahtnam.com/contact).
