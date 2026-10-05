# Extract of Property_Transformation_Website_Specification_Updated.docx

> Mechanically extracted from the authoritative DOCX; paragraphs and tables are preserved in document order where possible.

Property Transformation and Board Sales Website Specification

Functional and development specification

Prepared for Rudyard Madoro | 4 October 2026 | Specification version 1.1

# 1 Purpose baseline and interpretation

This specification defines the behaviour, screens, business rules, data contracts and verification criteria for a website serving property transformation, construction, interiors, custom cabinetry, standalone board sales, board processing and selected supporting hardware. It translates the attached Property Transformation Website Requirements version 1.2 into implementable detail. The baseline source is the attached Requirements version 1.1, revised to version 1.2 alongside Architecture version 1.0 on 4 October 2026.

Developers may proceed using the dummy configuration and synthetic records defined here. Pending business decisions do not block design, implementation or testing. Every dummy value is a replaceable development assumption, not a confirmed trading detail, machinery capability, price, qualification, warranty or legal policy. Production publication requires replacing or explicitly approving those values and removing synthetic claims. At the user's direction, Architecture version 1.0 and sections 25 to 27 select Angular, Java Spring Boot, PostgreSQL, GitHub, Contabo containers, AWS S3 and managed staff federation. Dummy business policies remain replaceable.

The source requirements control business scope. This document supplies proposed implementation rules where the source is less specific. SP identifiers identify specification rules; FR and NFR identifiers refer to the source requirements. R1 means launch; R2 means the next release; R3 means optional future work. Mandatory security and privacy behaviour applies to all releases. Development defaults can be changed through versioned configuration without rewriting customer journeys.

# 2 Release boundaries and system responsibilities

## 2 1 Launch baseline

R1 includes the public website, published content, project and cabinetry portfolios, a standalone board catalogue, cutting-list attachment enquiries, supporting hardware enquiries, multi-service quotation requests, private uploads, staff identity and permissions, lead assignment and follow up, manually uploaded quotation PDFs, quote approval and controlled issue, customer quote viewing, editorial management, analytics foundations, monitoring and recovery.

Board-only enquiries never require a construction service, cabinetry installation, cutting list or customer account. Supply-only and fix-and-supply cabinetry are separate fulfilment selections. Selecting a product requests pricing; it does not buy, reserve or pay for it. The customer does not receive a binding construction estimate or a guaranteed development capacity from the website.

## 2 2 Later releases

R2 contains an interactive cutting-list editor, optional accessible before-and-after comparisons, resources publishing, customer enquiry status access, quote line-item generation, recorded electronic acceptance, a trade enquiry basket and booking integration. R3 may include payments, live stock, ecommerce, project progress access, property financial scenarios and accommodation links. Each later module requires a separate readiness decision; no R1 route should suggest a feature is available when disabled.

## 2 3 Logical components

| Component             | Responsibility                                                 | Access boundary                                             |
| --------------------- | -------------------------------------------------------------- | ----------------------------------------------------------- |
| Public presentation   | Pages, galleries, catalogue, forms and quote viewing           | Published content or a narrowly scoped quote link           |
| Content operations    | Drafts, media clearance, preview, publication and revisions    | Content permissions                                         |
| Enquiry operations    | Validation, persistence, assignment, tasks and assessments     | Public creation; private staff management                   |
| Quotation operations  | PDF revisions, approval, issue, expiry and evidence            | Authorised estimators, approvers and scoped customers       |
| File operations       | Upload sessions, validation, quarantine, scanning and delivery | Private customer files separated from approved public media |
| Background processing | Notifications, reminders, cleanup and publication refresh      | Service identities with minimum privileges                  |
| Administration        | Users, role grants, settings, audit and exports                | Explicit management permissions                             |

These are logical boundaries, not a requirement for independently deployed services. The selected physical design is the modular monolith, separate worker and presentation renderer defined in Architecture version 1.0.

# 3 Dummy business configuration and replacement register

## 3 1 Configuration governance

SP 01. Each setting stores key, value, type, environment, status, effective date, revision, changed by and changed at. Status is DEMO, PENDING, CONFIRMED or RETIRED. A descriptive dummy label remains visible in staff preview. Demo public pages show a persistent demonstration banner and use nonindexable preview deployment settings. Replacing one setting must not retroactively rewrite issued quotation documents or historical enquiry snapshots.

Public contact buttons are disabled when contact configuration is DEMO. Development notifications go to a local message log or an explicitly configured test sink; arbitrary addresses entered in demo forms must not receive real email. Never seed real telephone numbers, bank accounts or professional registration identifiers. Dummy credentials are not stored in source control; create staff identities through the selected development authentication mechanism.

## 3 2 Identity geography and commercial defaults

| Key or subject           | Dummy value                                                 | Implementation rule                                                |
| ------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------ |
| trading_name             | Takura Build and Boards DEMO                                | Display as a placeholder; final name remains unconfirmed           |
| legal_entity             | Example Property and Board Services DEMO                    | No invented company registration or tax number                     |
| website_domain           | takura-build.example                                        | Reserved example domain used only in fixtures                      |
| email                    | enquiries@takura-build.example                              | Send only to demo notification sink                                |
| phone and WhatsApp       | null                                                        | Display Contact number pending; disable call and chat actions      |
| country and currency     | South Africa; ZAR                                           | Configurable assumptions; no fixed legal or tax inference          |
| timezone                 | Africa/Johannesburg                                         | Store timestamps in UTC; render local dates and business hours     |
| service areas            | Midrand, Sandton and Centurion DEMO                         | Sample text labels only; manual location review                    |
| workshop address         | Demo Workshop, 1 Example Road, Demo Suburb                  | No real map pin; visits by confirmed appointment                   |
| business hours           | Monday to Friday 08:00 to 17:00                             | Public holidays configurable; weekends closed in demo              |
| commercial model         | Client-funded services                                      | No joint venture, financing or property purchase claims            |
| site assessment          | Free preliminary discussion; free demo site visit           | Configurable fee and terms; no payment flow in R1                  |
| quote validity           | 14 calendar days                                            | Expiry at 17:00 local time on the specified expiry date            |
| first response           | One business day, defined as 9 business hours               | Internal timer until human response, not final quote promise       |
| warranty                 | Demo proposal of 12 months workmanship cover                | Not approved commercial wording; include only in labelled fixtures |
| approvals responsibility | Owner and appropriate appointed professionals               | Business coordinates only if confirmed in the agreed scope         |
| professional partners    | None confirmed                                              | Do not display credentials, badges or regulated titles             |
| project delivery timing  | To be confirmed after scope review                          | No universal construction completion promise                       |
| tax mode                 | UNCONFIRMED; fixture quote uses NOT_APPLICABLE and zero tax | Replace with verified tax settings before issuing live quotes      |
| implementation budget    | Not prescribed                                              | Screens and acceptance criteria are independent of a budget figure |
| operating owner          | Demo Owner                                                  | Placeholder responsibility; replace with named accountable person  |
| technical maintenance    | Demo Technical Maintainer                                   | Placeholder support responsibility                                 |

## 3 3 Service and workshop defaults

| Setting                      | Dummy value                                                                                                                               | Rule                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| service selection            | Property transformation, construction, renovation, extensions, maintenance, interiors, cabinetry, board sales, board cutting and hardware | Seed as demo-enabled; production availability separately confirmed          |
| board range                  | White melamine, raw MDF and plywood                                                                                                       | Unbranded example products; no supplier partnership implied                 |
| availability wording         | Sourced on request, subject to confirmation                                                                                               | No live stock indicator or stock reservation                                |
| board sales units            | Full sheet; cut part for processed components                                                                                             | Specify unit explicitly on every request line                               |
| example sheet size           | 2440 by 1220 mm                                                                                                                           | Sample catalogue specification, not verified workshop capacity              |
| example thicknesses          | 16 mm melamine, 18 mm MDF, 12 mm plywood                                                                                                  | Configurable product variants                                               |
| workshop indicative envelope | Length 100 to 2440 mm; width 100 to 1220 mm; thickness 3 to 25 mm                                                                         | Demo review thresholds; R1 attachments are manually checked                 |
| edging and drilling          | Demonstration options, subject to confirmation                                                                                            | Availability flags govern selectable and published options                  |
| submitted cutting dimensions | Finished part size in mm                                                                                                                  | Preserve convention on request; staff confirm before production             |
| customer-supplied boards     | Accepted for inspection in demo                                                                                                           | Suitability, damage and processing policy confirmed before work             |
| minimum board order          | One full sheet                                                                                                                            | Fixture policy; configurable by product or fulfilment option                |
| delivery                     | Quote separately after location review                                                                                                    | No automatic distance, fee or delivery-date guarantee                       |
| cabinetry                    | Supply only, fix and supply, or undecided                                                                                                 | Fix and supply covers agreed materials, fabrication and installation        |
| standard exclusions          | Plumbing, electrical work, structural changes, appliances and countertops unless quoted                                                   | Capture the actual exclusions in each approved quote                        |
| lead routing                 | Property Team, Cabinetry Team, Boards Team, General Services Team                                                                         | One lead owner; collaborators can be added                                  |
| imagery                      | Three synthetic project records and clearly labelled placeholder images                                                                   | Replace with cleared real photography; never imply completed synthetic work |

## 3 4 Operational default parameters

Use five attachments per enquiry, 10 MiB per file, 50 MiB combined, 10 items per board or hardware request section and a 5000-character enquiry description. Define MiB consistently in frontend and backend hints. Upload sessions last 60 minutes; abandoned objects become cleanup eligible after 30 days. Customer quote tokens last at most 14 days or until the quote expires, whichever comes first. Staff file links last five minutes where signed links are used.

Retain idempotency results for seven days and notification deduplication records for at least the retry horizon. Demo staff idle timeout is 30 minutes and absolute session duration eight hours; authentication details depend on the chosen implementation. Closed unsuccessful enquiries are review eligible for deletion after 12 months. Contract retention requires an approved policy; no automatic deletion of won work is configured. These values are development policies, not statutory periods.

# 4 Service taxonomy fulfilment and navigation

SP 02. Use immutable codes for service identity and editable labels for presentation. PROPERTY_TRANSFORMATION, CONSTRUCTION, RENOVATION, EXTENSION, MAINTENANCE and INTERIORS belong to property and general services. CABINETRY belongs to cabinetry. BOARD_SALES and BOARD_CUTTING belong to boards and workshop. HARDWARE belongs to supporting materials. Archive services rather than removing codes referenced by historical records.

Board fulfilment is FULL_SHEET or CUT_TO_SIZE. Cabinetry fulfilment is SUPPLY_ONLY, FIX_AND_SUPPLY or UNDECIDED. Collection preference is COLLECTION, DELIVERY or UNDECIDED. These are separate fields: requesting delivery does not imply installation, and requesting cutting does not imply complete cabinetry manufacture.

SP 03. The navigation contains Home, Property Transformation, Services, Projects, Cabinetry, Boards and Workshop, About and Contact, plus Request a Quote. Boards and Workshop expands to Board Sales, Cutting Services and Supporting Hardware. On narrow screens, use an accessible menu button with visible open and closed states. The quote action remains discoverable without relying on a hover menu.

# 5 Public routes and screen contracts

Each screen implements loading, success, empty and recoverable error states where data is requested. Avoid layout movement when media loads. Every route has a meaningful title and heading. Customer actions preserve the selected service or product as context, not as trusted authority for price or availability.

| Screen                      | Route                        | Content and interaction contract                                                                                                                 |
| --------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| P01 Home                    | /                            | Genuine or labelled demo hero, service identity, primary assessment action, board and cabinetry cards, featured work, process and contact action |
| P02 Property transformation | /property-transformation     | Conversion and additional-land explanation, assessment process, constraints, examples and preselected assessment request                         |
| P03 Services                | /services                    | Grouped active services and links to details; unavailable services omitted from new selection                                                    |
| P04 Service detail          | /services/{slug}             | Scope, inclusions, exclusions, process, projects, FAQs and quote action                                                                          |
| P05 Project index           | /projects                    | Category filter, featured cards, pagination and accessible no-results state                                                                      |
| P06 Project detail          | /projects/{slug}             | Ownership designation, problem, work, design decisions, cleared gallery and related enquiry action                                               |
| P07 Cabinetry               | /cabinetry                   | Category gallery, supply-only and fix-and-supply explanation, materials process and product-context quote action                                 |
| P08 Board sales             | /boards                      | Standalone sales proposition, material filters, board variants, quotation-only cards and collection or delivery explanation                      |
| P09 Board detail            | /boards/{slug}               | Sheet specification, thickness and finish variants, unit, availability wording, optional processing and quote action                             |
| P10 Cutting                 | /workshop/board-cutting      | Capabilities, dimension convention, cut-list instructions, upload or help route and fulfilment policies                                          |
| P11 Hardware                | /hardware                    | Confirmed supporting categories and enquiry items; painting supplies distinguished from labour                                                   |
| P12 About                   | /about                       | Owner and team, verified experience and workshop; no fabricated credentials                                                                      |
| P13 Contact                 | /contact                     | Contact methods, business hours, service areas and workshop access policy; demo contacts disabled                                                |
| P14 FAQs                    | /faqs                        | Topic groups and linked enquiry actions; keyboard-operable disclosures                                                                           |
| P15 Quote request           | /request-quote               | Conditional wizard described below; no customer sign-in                                                                                          |
| P16 Submission result       | In-session confirmation view | Reference and next step; no publicly retrievable customer details                                                                                |
| P17 Quote view              | /quote/view                  | Revocable scoped link, approved PDF and state; no account-wide access                                                                            |
| P18 Policies                | /privacy and /terms          | Versioned published policy content, linked from forms and footer                                                                                 |
| P19 Not found               | Unknown public route         | Correct 404 status, useful navigation and contact action                                                                                         |

R2 resource routes are /resources and /resources/{slug}. Disabled R2 routes return a useful 404 rather than displaying unfinished controls.

## 5 1 Listings and catalogue interactions

SP 04. Project filters use the service family or category identifier. Board filters use type, finish, thickness and sheet size. Filters update URL query parameters and preserve back navigation. Default listing size is 12; staff listings default to 25 with a maximum of 100. Sort projects by featured then publication date; sort boards by editorial order then name. Pagination must not duplicate or skip records when sorting values match; use a stable ID tie-breaker.

Board detail selection requires one published variant. A quote request carries variant ID, displayed specification and quantity. Public price is hidden by default. If pricing is enabled later, require currency, unit, tax display basis, effective date and price validity. No Add to Cart or checkout appears in R1. Multiple requested board lines are entered within the enquiry form; a persistent browsing basket is R2.

## 5 2 Galleries and design behaviour

SP 05. Gallery cards use responsive images with recorded dimensions, descriptive captions and alt text. Opening a gallery moves focus to the dialog; closing restores focus to the invoking item. Escape closes, arrow controls navigate and focus remains within the dialog. Announce image position and caption. Provide labelled controls rather than swipe-only navigation. Before-and-after sliders are R2; labelled static stages are sufficient at launch.

Define visual tokens during design. Dummy palette is charcoal text, warm off-white surfaces and a muted timber accent; verify actual text and control contrast before use. Use body text at least 16 CSS pixels, mobile spacing that avoids cramped fields and a maximum reading width around 75 characters. Breakpoints are layout decisions, with verification at 320, 375, 768, 1024 and 1440 CSS pixels. Sticky actions may not cover content, errors or focused controls. Support reduced motion and 200 percent text zoom.

# 6 Quotation wizard common behaviour

SP 06. Use four steps: Service selection; Requirements; Contact and files; Review and submit. For simple maintenance requests these sections may appear on one screen with the same rules. Step titles and progress are explicit. Back retains entered data. Changing services removes irrelevant details from the final payload; warn before clearing populated sections. Preserve fields during recoverable errors. Keep drafts in memory or session-scoped storage only; do not persist customer plans or contact data in long-lived browser storage by default.

The first step allows one to ten distinct services. Prefer the preselected service from the referring page but let the user change it. Selecting BOARD_SALES with CUT_TO_SIZE reveals cutting details without forcing another unrelated customer journey. A single request can combine boards, processing and cabinetry; prevent accidental duplicate sections for the same requested work. Server validation canonicalises service codes and relevant details.

Review displays human-readable units, chosen variants, fulfilment options, attachment names and contact preference. Editing a section returns to that step. Submit is disabled only while a request is in progress; validation failures restore it. A successful server response displays the enquiry reference and expected next step. Clear the submitted draft only after successful persistence.

## 6 1 Common field contract

| Field                | Required and type                | Validation and behaviour                                                                                                |
| -------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| services             | Yes; distinct service code array | 1 to 10 currently active codes; unknown or archived code rejected                                                       |
| full_name            | Yes; text                        | Trim; 2 to 120 characters; allow spaces, accents and ordinary punctuation                                               |
| email                | Conditional; text                | Required for EMAIL preference; maximum 254 characters; syntactic validation; lowercase domain only                      |
| phone                | Conditional; text                | Required for CALL or WHATSAPP; parse with country context and normalise if valid; do not insist on one country's format |
| preferred_contact    | Yes; enum                        | EMAIL, CALL or WHATSAPP; route may be disabled if business channel unavailable                                          |
| business_name        | Optional; text                   | Maximum 160 characters                                                                                                  |
| country_code         | Yes; text                        | Configured country default, user changeable; recognised two-letter code                                                 |
| town_or_suburb       | Yes; text                        | 2 to 120 characters; manual service-area review; no exact street address required                                       |
| description          | Yes; text                        | 10 to 5000 characters after trim; escaped as text on display                                                            |
| budget_band          | Optional; enum                   | NOT_SURE plus configurable bands; retain band label and currency snapshot                                               |
| desired_start        | Optional; enum or date           | ASAP, WITHIN_ONE_MONTH, ONE_TO_THREE_MONTHS, FLEXIBLE, SPECIFIC_DATE; past specific date rejected                       |
| privacy_acknowledged | Yes; boolean                     | Must be true; record acknowledged notice version without treating this as marketing consent                             |
| marketing_opt_in     | Optional; boolean                | Default false; separate control and consent record                                                                      |
| source_context       | Optional; structured data        | Valid project/product IDs, referral code and approved campaign fields; server verifies and sanitises                    |
| attachment_ids       | Optional; ID array               | At most five; all belong to the submitted anonymous upload capability and are not rejected                              |

At least one contact method must be usable. Phone-only customers receive on-screen confirmation and manual staff contact in R1. Public contact preference options reflect confirmed business capability, while demo forms may exercise all channels through a test sink. Do not send customer data to analytics or embed it in contact-link URLs.

# 7 Service specific inputs and qualification

## 7 1 Property construction and interiors

Property transformation requires representative_status of OWNER or AUTHORISED_REPRESENTATIVE; site_scope of EXISTING_HOUSE, ADDITIONAL_LAND or BOTH; and intended_use of RENTAL, SHORT_STAY, PERSONAL or UNDECIDED. A visitor without authorisation can request a general discussion, but staff mark property access authorisation pending before scheduling a visit.

Optional fields are land_area_m2 and existing_building_area_m2 as positive decimal values up to 1,000,000; desired_unit_type as BACHELOR, ONE_BEDROOM, MIXED or UNDECIDED; desired_unit_count as an integer from 1 to 500 or unknown; occupancy as OCCUPIED, VACANT, PARTLY_OCCUPIED or UNKNOWN; and plans_status and approvals_status as PROVIDED, AVAILABLE, NOT_AVAILABLE or UNKNOWN. These limits prevent malformed input and are not feasibility rules. Do not calculate permitted units from area.

Construction and extension require work_type and a description; area, drawing status, utilities and site restrictions are optional. Renovation and maintenance require affected_area and description; urgency is ROUTINE, SOON or URGENT with no emergency dispatch commitment. Interiors require one or more rooms and a design objective, with style references and dimensions optional. Exact addresses, access instructions and appointment contacts are collected privately after qualification.

## 7 2 Cabinetry

Require product_types from KITCHEN, CABINET, WARDROBE, VANITY, TV_UNIT, COMPONENT or OTHER, and fulfilment of SUPPLY_ONLY, FIX_AND_SUPPLY or UNDECIDED. OTHER requires a brief explanation. Optional room dimensions are positive millimetre values; approximate dimensions remain flagged UNVERIFIED. Capture measurement_help, preferred material or board variant, finish, hardware preference, reference image, worktop needs and site restrictions.

SP 07. Fix and supply does not automatically include plumbing, wiring, structural changes, appliances or countertops. Staff must record verified measurements, the agreed material and installation scope before approving a live fabrication quote. For demo fixtures these confirmations are marked synthetic. Customer inspiration images do not establish permission to reproduce another designer's work.

## 7 3 Standalone board sales

SP 08. Support up to ten request lines. Each contains a published variant ID or free-text requested specification, quantity, unit and FULL_SHEET or CUT_TO_SIZE. FULL_SHEET quantity is a positive integer from 1 to 9999; no cutting list is required. CUT_TO_SIZE quantity uses part counts and must link to a cutting attachment or an explicit help request. A visitor unable to select a variant may describe material, finish, thickness and size; staff review availability.

Store selected variant specifications as an enquiry snapshot. Catalogue changes must not silently alter the request. Collect optional substitutes_allowed as YES, NO or DISCUSS; collection preference; requested date; and processing options. A requested date is a preference until staff confirmation. Delivery location at first contact uses suburb or town; obtain a detailed address later. Staff may quote a substitute only when discussed or permitted and must record it explicitly.

## 7 4 Board cutting and hardware

Cutting requires material_source of BUSINESS_SUPPLIED, CUSTOMER_SUPPLIED or UNDECIDED, and input_mode of ATTACHMENT or NEED_HELP. ATTACHMENT requires an associated non-rejected cut-list file; NEED_HELP requires a description. Capture dimension_convention as FINISHED_PART_SIZE from the current configuration and retain it on the request. Staff must confirm material suitability, dimensions, processing options and production instructions outside the public form.

Hardware requests contain category or item description, positive quantity and a clear unit such as EACH, PACK, LITRE or METRE. Allowed units depend on item metadata. Do not convert pack quantities to individual quantities without an explicit pack size. Brand preferences and substitute permission are optional. R1 is enquiry-only and does not maintain stock balances or reserve material.

# 8 Cutting specification and production boundary

SP 09. The launch cut-list instructions define part_id, material or board code, colour or finish, thickness_mm, finished_length_mm, finished_width_mm, quantity, grain_direction, rotation_allowed, edge_length_a, edge_length_b, edge_width_a, edge_width_b, drilling_notes and remarks. Each edge stores NONE or an agreed edging material, colour and thickness. Length edges run parallel to the stated length; width edges run parallel to the width. A preview diagram or labelled template must use the same convention.

Group parts by material, finish and thickness. Grain values are ALONG_LENGTH, ALONG_WIDTH, NONE or UNKNOWN. Rotation permission is a separate boolean; it must not override a specified grain direction. Do not derive saw-cut dimensions by subtracting edging thickness without workshop approval. Kerf, trimming allowance and machine nesting belong to the workshop production process, not R1 website calculations.

At R1 an XLSX file is treated as an untrusted attachment, not parsed into executable formulas or manufacturing instructions. The staff record can be marked LIST_REVIEW_PENDING, NEEDS_CLARIFICATION or SPECIFICATIONS_CONFIRMED. This review state is separate from enquiry and quote state. Production sign-off references a confirmed specification version and customer approval evidence. Receiving a list or issuing a quote never starts cutting automatically.

R2 editor scope uses 1 to 200 rows, positive finite dimensions, positive integer quantities, distinct part IDs within a group and explicit unknown-material review. Add, duplicate and remove actions preserve edge and grain details. Batch import is separately scoped. Machine-envelope checks warn or reject according to confirmed capability settings; demo limits never become verified capacity claims.

# 9 Attachment lifecycle and anonymous upload protocol

SP 10. Accepted types are JPEG, PNG, WebP, PDF and non-macro XLSX. Enforce extension, file signature and content checks as appropriate; the browser MIME type is advisory. Reject executables, archives, macro workbooks, SVG and arbitrary CAD formats. Generate storage names, isolate originals from public media and strip metadata from approved image derivatives. Cap files, aggregate bytes and decompressed workbook size; scanning must not expand unbounded archives inside document formats.

The anonymous client obtains an upload session with a random session capability bound to the session and a server-side abuse quota. The server returns upload instructions, file limits and expiry. The client uploads, calls completion, and sees VALIDATING, SCAN_PENDING, CLEAN or REJECTED. Uploaded bytes cannot be downloaded through that capability. Scope permissions to each assigned object, content length and operation.

Submission associates file records and an enquiry transactionally; files already stored outside the data transaction remain quarantined until the association succeeds. CLEAN files may be accessed by authorised staff. SCAN_PENDING files may be attached to a saved enquiry but remain unreadable. REJECTED files cannot satisfy a required cutting attachment; the customer can remove them or switch to NEED_HELP. If rejection arrives after submission, retain the enquiry, alert staff and request a replacement without publishing the rejected file.

| File state        | Allowed next states    | Key rule                                                                     |
| ----------------- | ---------------------- | ---------------------------------------------------------------------------- |
| CREATED           | UPLOADING, EXPIRED     | Session valid and quota checked                                              |
| UPLOADING         | VALIDATING, FAILED     | Completion verifies object and byte length                                   |
| VALIDATING        | SCAN_PENDING, REJECTED | Signature and structural checks pass before scan                             |
| SCAN_PENDING      | CLEAN, REJECTED        | Scan outage keeps file inaccessible                                          |
| CLEAN             | DELETION_PENDING       | Authorised download allowed; never public by default                         |
| FAILED or EXPIRED | DELETION_PENDING       | No use as a request attachment                                               |
| REJECTED          | DELETION_PENDING       | Preserve rejection metadata, restrict access to security operators if needed |
| DELETION_PENDING  | DELETED                | Remove object and derivatives; retain minimal audit event                    |

Use a content checksum to bind validation results to the actual object. Quarantined bytes must not be replaceable after validation without invalidating the scan. Demo scanning may use an isolated test adapter that returns controlled states; production must not enable that adapter. Remove orphan objects under the approved cleanup policy.

# 10 Enquiry persistence routing and business timers

## 10 1 Persistence and duplicate protection

SP 11. POST enquiry receives a client-generated random Idempotency-Key and a canonical request body. Save the key, request digest, enquiry, details, file associations and notification events in one durable transaction. Same key and same body returns the original success response; same key and different body returns 409 IDEMPOTENCY_CONFLICT. Expired keys permit a new submission; the UI warns before knowingly resubmitting an already confirmed request. Optional probable-duplicate flags never silently merge different customer requests.

Generate a random internal ID and a friendly reference such as ENQ-2026-000123. References are unique within the business; sequence gaps are acceptable. The public creation response contains only the new reference, result message and next-step wording. No unauthenticated reference lookup is available in R1. Do not display success until the enquiry transaction commits.

## 10 2 Routing and ownership

SP 12. Service rules choose the team. Board sales and cutting route to Boards Team; cabinetry to Cabinetry Team; transformation and construction to Property Team; maintenance and supporting hardware to General Services Team. For mixed requests, the dummy coordinator rule is PROPERTY first, then CABINETRY, then BOARDS, then GENERAL. Configure this order. Add the other relevant teams as collaborators only through authorised assignment.

Assign the designated active team coordinator when available; otherwise leave the enquiry in an unassigned queue visible to staff with assignment permission. Never assign to a disabled identity. Geographic uncertainty sets AREA_REVIEW_REQUIRED without rejecting the enquiry or promising service. The owner field is singular, while collaborator grants are multiple. Assignment notifications do not reveal customer plans in email.

## 10 3 Response timing

Business clocks count only configured open periods and exclude configured holidays. A one-business-day dummy target is nine business hours. A Monday 10:00 enquiry is due Tuesday 10:00 when both days are open; a Sunday submission begins accruing at Monday 08:00 and is due Monday 17:00. Automated acknowledgement does not stop the first-human-response timer. Record the first completed human contact event; failed contact attempts remain visible and can have a separate metric.

Create follow-up tasks with owner, due_at, status and purpose. An overdue request is a derived display state, not another enquiry status. Closed, lost or spam requests suppress ordinary reminders. Staff can postpone tasks with a reason. Each scheduled reminder has a unique event key so reprocessing does not create uncontrolled duplicates.

# 11 Enquiry state machine and assessment workflow

SP 13. State changes are commands validated on the server, not arbitrary text edits. NEW, CONTACTED, AWAITING_INFORMATION, ASSESSMENT_SCHEDULED, ASSESSMENT_COMPLETE, QUOTE_IN_PREPARATION, QUOTE_SENT, WON, LOST, CLOSED and SPAM correspond to the source states. Record previous state, next state, actor, time and reason or evidence reference.

| Current state        | Normal next states                                                             | Transition guard                                                                     |
| -------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| NEW                  | CONTACTED, AWAITING_INFORMATION, SPAM, CLOSED                                  | CONTACTED needs recorded human contact; spam or closure needs reason                 |
| CONTACTED            | AWAITING_INFORMATION, ASSESSMENT_SCHEDULED, QUOTE_IN_PREPARATION, LOST, CLOSED | Assignment exists; assessment confirmation recorded when scheduled                   |
| AWAITING_INFORMATION | CONTACTED, ASSESSMENT_SCHEDULED, QUOTE_IN_PREPARATION, LOST, CLOSED            | Required clarification resolved or appointment confirmed                             |
| ASSESSMENT_SCHEDULED | ASSESSMENT_COMPLETE, CONTACTED, AWAITING_INFORMATION, LOST, CLOSED             | Completion requires findings; cancellation returns to a prior work stage             |
| ASSESSMENT_COMPLETE  | QUOTE_IN_PREPARATION, AWAITING_INFORMATION, LOST, CLOSED                       | Findings and proposed scope recorded                                                 |
| QUOTE_IN_PREPARATION | QUOTE_SENT, AWAITING_INFORMATION, LOST, CLOSED                                 | QUOTE_SENT requires issued quote and recorded dispatch, not merely a draft           |
| QUOTE_SENT           | WON, LOST, QUOTE_IN_PREPARATION, AWAITING_INFORMATION, CLOSED                  | WON requires approved commercial confirmation and evidence                           |
| WON                  | CLOSED                                                                         | Handover or transfer to operational management recorded; no automatic project portal |
| LOST                 | CONTACTED, CLOSED                                                              | Reopening requires management permission and reason                                  |
| CLOSED or SPAM       | CONTACTED                                                                      | Exceptional reopening requires management permission and audit reason                |

Normal enquiry closing is an administrative outcome and does not imply construction has completed. No-assessment board orders can proceed directly from CONTACTED to QUOTE_IN_PREPARATION. Skipping stages outside the table is an explicit override command requiring elevated permission and a reason; security restrictions cannot be overridden.

SP 14. Assessments have PROPOSED, CONFIRMED, COMPLETED, CANCELLED and NO_SHOW states, linked enquiry, responsible staff, start and end, location or remote mode, findings and private notes. R1 customer date preferences are requests, not real bookings. Staff check conflicts and availability before confirming; the API rejects overlapping confirmed visits for the same assigned employee unless an authorised override is recorded. R2 external calendar synchronisation is separate.

# 12 Quote preparation approval issue and customer view

## 12 1 Quote contract

SP 15. A quote groups immutable issued revisions under one quote number, such as Q-2026-000041. Each revision stores revision number, enquiry ID, reviewed PDF, checksum, amount, currency, tax treatment, issue date, expiry date, scope summary, approval evidence and commercial terms snapshot. R1 staff upload a prepared PDF; automatic line-item calculation and PDF generation are R2. The recorded amount and PDF must agree, confirmed through a review checklist.

For full-sheet quotes specify board variant, sheet count, unit price basis if included, processing charges if any and delivery or collection. For cut-to-size work reference the reviewed list version. For cabinetry specify SUPPLY_ONLY or FIX_AND_SUPPLY, measurements status, materials, fittings, installation, exclusions and agreed responsibilities. For property work specify scope, assumptions and the professional or approvals process. Amounts use exact decimal values or integer minor units with an explicit currency, never floating-point accumulation.

## 12 2 Approval and revision state

| Quote state                    | Next states                  | Rule                                                         |
| ------------------------------ | ---------------------------- | ------------------------------------------------------------ |
| DRAFT                          | AWAITING_APPROVAL, CANCELLED | PDF clean; required metadata present before approval request |
| AWAITING_APPROVAL              | APPROVED, DRAFT, CANCELLED   | Approver reviews exact PDF checksum and metadata snapshot    |
| APPROVED                       | ISSUED, DRAFT, CANCELLED     | Any material edit returns to DRAFT and invalidates approval  |
| ISSUED                         | SUPERSEDED, EXPIRED, REVOKED | Issued contents immutable; customer views show current state |
| SUPERSEDED, EXPIRED or REVOKED | No content edits             | A new revision is required; staff retain historical record   |
| CANCELLED                      | No issue                     | Draft replacement may be created under the quote group       |

SP 16. Issue command verifies approval, clean PDF, contact route, dates and permission; then commits immutable content, an issue record, customer access grant and notification event. Quote SENT in the enquiry workflow means dispatch recorded after the delivery adapter accepts the message or an authorised staff member records manual delivery evidence. While queued or ambiguous, display Issue pending dispatch and retain the earlier enquiry work stage. Email acceptance is distinct from confirmed inbox delivery or customer reading.

Only issuing the replacement revision supersedes the previous issued revision; a new draft alone does not. Lost email delivery does not erase issued content. Do not issue a changed PDF under an existing revision number. Self-approval is disabled in demo configuration; a development fixture includes separate estimator and approver identities. The owner may later approve an explicit self-approval policy without bypassing audit or immutability.

## 12 3 Customer link and recorded outcome

SP 17. Customer access uses a cryptographically random secret with at least 128 bits of entropy, scoped to one revision, stored as a hash and revocable. Prefer a URL-fragment token exchanged by POST for a short-lived scoped session so secrets are not sent in referrers or ordinary URL logs. Remove the token from the address bar after exchange, use no-store responses and no third-party scripts on quote screens. Never log raw tokens.

A scoped session exposes the approved PDF and necessary metadata only. Expiry, revocation and supersession are checked on every authorised view or download. An expired or superseded revision displays a clear state and contact action; staff decide whether historical download is permitted. Demo policy hides superseded or revoked downloads. An expired quote has no Accept action in R1. Revocation prevents new sessions and terminates existing sessions; use proxied downloads if immediate file revocation is required.

R1 customer acceptance occurs through the owner's offline contract process. Staff record ACCEPTED_EXTERNALLY, DECLINED or NO_RESPONSE outcomes, relevant revision, confirmation date and evidence. Mark WON only with authorised commercial confirmation. R2 electronic acceptance will bind signer identity, exact revision, terms and timestamp; payment is separately scoped. Opening a quote never counts as acceptance.

# 13 Staff application screens and actions

| Screen                      | Main fields and controls                                                        | State and validation contract                                                                 |
| --------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| A01 Sign in                 | Staff identity, MFA, recovery route                                             | No public staff registration; generic sign-in errors; lockout and revocation supported        |
| A02 Dashboard               | New, unassigned, overdue, scan backlog and quote queue counts                   | Counts filtered by authorised scope; links open filtered lists                                |
| A03 Enquiry list            | Reference, customer, service, area, state, owner, age and follow-up             | Filter and sort; stable pagination; restricted audited export                                 |
| A04 Enquiry detail          | Contact, service sections, attachments, activity, tasks, assignments and quotes | Server enforces scope; concurrent edits return conflict; no silent overwrite                  |
| A05 Assessment              | Appointment times, assignee, mode, findings and state                           | Private location; conflict check; completion requires findings                                |
| A06 Quote revision          | PDF, metadata, review checklist, approval and issue actions                     | Clean file; mandatory fields; editing invalidates approval                                    |
| A07 Content list and editor | Page/service/project fields, revisions, preview and publish                     | Structured content; draft isolation; publish validation                                       |
| A08 Media library           | Image, alt text, caption, stage, rights and visibility                          | Clearance and scan checks before publication                                                  |
| A09 Catalogue               | Board products, variants, hardware, specifications and availability             | Required board attributes; no fabricated stock counters                                       |
| A10 Staff access management | Federated issuer and subject, active state, roles, teams and explicit grants    | Management authority required; no local passwords; retain one active authorised administrator |
| A11 Settings                | Dummy register, routing, hours, limits and policies                             | Typed validation; confirmed status and change history                                         |
| A12 Audit and notifications | Event type, actor, target, result, queue attempts and failures                  | Restricted access; no secrets or raw private payloads in logs                                 |

Dialog actions have readable titles, visible cancel/close controls, logical focus and responsive sizes. Destructive or irreversible actions such as revoking a quote or removing a published image explain their consequence and require an explicit UI confirmation. Saving reversible content does not require unnecessary confirmation steps.

# 14 Permissions and record scope

SP 18. Permission evaluation combines active identity, role grants, team or explicit record access and operation-specific privileges. Every API and download verifies all applicable checks. Hide forbidden actions in the UI but never rely on hiding them for protection. Authentication does not imply access to all customer records.

| Action                           | Administrator                                   | Sales Coordinator        | Estimator               | Content Editor         | Reviewer           |
| -------------------------------- | ----------------------------------------------- | ------------------------ | ----------------------- | ---------------------- | ------------------ |
| Manage users and settings        | Yes                                             | No                       | No                      | No                     | No                 |
| View leads and clean attachments | Explicit scope grant                            | Assigned/team scope      | Granted enquiry scope   | No                     | Granted read scope |
| Assign leads and collaborators   | Separate ASSIGN_LEADS grant                     | Team assignment grant    | No                      | No                     | No                 |
| Edit contact and follow-up       | Separate operational grant                      | In scope                 | Draft quote notes only  | No                     | No                 |
| Change normal enquiry state      | Separate operational grant                      | In scope                 | Quote work actions only | No                     | No                 |
| Draft quote                      | Separate DRAFT_QUOTES grant                     | Only with grant          | In scope                | No                     | No                 |
| Approve and issue quote          | Separate APPROVE_QUOTES and ISSUE_QUOTES grants | Only with both grants    | Only with both grants   | No                     | No                 |
| Edit public content              | With EDIT_CONTENT                               | No by default            | No                      | Yes                    | No                 |
| Publish public content           | With PUBLISH_CONTENT                            | No                       | No                      | Separate publish grant | No                 |
| Export customer data             | Separate EXPORT_LEADS grant                     | Separate grant and scope | No                      | No                     | No                 |
| Reopen closed work               | Separate MANAGE_LEADS grant                     | Separate grant and scope | No                      | No                     | No                 |

Demo Owner has administrator and approved operational grants. Demo Coordinator owns service enquiries. Demo Estimator drafts quotes. Demo Approver approves and issues without being the drafter. Demo Editor publishes public content without lead access. Demo Reviewer has explicit access to one synthetic enquiry. Never infer approval privilege merely from being an administrator.

Removing a grant takes effect on the next request; sessions must not cache authorisation indefinitely. Deactivating a staff identity prevents new access, revokes sessions and reassigns or flags their tasks. Audit records retain stable actor identity. Use generic not-found responses for out-of-scope record IDs to avoid disclosing their existence.

# 15 Content publication catalogue and media rules

SP 19. Content states are DRAFT, PUBLISHED and ARCHIVED, with private preview links and retained revisions. Publication is an explicit operation that validates required fields, publication permissions and linked media. Publication reaches the normal public view within five minutes through cache refresh or equivalent implementation. Drafts and archives are absent from public listing endpoints and sitemap.

Services require code, slug, title, family, summary, scope, exclusions and enquiry action. Projects require title, slug, approximate location, ownership designation, narrative and at least one cleared image. Project categories are many-to-many. Optional unit count, area, cost, duration or income figures require a verified flag and evidence reference before publication. Cabinetry gallery items can relate to a project and link to the relevant product type.

Board products group variants. Each variant requires SKU or generated internal code, type, finish, thickness_mm, sheet_length_mm, sheet_width_mm, unit_of_sale, publication state and availability wording. Example MDF and plywood may have no decorative finish; use RAW rather than a misleading colour. Confirm brand permission and supplier image rights before displaying branded assets. Store changed specifications as revisions; enquiry snapshots preserve the old values.

SP 20. Media requires original file reference, clean scan, alt text where informative, caption, BEFORE/DURING/AFTER/DETAIL/CONCEPT stage, rights status and publication clearance. Clearance values are DEMO_ONLY, APPROVED_PUBLIC, PRIVATE or PENDING. DEMO_ONLY images can appear only in demo preview with a visible label. Public derivatives omit location metadata and sensitive details. Private plans never become portfolio images without a new explicit clearance process.

Slugs are lowercase, hyphen separated, unique per content type and 3 to 100 characters. Keep prior published slugs as redirects; prohibit reserved paths and redirect loops. Sanitise rich text using an allowlist without executable scripts or arbitrary inline event handlers. No empty testimonial or accreditation sections should be filled using fictitious claims.

# 16 Logical data model and field dictionary

## 16 1 Entity relationships and persistence rules

One enquiry has multiple service details, request lines, attachments, activities, tasks, assessments and quotes. One quote has multiple revisions and access grants. One board product has multiple variants. One project has multiple category links and media links. Published content revisions and issued quote snapshots are immutable evidence. Staff identity links remain valid after deactivation.

IDs are opaque globally unique values; UUID is an acceptable contract representation. Use UTC timestamps, explicit timezone configuration, unique quote/reference numbers and optimistic record versions. Customer contacts are stored on each enquiry snapshot rather than automatically merged into an account. Later CRM contact linking requires a separate matching and privacy policy.

| Entity              | Essential fields and types                                                                      | Constraints                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| BusinessConfig      | key text, value typed, status enum, environment, version integer, effective_at timestamp        | Unique key per environment; audited updates                        |
| Service             | id, immutable code, slug, family, active boolean, form_schema_version                           | Code unique; archive instead of destructive deletion               |
| PageRevision        | page_id, revision, structured body, title, SEO metadata, status, actor                          | Published revision retained; allowlisted content                   |
| Project             | id, slug, ownership enum, location label, narrative, verified facts                             | OWNER_DEVELOPMENT, CLIENT_WORK or DEMO; media clearance            |
| MediaAsset          | id, object_key, checksum, type, size, visibility, scan state, rights, derivatives               | Object keys private; public views expose approved derivatives only |
| BoardProduct        | id, slug, title, type, brand nullable, description, state                                       | Product with one or more variants                                  |
| BoardVariant        | id, product_id, SKU, finish, thickness, length, width, unit, availability                       | Positive dimensions; SKU unique; explicit unit                     |
| HardwareItem        | id, category, specification, unit, pack_size nullable, state                                    | Pack size positive if unit PACK                                    |
| Enquiry             | id, reference, contacts, suburb, state, owner nullable, version, notice snapshot, created_at    | One owner; no public retrieval by reference                        |
| EnquiryService      | enquiry_id, service_code, details object, schema_version                                        | Unique service per enquiry; validate schema                        |
| RequestLine         | id, enquiry_id, type, variant/item ID nullable, specification snapshot, quantity, unit, options | Positive quantity; free text permitted if item unknown             |
| Attachment          | id, enquiry_id nullable, session_id, checksum, state, byte_size, expiry                         | Only session owner can associate; immutable validated bytes        |
| Assessment          | id, enquiry_id, employee, start/end, mode, state, findings                                      | End after start; conflict checks                                   |
| QuoteGroup          | id, enquiry_id, number, created_by                                                              | Quote number unique; separate from invoice                         |
| QuoteRevision       | id, group_id, revision, PDF ID, checksum, money, tax enum, expiry, terms, state                 | Unique group plus revision; issue freezes contents                 |
| Approval            | id, revision_id, actor, checksum, metadata digest, time                                         | Approval binds exact content; self-approval policy                 |
| CustomerAccessGrant | id, revision_id, token_hash, expires_at, revoked_at                                             | Random secret; narrowly scoped; raw token never retained           |
| ActivityTask        | id, enquiry_id, kind, actor/owner, due_at, completed_at, reason                                 | Audit contact events; task state separate from lead                |
| StaffGrant          | identity_id, role, team/record scope, privilege, active                                         | Server-enforced grants; deny by default                            |
| NotificationEvent   | event_id, aggregate_id, purpose, recipient reference, attempts, next_at, state                  | Unique semantic key; private payload access restricted             |
| IdempotencyRecord   | key_hash, request_digest, response, expiry                                                      | Unique key namespace; matching request replay only                 |
| AuditEvent          | id, actor, target, action, before/after summary, timestamp, correlation_id                      | Append-only permissions; redact secrets and sensitive text         |

## 16 2 Enumerations and versioning

Record enum values centrally in the API contract; labels may be translated or edited without changing values. Unrecognised enums return field errors rather than silently mapping to OTHER. Each service detail schema is versioned; historic data remains readable after new fields are introduced. Configuration and product snapshots record the originating version. Migrations must preserve issued quote and published-content history.

Useful indexes or equivalent access structures cover enquiry state, owner, team, creation date, follow-up due date, reference, quote number, catalogue filters, publication state and notification retry time. Apply uniqueness and relationship checks in the persistence layer and business rules, not just the UI. Delete operations obey the retention and legal-hold workflow described below.

# 17 API resource contracts

## 17 1 Common API conventions

SP 21. Use /api/v1 as the logical HTTP contract prefix. JSON field names use snake_case. IDs are opaque strings; timestamps use UTC ISO 8601; dates use YYYY-MM-DD; monetary amounts are exact decimal strings with currency. Requests and responses carry a correlation ID. For staff changes, GET returns an ETag or equivalent record version and the modifying request supplies If-Match. Missing required precondition returns 428; stale version returns 412 with a safe refresh instruction.

Use 201 for creation, 200 for reads and successful updates, 204 where no body is needed, 202 for durable queued work, 400 for malformed requests, 401 for unauthenticated staff, 403 for forbidden actions, 404 for unavailable or out-of-scope resources, 409 for state or idempotency conflict, 413 for oversize data, 422 for field validation, 429 for rate limits and 503 for unavailable dependencies where persistence cannot complete. Never return stack traces.

## 17 2 Public and customer resources

| Endpoint                            | Input                                                         | Output and guard                                                                         |
| ----------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| GET /public-config                  | None                                                          | Published labels, enabled services, limits and policy versions; exclude private settings |
| GET /services and /services/{slug}  | Optional family                                               | Active published content only                                                            |
| GET /projects and /projects/{slug}  | Category, cursor, page size                                   | Published records and approved image derivatives                                         |
| GET /catalogue                      | Type, finish, thickness, sheet size, cursor                   | Published board or hardware entries; no internal stock or cost fields                    |
| GET /catalogue/{slug}               | Slug                                                          | Product and enabled variants; unsupported variant unavailable                            |
| POST /upload-sessions               | File metadata and client request context                      | Expiring scoped capability and instructions; rate limits                                 |
| POST /upload-sessions/{id}/complete | Capability and uploaded-object reference                      | File IDs and scan states; no download access                                             |
| POST /enquiries                     | Common fields, service details, request lines, attachment IDs | 201 reference and next step; Idempotency-Key required                                    |
| POST /quote-access/exchange         | Secret token in body                                          | Scoped session; generic failure; no token logging                                        |
| GET /customer/quote                 | Scoped session                                                | One authorised revision's metadata and display state                                     |
| GET /customer/quote/document        | Scoped session                                                | Approved document stream; expiry and revocation checked                                  |

The base prefix applies to all endpoints above. Pagination returns items and next_cursor; filters are allowlisted. An expired anonymous session cannot associate files. No public endpoint lists enquiries, quotes, customer contacts or staff identities.

## 17 3 Staff resources

| Endpoint under /admin                    | Operation                        | Permission and behaviour                                          |
| ---------------------------------------- | -------------------------------- | ----------------------------------------------------------------- |
| /enquiries                               | GET list                         | Scoped filters, pagination and dashboard counts                   |
| /enquiries/{id}                          | GET and PATCH                    | View or edit grant; If-Match for edits; protected fields excluded |
| /enquiries/{id}/state                    | POST transition                  | State guards, evidence and actor audit                            |
| /enquiries/{id}/assignment               | POST assignment                  | Team permission; active owner and collaborators                   |
| /enquiries/{id}/activities and /tasks    | POST or PATCH                    | Structured activity; append contact evidence; scoped tasks        |
| /enquiries/{id}/assessments              | POST; dedicated assessment PATCH | Staff availability and private location                           |
| /enquiries/{id}/quote-revisions          | POST                             | Draft permission; file clean; metadata validation                 |
| /quote-revisions/{id}/submit-approval    | POST                             | Completeness and immutable review digest                          |
| /quote-revisions/{id}/approve            | POST                             | Approver privilege and self-approval policy                       |
| /quote-revisions/{id}/send               | POST                             | Issue privilege; idempotent durable dispatch                      |
| /quote-revisions/{id}/revoke             | POST                             | Reason and immediate access revocation                            |
| /attachments/{id}/download               | GET                              | Scoped access and CLEAN state; audited                            |
| /content/{type} and /content/{type}/{id} | List, create, edit               | Typed forms; content privileges and version check                 |
| /content/{type}/{id}/publish             | POST                             | Required fields, media clearance and publisher grant              |
| /users and /settings                     | Controlled management            | Administrator permissions; audited changes                        |
| /exports/enquiries                       | POST                             | Explicit export privilege, filters and record scope               |

Backend commands must reject privilege escalation attempts in body fields. Export never expands scope beyond the requesting user. Download routes do not accept arbitrary object keys from clients. Private previews have equivalent content permissions or single-purpose temporary grants.

## 17 4 Example request and response

The following fictional request exercises standalone full-sheet sales. No cutting list, installation selection or property details are required. In demo mode the address cannot receive live email.

{

"services": ["BOARD_SALES"],

"contact": {

"full_name": "Demo Board Customer",

"email": "customer@example.com",

"preferred_contact": "EMAIL"

},

"location": {"country_code": "ZA", "town_or_suburb": "Demo Suburb"},

"description": "Please quote for two example white melamine sheets.",

"service_details": {

"BOARD_SALES": {"collection_preference": "COLLECTION"}

},

"request_lines": [{

"variant_id": "demo-white-melamine-16-2440-1220",

"quantity": 2,

"unit": "SHEET",

"fulfilment": "FULL_SHEET"

}],

"attachment_ids": [],

"privacy_acknowledged": true,

"privacy_notice_version": "demo-privacy-v1",

"marketing_opt_in": false

}

{

"reference": "ENQ-2026-000123",

"result": "RECEIVED",

"next_step": "The boards team will review your request and contact you.",

"correlation_id": "demo-correlation-123"

}

The variant identifier is a fixture-only opaque ID. In live requests it must be a published server-issued ID. The server validates the current notice version; if it changed during form completion, return NOTICE_VERSION_CHANGED and require the visitor to review the updated notice while preserving fields. A client cannot choose an expired notice to avoid current disclosure.

# 18 Errors asynchronous delivery and operational events

SP 22. Errors return code, message, correlation_id and field_errors where relevant. Each field error has path, code and user_message. Example: request_lines[0].quantity, POSITIVE_INTEGER_REQUIRED, Enter a whole number greater than zero. Render errors next to controls and in a focusable summary. Do not expose private record details in an error response.

Define SERVICE_UNAVAILABLE, VARIANT_UNAVAILABLE, NOTICE_VERSION_CHANGED, ATTACHMENT_REJECTED, UPLOAD_EXPIRED, STATE_CONFLICT, APPROVAL_REQUIRED, VERSION_CONFLICT and RATE_LIMITED as stable domain codes. If a product becomes unavailable while a form is open, retain the customer description and offer removal or free-text review instead of silently substituting another board.

SP 23. Write notification events with the originating transaction. Events include ENQUIRY_RECEIVED, ENQUIRY_ASSIGNED, FOLLOWUP_DUE, ATTACHMENT_REJECTED, ASSESSMENT_CONFIRMED, QUOTE_ISSUED, QUOTE_DISPATCH_RECORDED, CONTENT_PUBLISHED and DATA_DELETION_COMPLETED. Processing is at least once; handlers and provider calls use deduplication keys. Do not claim unconditional exactly-once email delivery across external systems.

Retry transient failures after 1, 5, 15, 60 and 240 minutes as dummy defaults, then flag FAILED_REQUIRES_REVIEW. Permanent address failures stop retrying and create a staff task. Where the provider may have accepted a message before a timeout, record DELIVERY_UNKNOWN and reconcile using its idempotency or status facility before retrying blindly. Manual retry records actor and reason. The enquiry remains saved during delivery failure.

Acknowledgement is sent once per enquiry where email exists, regardless of the number of selected services. Staff alert emails contain a reference, service family and authenticated staff link, not full descriptions or customer files. Reminder delivery respects business hours; essential operational alerts can be immediate. Demo adapters render all messages in the test sink with the synthetic-recipient flag.

# 19 Security privacy audit and retention implementation

SP 24. Require encrypted transport, least-privilege access, secure session handling, MFA for staff, rate limiting, server validation and allowlisted content. Keep credentials and keys outside source control and client bundles. Protect cookie-authenticated mutations against CSRF and apply explicit allowed origins when cross-origin access is needed. Disable debug endpoints in production. Record access attempts without raw form text or secret values.

Suggested demo abuse thresholds are ten upload sessions and five enquiry submissions per ten minutes per risk bucket, with an additional global byte quota. Treat these as tunable rules and account for shared networks. Anti-bot measures must provide an accessible recovery path. Do not publicly disclose staff identity existence through password recovery errors.

SP 25. Record privacy notice version, acknowledgement timestamp, optional marketing consent text/version and withdrawal. Analytics are disabled in demo by default; optional tracking refusal must not prevent enquiries. Collect detailed addresses and plans only when needed. Do not store exact addresses in public content or analytics. Privacy policy and any jurisdiction-specific legal wording remain pending business review; no dummy wording is represented as a final legal policy.

Provide a staff-assisted rights workflow for access, correction and deletion. Verify requester identity using an approved method proportionate to the data; record scope, action and outcome. Apply legal holds before deletion. Customer exports include only that customer's authorised records and attachments. CSV exports neutralise leading formula characters and use safe quoting; export access is audited.

Retention tasks identify eligible records, check holds, remove private files and dependent personal data, and retain minimal lawful audit evidence. Orphan uploads and spam follow configurable policies. Closed unsuccessful enquiries use the proposed 12-month review point. Won-contract data requires a confirmed retention rule before automated deletion is enabled. Backup expiry and restore deletion replay must prevent erased data from reappearing indefinitely.

Production launch review confirms the country, actual privacy controller contact, processors, retention policy and professional service claims. Pending credentials remain unpublished. During development all of these decisions can use the labelled dummy settings and synthetic fixtures.

# 20 Search accessibility performance and reliability contracts

SP 26. Public content must be crawlable with unique title, description, canonical URL, sitemap and accurate structured metadata. Do not expose drafts, token quote pages or admin routes to indexing. Protect private resources through authorisation even when noindex is present. Demo and staging are globally nonindexable. Service-area pages use confirmed genuine coverage; dummy areas do not become real local SEO claims.

SP 27. Target the source's WCAG 2.2 Level AA requirement. Critical screens must work by keyboard, with meaningful focus, labelled fields, understandable errors, contrast, status announcements and appropriate touch targets. Verify dialogs, image navigation, menu, catalogue filters, wizard, upload progress, staff tables and quote access. Automated scans supplement manual keyboard, zoom and screen-reader checks.

SP 28. Preserve source performance targets: field LCP at most 2.5 seconds, INP at most 200 milliseconds and CLS at most 0.1 at the 75th percentile when sufficient visits exist. Before launch use a documented mobile lab profile and interaction checks. Key marketing pages target 1.5 MB initial transfer and approximately 250 KB compressed scripting where feasible. These are performance targets, not framework selection instructions.

At the agreed workload of 20 concurrent users, target metadata reads and enquiry persistence p95 below one second, excluding file transfer, scanning and external notification delivery. Use representative catalogue and enquiry fixtures, verify no lost submissions and record test environment assumptions. Load only required page data and defer below-fold media. Prevent staff exports from blocking public request handling.

SP 29. Source operational targets are 99.5 percent monthly availability, recovery point within 24 hours and recovery within eight business hours, subject to actual provider and operator readiness. Monitor page reachability, enquiry persistence, scan queue age, notification backlog, application errors and storage. Alert when submission checks fail twice consecutively, oldest notification waits over 15 minutes or scans wait over 30 minutes; these are configurable demo alert thresholds.

Backups include data, private objects and required configuration with separate access control. Rehearse a restore in a nonproduction environment before launch and quarterly thereafter. Restore checks must verify enquiry-to-file relationships and revoked quote access. Health checks must not expose credentials or private record counts publicly.

# 21 Synthetic fixtures and example scenarios

SP 30. Keep fixtures visibly synthetic, repeatable and isolated from live data. Seed IDs are stable enough for tests and do not resemble real customer records. Demo records do not contain real tenant photographs, addresses, phone numbers, company numbers or bank details.

| Fixture            | Fields and intent                                                                            | Expected path                                        |
| ------------------ | -------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Project DEMO-P01   | Older-home conversion concept, OWNER_DEVELOPMENT demo label, before/after placeholder stages | Project to property assessment enquiry               |
| Project DEMO-P02   | Additional-land unit concept with no verified unit capacity or returns                       | Constraints and enquiry explanation                  |
| Project DEMO-P03   | Kitchen and wardrobe example using placeholder photography                                   | Cabinetry supply-only or fix-and-supply enquiry      |
| Board DEMO-B01     | White melamine, 16 mm, 2440 by 1220 mm, SHEET, sourced on request                            | Two full sheets, no attachment                       |
| Board DEMO-B02     | Raw MDF, 18 mm, 2440 by 1220 mm, SHEET                                                       | Board request with optional processing               |
| Board DEMO-B03     | Plywood, 12 mm, 2440 by 1220 mm, SHEET                                                       | Unknown quantity or specification clarification      |
| Cabinetry DEMO-C01 | Wardrobe; FIX_AND_SUPPLY; measuring assistance requested                                     | Measurement verification and installation quote      |
| Cutting DEMO-L01   | Two parts with distinct IDs, grain and all four edge labels                                  | Attachment review and production sign-off boundary   |
| Enquiry DEMO-E01   | Email-only board customer at example.com, COLLECTION                                         | Saved once and one acknowledgement in sink           |
| Enquiry DEMO-E02   | Mixed property and cabinetry request                                                         | One Property coordinator and Cabinetry collaboration |
| Quote DEMO-Q01     | ZAR 2500.00, tax NOT_APPLICABLE, 14-day validity, DEMO PDF                                   | Separate approval then controlled issue              |
| Security DEMO-S01  | Rejected file, expired session, revoked token and out-of-scope reviewer                      | Denials with no private data leakage                 |

Demo quote amount is a fictitious workflow value, not a product price. Provide distinct test fixtures for scan outage, email timeout after acceptance, validation failure, stale staff edit and unavailable product. The cutting fixture must remain non-production-ready until explicit synthetic confirmation, so tests cannot inadvertently trigger manufacture.

# 22 Verification catalogue and requirement traceability

## 22 1 End to end and failure scenarios

| Test ID | Scenario                      | Pass condition                                                                                                   |
| ------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| T01     | Narrow-screen navigation      | At 320 CSS pixels, primary actions visible, no horizontal page overflow and menu usable by keyboard              |
| T02     | Standalone full-sheet request | Board selected, quantity entered, no construction or cutting required; enquiry reaches Boards Team               |
| T03     | Cut-to-size board supply      | Valid list or help request, dimension convention retained, private files linked to correct enquiry               |
| T04     | Fix-and-supply wardrobe       | Correct fulfilment and measuring need retained; exclusions visible; no inferred plumbing work                    |
| T05     | Mixed-service enquiry         | One reference, one owner, relevant details preserved and one acknowledgement event                               |
| T06     | Phone-only request            | No email required for valid phone preference; on-screen receipt; no failed-email task                            |
| T07     | Field and product errors      | Input preserved; error summary focus; unavailable variant never silently replaced                                |
| T08     | Duplicate retry               | Same key/body returns original reference; changed body with same key rejected                                    |
| T09     | File checks                   | Wrong signature, macros, oversize and forbidden types rejected; scan pending inaccessible                        |
| T10     | Late scan rejection           | Saved enquiry survives; rejected file cannot download; staff replacement task created                            |
| T11     | Unavailable coordinator       | Lead stays visible in unassigned queue; disabled user never assigned                                             |
| T12     | Business hours                | Monday and Sunday examples produce specified response deadlines; auto receipt does not stop clock                |
| T13     | Quote approval                | Changed PDF invalidates approval; self-approval blocked by demo policy; draft cannot issue                       |
| T14     | Quote revision and expiry     | Replacement draft does not supersede original; issued replacement does; expired/revoked grant denied             |
| T15     | Email ambiguity               | Timeout after possible acceptance produces DELIVERY_UNKNOWN; no blind duplicate dispatch                         |
| T16     | Permissions                   | Editor and out-of-scope reviewer cannot access leads/files through copied IDs or APIs                            |
| T17     | Concurrent staff edit         | Stale version rejected with 412; UI offers refresh without overwriting another edit                              |
| T18     | Content publication           | Draft private; published content refreshed within five minutes; demo-only image rejected for live publication    |
| T19     | Privacy and analytics         | No marketing preselection; tracking refusal leaves form usable; no PII sent to analytics                         |
| T20     | Accessibility                 | Manual keyboard, screen-reader and zoom review of critical flows; automated issues resolved                      |
| T21     | Performance                   | Documented load/mobile targets met or recorded exception accepted with remediation plan                          |
| T22     | Restore and deletion          | Restore reproduces records and files; deleted data handled through deletion replay; revoked access stays revoked |
| T23     | Dummy environment             | Calls/chat disabled; messages remain in sink; no public indexing or fictitious accreditation                     |

## 22 2 Mapping to the attached requirements

| Source requirements | Specification coverage                                          | Main verification       |
| ------------------- | --------------------------------------------------------------- | ----------------------- |
| FR 01 to 03         | SP 02 to 04; public P01 to P04; service qualification           | T01, T05, T07           |
| FR 04 to 05         | P05 to P06, SP 05, SP 19 to 20; comparison slider explicitly R2 | T01, T18, T20           |
| FR 06               | P07, SP 07; cabinetry fulfilment and scope                      | T04                     |
| FR 07               | P08 to P11, SP 08 to 09; standalone boards and catalogue        | T02 to T03, T07         |
| FR 08 to 09         | P12 to P14 and P18; resources R2                                | T01, T18                |
| FR 10 to 12         | SP 06 and common fields; multi-service forms                    | T05 to T07              |
| FR 13 to 14         | SP 09; launch attachments and R2 editor boundary                | T03, T09 to T10         |
| FR 15 to 16         | SP 10 to 11; upload lifecycle and idempotency                   | T08 to T10              |
| FR 17 to 18         | SP 12 to 14; assignment, tasks and state transitions            | T11 to T12, T17         |
| FR 19 to 20         | SP 15 to 17; PDF workflow and R2 acceptance/generation          | T13 to T15              |
| FR 21 to 22         | SP 19 to 20; editorial and media management                     | T18                     |
| FR 23 to 24         | SP 18, SP 24 to 25; access, audit and exports                   | T16 to T17, T19         |
| FR 25               | SP 05, SP 27; responsive design contracts                       | T01, T20                |
| NFR 01 to 03        | SP 10, SP 17 to 18, SP 24 to 25                                 | T09, T14, T16, T19, T23 |
| NFR 04 to 06        | SP 26 to 28                                                     | T18, T20 to T21         |
| NFR 07 to 08        | SP 23, SP 29; operational evidence                              | T15, T21 to T22         |

All launch requirements retain their source priority. Implementation details added here, including dummy timers, route contracts and guards, are proposed baseline decisions that can be revised through change control without silently removing the source outcomes.

# 23 Implementation sequence and completion criteria

Build incrementally with reviewable vertical slices. First establish the taxonomy, dummy register, private/public data separation and permission model. Then build public pages and content publication. Add the standalone board catalogue and a working board-only request from product selection to staff inbox. Extend the wizard to cabinetry, property and mixed enquiries. Add private uploads and durable notifications, then staff tasks and assessments, then quotation approval and customer viewing. Finish with privacy operations, performance, accessibility, recovery and staff documentation.

Each slice must include its validation, error handling, permission checks and relevant acceptance scenarios. Do not defer all security and failure behaviour to the end. Keep later-release features disabled or absent. Use Architecture version 1.0 for the selected technology baseline; review the source and specification together before changing scope.

Development completion requires working dummy-driven preview, implemented R1 contracts, traceable tests, controlled notifications, synthetic content labels and documented configuration replacement. Live readiness additionally requires approved real trading details, service range, board specifications, actual imagery permissions, contacts, professional claims, quote terms, privacy policy and named operators. This does not delay authorised development with placeholders.

# 24 Handover source record and change control

Deliver source code, setup instructions, chosen implementation decisions, data schema, migrations, API contract, configuration dictionary, permission matrix, seed-fixture instructions, test evidence, deployment and rollback guide, recovery guide, staff handbook and account ownership register. Credentials are handed over through a secure process. Document how to replace demo values and how to prove that notifications, contacts and content use live configuration only after readiness approval.

For changes, record change ID, affected source FR/NFR and SP rules, reason, release, data migration impact, security implications, accepted outcome and tests. A changed board range should normally update catalogue/configuration; a changed workflow or commercial model may require schema and API revision. Issued quote history must not be edited to match new policies.

Baseline source is the user-supplied Property Transformation Website Requirements version 1.2. The original functional contracts introduce no new external legal determinations. Sections 25 to 27 adopt the user-requested technology decisions; Architecture version 1.0 supplies official platform sources and provider recommendations. Its accessibility, privacy, security and performance outcomes derive from that approved requirements baseline. Pending business details use the explicit dummy register at the user's direction and can be refined as the business confirms them.

# 25 Selected implementation baseline

Specification version 1.1 implements Requirements version 1.2 and Architecture version 1.0. SP 01 to SP 30 and existing R1/R2/R3 boundaries remain valid. SP 31 to SP 38 below make the previously neutral implementation choices concrete. Architecture requirements supplement existing behaviour; they do not approve dummy business values or automatically activate deferred payments.

SP 31. Implement apps/public-web and apps/staff-web in Angular, backend as a Spring Boot Maven project, and PostgreSQL with Flyway. Keep generated OpenAPI TypeScript clients, shared UI tokens, infrastructure and operations documents in one private GitHub monorepo. Use supported GA versions pinned in the repository, not floating latest tags. Backend modules own content, catalogue, enquiries, assessments, quotations, media, identity, communications, payments and operations. Controllers must not expose persistence entities; permission and state guards run in application services. Prevent cross-module repository access and cycles with architecture tests.

SP 32. Public service, project and catalogue routes use SSR with hydration and a default 60-second public cache. Prerendering is permitted only when publication can refresh within five minutes. Content publication invalidates public API and renderer caches. Private quote, submission and staff routes use client rendering and no-store responses where private. Do not cache personalised responses, identity headers or quote token exchanges. Split staff and public bundles; lazy-load large galleries and staff features. Mobile implementation later shares DTOs and API utilities, with its own Ionic/Capacitor build and native navigation.

SP 33. Federated staff authenticate using OIDC Authorization Code with PKCE, state and nonce. The API verifies JWT signature, issuer, expiry, not-before, access-token type, scope and audience or provider client binding. Cognito validation includes token_use and client_id according to the selected token contract. A valid ID token is not an API access token. Tokens remain in browser memory; no localStorage token persistence. StaffIdentity uses unique issuer plus subject and stores display label, active state and grants without passwords. Automatic federation sign-in grants no role.

Implement POST /api/v1/admin/session after validated authentication, GET /api/v1/admin/session for state and DELETE /api/v1/admin/session for logout. The API returns a random session handle bound to the token's identity and client. Private calls require valid access token plus X-Staff-Session. The handle is not sufficient authentication. Enforce the existing 30-minute idle and eight-hour absolute limit through this revocable server registry. Noninteractive polling does not refresh idle activity; deactivation, logout and expiry deny the next request. A new session after expiry requires an interactive sign-in path. POST session verifies signed authentication time (demo maximum age five minutes), the last revocation boundary and the eight-hour window anchored to that authentication; an old or merely refreshed token cannot reset the expired window. Test repeated session creation and provider reauthentication explicitly. Keep a 10-minute access-token lifetime as a demo target and reauthenticate or renew through the identity provider session without persistent browser refresh tokens. Enforce and verify provider MFA for every admitted federation path.

Screen A10 becomes Staff access management: provision approved external subjects, activate/deactivate identities, manage grants, teams and scope, and review audit events. It does not create provider passwords or customer accounts. A01 sign-in uses the provider redirect; recovery is through the provider, with documented MFA-protected bootstrap/recovery access. The existing permission matrix still applies. Identity-provider authentication and business authorisation remain separate checks on each private request.

SP 34. Use restricted S3 presigned POST uploads for one generated temporary key, exact origin, bounded size and permitted type. Proposed credential lifetime is five minutes within the 60-minute upload session; renew only after quota checks. Completion pins object version and checksum, verifies bytes and copies to a write-protected scanning location. Scan and publish only that pinned version. Reuse of an unexpired upload capability cannot alter an attachment already marked CLEAN. ClamAV and structural validation fail closed into quarantine; signature updates and scan backlog are monitored.

Separate quarantine, private clean storage, approved public derivatives and backups by bucket/policy and environment. CloudFront Origin Access Control reads only approved public derivatives. Generate safe responsive images and strip sensitive metadata. Customer quote PDFs use API-proxied delivery for immediate revocation. Staff signed file links use the existing five-minute limit after permission checks. Customer attachment types and MiB limits remain unchanged. Staff-only reviewed video support uses configurable demo 100 MiB/two-minute limits with poster and captions; customer video uploads are not introduced.

SP 35. Use PostgreSQL transactions for enquiry/idempotency/outbox creation. Matching idempotency replay returns the original committed response before current catalogue or notice changes are revalidated. New requests validate current rules. Workers claim bounded database leases with SKIP LOCKED, release database transactions before provider calls, recover expired leases and deduplicate jobs. Persist provider reference and DELIVERY_UNKNOWN where acceptance may have occurred. Do not hold row locks throughout scanning or delivery. Scheduler jobs use unique keys or locking so multiple ECS workers cannot duplicate reminders.

SES is the R1 email adapter, with verified domain, production access, authenticated delivery-event processing and bounce/complaint suppression. Twilio SMS/WhatsApp adapters implement later activation with current sender/template/consent rules, verified callback signatures, event deduplication and spend controls. Demo providers deliver only to a test sink. PaymentGateway defines createHostedPayment, verifyNotification, fetchStatus and refund; Payfast is provisional and payment_enabled=false. Live payment needs accepted quote and contract milestone, frozen server amount/currency, verified provider callback, unique event/transaction references, receipt linkage, reconciliation and explicit refund grants. A redirect never proves payment; partial deposits do not clear the whole contract. R3 routes and models remain disabled in R1.

SP 36. Emit structured redacted logs with safe route, status, duration, service, environment, release digest, correlation_id and trace_id. Actuator/Micrometer metrics and Micrometer/OpenTelemetry tracing export through a collector to a selected compatible backend. Do not double-instrument requests. Trace background work by safe links to originating context. Start with configurable 10 percent production sampling and full controlled-test sampling; all-request error metrics and unsampled audit remain available. Restrict Actuator management ports and dashboards. Logs/traces/metrics initially retain 14/7/30 days as demo settings independent of approved business audit retention.

SP 37. Deploy immutable nginx, public SSR, API, worker, PostgreSQL, scanner and telemetry services using Compose on Contabo. Keep database and management ports private; restrict SSH and secrets; use bounded resources and persistent database volumes. Back up daily off-host with encryption and age alerts; rehearse restore before launch and quarterly. Record the existing single-VPS availability limitation. Later ECS Fargate services reuse images, with ALB, RDS PostgreSQL, task roles, Secrets Manager, ECR, S3 and CloudWatch. Bound connection pools as task counts grow; optional SQS keeps the transaction outbox and idempotent consumers.

SP 38. GitFlow uses main, develop, feature/_, release/_ and hotfix/\*. CI verifies code, migrations, contracts, access rules, uploads and browser journeys. Release manifests bind a tested tree to immutable image digests and schema version; production promotes that manifest after protected merge/tag and an available approval/operator gate. Use short-lived AWS OIDC deployment credentials and a restricted Contabo deploy identity. Migration jobs run once with separate privileges. Expand-and-contract schemas enable safe application rollback; restoring an older database is not routine deployment rollback. AWS cutover drains old workers and freezes writes before final synchronisation; DNS rollback after new writes requires data reconciliation.

# 26 Architecture configuration extensions

| Key                             | Development default                     | Rule                                                      |
| ------------------------------- | --------------------------------------- | --------------------------------------------------------- |
| oidc_issuer and client          | Synthetic development provider          | Production uses confirmed staff federation and MFA        |
| staff_access_token_minutes      | 10                                      | Verify supported provider lifetime and renewal behaviour  |
| public_cache_seconds            | 60                                      | Publication remains visible within five minutes           |
| api_pool and worker_pool        | 10 and 4                                | Total fits tested PostgreSQL connection budget            |
| presigned_upload_minutes        | 5                                       | Exact key and conditions; pin uploaded version            |
| automated_whatsapp_enabled      | false                                   | Activate only with confirmed channel capability           |
| sms_enabled and payment_enabled | false                                   | No real sends, charges or checkout at R1                  |
| public_video_limit              | 100 MiB and 2 minutes                   | Staff-only editorial demo limit, no public-upload change  |
| trace_sample_ratio              | 0.10                                    | Errors still counted globally; audit not sampled          |
| logs traces metrics retention   | 14 7 30 days                            | Demo operational values; approved policy replaces them    |
| vps_region and aws_region       | Unselected                              | Measure actual audience latency and regional availability |
| telemetry_backend               | Local reference stack or test collector | Production placement selected after resource testing      |

Settings are typed, environment-specific, versioned and marked DEMO/PENDING/CONFIRMED as in SP 01. Secrets never belong to public-config, synthetic fixtures or this register's values. Provider activation requires a distinct environment flag and approved account configuration. Infrastructure defaults must not become promises of capacity or availability.

# 27 Additional verification and traceability

| Added requirement                 | Specification and architecture mapping | Verification                                                  |
| --------------------------------- | -------------------------------------- | ------------------------------------------------------------- |
| FR 26 selected stack and monorepo | SP 31 to 32; AR 01 to 05 and 16        | AAT 01 and 12; build and module-boundary checks               |
| FR 27 federated staff             | SP 33; AR 07 and 17                    | AAT 03 and 04; wrong token and next-request revocation        |
| FR 28 communications              | SP 35; AR 08 and 10                    | AAT 02 and 07; outage, forged callback and duplicate delivery |
| FR 29 later payment               | SP 35; AR 10 and 17                    | AAT 11 only when the later module is enabled                  |
| NFR 09 observability              | SP 36; AR 09                           | AAT 07; redaction and request-to-worker correlation           |
| NFR 10 hosting and storage        | SP 34 and 37; AR 06 11 12 15           | AAT 05 06 08 and 10                                           |
| NFR 11 release and migration      | SP 38; AR 13 14 and 18                 | AAT 09; cutover and rollback rehearsal                        |

Run the existing T01 to T23 catalogue as well as these tests. Add explicit scenarios for staff timeout under polling, revoked JWT-backed session, first-login federation without grants, S3 overwrite after scan, provider callback replay, publication cache refresh, worker crash after acceptance, migration with concurrent submissions and error-log secret leakage. Recover the database and S3 relationships in an isolated environment and verify the target RPO/RTO using evidence, not configuration alone.

The canonical JSON request shape keeps contact and location fields nested as in section 17's example; the common-field table identifies semantic fields rather than implying a flat payload. Add versioned OpenAPI definitions before implementation. Provider-specific webhook routes require signature validation, not customer JWT authentication. Anonymous upload capabilities and customer quote sessions remain distinct from staff JWT/session credentials.

Handover now includes architecture version 1.0, AR decisions, supported-version and release manifests, container build definitions, Compose and AWS Terraform, metrics/trace dashboards, provider test fixtures, staff federation operations and migration runbooks. Original source requirements, dummy-register rules and all unchanged SP behaviours are preserved. Technical baseline changes are recorded here at the user's request rather than inferred business approval.
