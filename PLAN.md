# Plan: Section 63 BSA Certificate Generator (Web + Mobile)

## Context
Lawyers in India must file a certificate under **Section 63(4) of the Bharatiya Sakshya Adhiniyam 2023** every time they submit an electronic record (a printout or copy) as evidence. The form for it is given in the Schedule to the Act. Section 63 replaced s.65B of the Evidence Act on 1 Jul 2024. The certificate must use the **Schedule format**, which needs the record's **hash value and algorithm** and an enclosed **hash report**. Files are confidential, so hashing runs **on the user's device** and files are never uploaded.

Goal: build a website and mobile app from scratch, including the domain.
- **Phase 1:** hash generator and hash report.
- **Phase 2:** full Part A/Part B certificate PDF.

## Legal requirements: official source
**Primary source:** *The Bharatiya Sakshya Adhiniyam, 2023 (No. 47 of 2023)*, Gazette of India Extraordinary, 25 Dec 2023.
- Section 63 is on p.23–24.
- **THE SCHEDULE [See section 63(4)(c)]** is on p.46–47.
- The text below was extracted from the Gazette PDF.
- Keep a copy from egazette.gov.in or India Code in the repo as `docs/legal/bsa-2023-gazette.pdf`.

**Section 63, summarised from the Gazette:**
- **63(1)** Computer output (a printout, or a copy on optical, magnetic or semiconductor media) is deemed a document. It is admissible without producing the original if the conditions below are met.
- **63(2)** The conditions:
  - (a) the output was produced while the device was regularly used by the person in lawful control of it;
  - (b) information was regularly fed in during the ordinary course of activity;
  - (c) the device was operating properly, or any malfunction did not affect the record;
  - (d) the information reproduces, or is derived from, what was fed in.
- **63(3)** Several devices used for the activity count as a single device. This covers standalone devices, computer systems, networks, computer resources and intermediaries.
- **63(4)** The certificate must be "submitted along with the electronic record **at each instance** where it is being submitted for admission". It must:
  - (a) identify the record and describe how it was produced;
  - (b) give particulars of the device;
  - (c) deal with the 63(2) conditions.

  It must be **signed by a person in charge of the computer/communication device or the management of the relevant activities, AND by an expert**. Matters may be stated "to the best of the knowledge and belief" of the signer, "in the certificate specified in the Schedule".
- **s.39(2) + Explanation:** an **Examiner of Electronic Evidence under s.79A IT Act 2000** counts as an expert. This is the default qualification for whoever signs Part B.

**THE SCHEDULE, Part A "(To be filled by the Party)", verbatim. This becomes `certificate/template.ts`:**
```
I, ____ (Name), Son/daughter/spouse of ____ residing/employed at ____ do hereby solemnly affirm and
sincerely state and submit as follows:—
I have produced electronic record/output of the digital record taken from the following
device/digital record source (tick mark):—
☐ Computer / Storage Media  ☐ DVR  ☐ Mobile  ☐ Flash Drive  ☐ CD/DVD  ☐ Server  ☐ Cloud  ☐ Other
Other: ____
Make & Model: ____ Color: ____
Serial Number: ____
IMEI/UIN/UID/MAC/Cloud ID ____ (as applicable)
and any other relevant information, if any, about the device/digital record ____ (specify).
The digital device or the digital record source was under the lawful control for regularly creating, storing
or processing information for the purposes of carrying out regular activities and during this period, the
computer or the communication device was working properly and the relevant information was regularly fed
into the computer during the ordinary course of business. If the computer/digital device at any point of
time was not working properly or out of operation, then it has not affected the electronic/digital record
or its accuracy. The digital device or the source of the digital record is:—
☐ Owned  ☐ Maintained  ☐ Managed  ☐ Operated   by me (select as applicable).
I state that the HASH value/s of the electronic/digital record/s is ____, obtained through the following algorithm:—
☐ SHA1:  ☐ SHA256:  ☐ MD5:  ☐ Other ____ (Legally acceptable standard)
(Hash report to be enclosed with the certificate)
                                                        (Name and signature)
Date (DD/MM/YYYY): ____
Time (IST): ____ hours (In 24 hours format)
Place: ____
```
**Part B "(To be filled by the Expert)"** is the same as Part A except:
- It opens with "The produced electronic record/output of the digital record are obtained from the following device/digital record source (tick mark):—".
- It has **no** lawful-control paragraph and **no** Owned/Maintained/Managed/Operated ticks.
- The signature line reads **"(Name, designation and signature)"**.

**Rules the app enforces, from the official text:**
- **Fixed wording:** users fill in blanks and tick boxes only. They cannot edit the statutory text, which keeps the certificate in "the certificate specified in the Schedule".
- **Multiple ticks allowed:** device type and Owned/Maintained/Managed/Operated both accept several selections, because the form says "select as applicable".
- **"Other" needs text:** choosing "Other" for device type or algorithm requires the user to type a value.
- **Several files per certificate:** the form says "HASH value/s" and "record/s", so one certificate can list several files, each with its own hash, shown as a list or table under the hash line.
- **Date and time:** date is `DD/MM/YYYY`. Time is IST in 24-hour format, written `HH:mm hours`.
- **Hash report:** always generated and attached, because the Schedule requires it.
- **New certificate per filing:** s.63(4) requires one "at each instance", so the wizard can duplicate a certificate for a new filing.
- **Expert's part:** Part B is signed by an expert. The app prints Part B with blanks or fills it from data the expert supplies, and never acts as the expert.

**Case law and practice (secondary sources, not the Gazette):**
- Hash the exact file being produced, and record its source device separately.
- The Part A and Part B hashes must match.
- Default to SHA-256. Compute MD5 and SHA-1 as well if the user asks.
- *Arjun Panditrao Khotkar* (2020): the certificate is a condition precedent for admitting the record.
- *Pune Bar Assn v. UoI* (May 2026): besides notified Examiners under s.79A IT Act, a person with proven cyber-forensics skill may sign Part B.
- The app **does not sign as expert**. It prepares the documents, and signatures are done by hand or with a digital signature certificate (DSC).

### Secondary reference: Chat2Evidence (`~/Desktop/Chat2Evidence _ … .pdf`)
This is an existing third-party product and is **not authoritative**. We follow the official Schedule above and use their PDF only as a reference for how to package the document around the official form. Their product handles WhatsApp chats only, runs on the device, and charges ₹999 per document.

Their layout:
1. **Cover page** titled "Electronic Evidence Record". It shows:
   - court name, case title and case number;
   - a document ID (`<PREFIX>-YYYYMMDD-XXXXXXXX`);
   - file name, size, type and export method;
   - device make, model, color, serial number and IMEI, plus OS;
   - time zone (IST), date of generation and engine version ("client-side");
   - the **SHA-256 of the original file** in groups of 4 characters, with a note that any change to the file would change the hash.
2. **Part A:** declarant's name, parent, age and address; a table of device particulars; relationship to the device; the hash; then name, address, signature, date and time (24-hour) and place.
3. **Part B:** a blank form for the expert. Its wording matches the Schedule: device ticks, device details, hash, algorithm ticks and "(Hash report… enclosed)". It adds organization/lab, registration number and a seal box.
4. **Annexure A:** the record itself, as a table of chat messages. Every page footer shows the document ID, "Section 63 BSA" and "Page X of Y".

Where we will do better:
- They accept one file type only. We accept any file, offer several algorithms, and attach a hash report.
- Our hash generator is free.

Optional later module: turn a WhatsApp export (`.txt`/`.zip`) into an Annexure table of messages, matching their main feature.

Where they depart from the official form, which we will not copy:
- Their Part A replaces the Schedule declaration with six paraphrased numbered points.
- Their Part A drops the device-type ticks, the Owned/Maintained/Managed/Operated ticks and the "Time (IST)" line.
- Their Part B adds Organization/Lab, Registration No. and Seal. We may add these **after** the Schedule text as an optional block, clearly outside the official form.

> Before release: a practising advocate reviews a generated PDF against the Gazette Schedule.

## Tech stack (one codebase for web, Android and iOS, no backend)
| Concern | Choice | Why |
|---|---|---|
| App | **Vite + React + TypeScript** | Fast builds, simple to maintain, static output |
| UI | Tailwind CSS + shadcn/ui | Quick to build, accessible, mobile-first |
| Hashing | **hash-wasm** in a **Web Worker** (background thread), reading the file in 8 MB pieces via `File.slice()` | Handles multi-GB videos without running out of memory, and supports SHA-256, SHA-1 and MD5. The browser's built-in hashing (WebCrypto) has no MD5 and needs the whole file in memory |
| Forms | react-hook-form + zod | Typed validation, e.g. IMEI is 15 digits, MAC address format |
| PDF | **pdf-lib** + @pdf-lib/fontkit (Noto Sans / Noto Sans Devanagari) | Builds the PDF on the device, so data stays local and Hindi is possible later |
| Local storage | IndexedDB via `idb-keyval` | Saves drafts and party/expert profiles on the device only |
| Offline | vite-plugin-pwa | The site is installable and works offline, which also shows that nothing is uploaded |
| Mobile | **Installable website (PWA) first**, then **Capacitor** for Play Store / App Store | Same code. Capacitor's Filesystem and Share plugins save and share the PDF |
| Tests | Vitest for unit tests, Playwright for end-to-end tests incl. mobile screen sizes | |
| Hosting | **Cloudflare Pages** | Free, global CDN with Indian edge locations, automatic HTTPS, and a static site needs no server |
| CI | GitHub Actions runs lint, tests and build. Cloudflare deploys from `main` and gives each PR a preview URL | |

A strict Content Security Policy (`connect-src 'self'`) stops the page from sending file data anywhere. No analytics SDKs that read page content.

## Phase 0: Foundation (about 1 day)
1. **Domain:** pick a name, e.g. `bsa63.in` or `sakshyacert.in`. Register the `.in` domain with a registrar accredited by NIXI (the .in registry), such as GoDaddy, BigRock or Namecheap, for about ₹500–900 a year. Turn on WHOIS privacy and auto-renew.
2. **DNS:** add the domain to a free Cloudflare account and point the registrar's nameservers to Cloudflare.
3. **Repo:** create a GitHub repo and set up the project with `npm create vite@latest` (react-ts template), Tailwind, ESLint/Prettier and Vitest.
4. **Hosting:** connect the repo to Cloudflare Pages with build command `npm run build` and output folder `dist`. Add the custom domain and `www`. HTTPS is automatic.
5. **Security headers** in `public/_headers`: CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`.
6. **Legal pages:**
   - a privacy policy written for the DPDP Act 2023, stating that no files or data leave the device;
   - terms of use;
   - a disclaimer that the app is not legal advice.

## Phase 1: Hash generator (about 1–1.5 weeks)
```
src/
  workers/hash.worker.ts     # streaming hash: chunks -> hash-wasm (sha256, sha1, md5 in parallel)
  lib/hashFile.ts            # wraps worker: progress events, cancel
  lib/hashReport.ts          # builds the hash report PDF (pdf-lib)
  lib/time.ts                # IST formatting: DD/MM/YYYY, HH:mm 24h
  components/FileDrop.tsx    # multi-file picker + drag-drop (mobile: native picker)
  components/HashResult.tsx  # table + copy buttons
  pages/HashPage.tsx
```
Features:
- **File picking:** pick or drag in several files of any type or size. The picker doesn't force the camera, so mobile shows the full file picker.
- **Algorithms:** SHA-256 is on by default, and MD5 and SHA-1 are optional. All selected algorithms are computed in one read of the file, with a progress bar and a cancel button.
- **Results:** file name, size in bytes, file type, last-modified time, each hash in lowercase hex, and when it was computed (IST). Every value has a copy button.
- **Hash report PDF** (the enclosure the Schedule asks for): a table of files, the algorithms, date and time in IST, tool name, version and URL, the device/browser details, and a space for a signature. Also exportable as CSV or JSON.
- **Verify mode:** paste an expected hash, re-hash the file, and see ✅ or ❌ for a match.
- **Banner:** "Files are processed on your device and never uploaded."

## Phase 2: Full certificate (about 2 weeks)
```
src/
  certificate/schema.ts      # zod schema for Part A / Part B fields (mirrors Schedule exactly)
  certificate/template.ts    # Schedule text constants (verbatim, single source of truth)
  certificate/renderPdf.ts   # pdf-lib renderer: checkboxes ☑/☐, filled blanks, page numbering
  pages/CertificateWizard.tsx
```
The certificate is built in a step-by-step wizard:
1. **Case details** (optional header): court, case number, parties, exhibit number.
2. **Hash the files** using the Phase 1 hasher, or import a saved hash report (JSON).
3. **Part A:**
   - declarant details;
   - device-type ticks;
   - make, model, color, serial number, IMEI etc.;
   - Owned/Maintained/Managed/Operated ticks;
   - place, with date and time defaulting to now in IST.
4. **Part B:** fill it in now, or create a **shareable Part B file or QR code**. A separate expert imports it, re-hashes the file on their own device, and the app confirms the hashes match before producing their part.
5. **Preview and download** one combined PDF:
   - order: cover page → Part A → Part B → Annexure (hash report);
   - every footer shows the document ID and "Page X of Y";
   - signature blocks are left for signing by hand;
   - on mobile, the PDF goes to the share sheet.
6. **Saved profiles:** store reusable details (the lawyer's own, regular experts) in IndexedDB.

Optional later: Hindi template; DSC/Aadhaar e-sign (needs a backend and an e-sign service provider); batch certificates.

## Phase 3: Mobile apps (about 1 week)
- Add Capacitor (`@capacitor/android`, `@capacitor/ios`) and connect the Filesystem and Share plugins for saving the PDF.
- Test hashing speed on a low-end Android phone with a 2 GB video. If it's too slow, add a native hashing plugin later; it isn't needed at first.
- Publish to the Play Store ($25, about ₹2,000, one-time account fee) and the App Store ($99 a year; needs a Mac with Xcode). On the data-safety form, declare "No data collected."

## Verification
- **Hash correctness:**
  - unit tests against the standard published test values (`""`, `"abc"`, and one million 'a' characters) for SHA-256, SHA-1 and MD5;
  - compare with `shasum -a 256 <file>` and `md5 <file>` on sample files, including one over 2 GB to prove reading in pieces is correct.
- **Privacy:**
  - an automated test confirms there are no network requests while a file is hashed;
  - check the security policy is enforced;
  - confirm the app works with the network off.
- **PDF:**
  - a unit test extracts the text from the generated PDF (via `pdftotext`) and checks that every official sentence of the Gazette Schedule is present word for word, so it fails if the wording drifts;
  - a lawyer reviews a sample certificate.
- **End-to-end:**
  - an automated run of hash → wizard → PDF in desktop Chrome, Safari and mobile screen sizes;
  - a manual check on a real Android phone and iPhone.
- **Deploy:** the PR preview URL works, the production domain serves HTTPS, and securityheaders.com gives grade A.

## Cost summary
Domain ~₹800/yr · Cloudflare Pages ₹0 · GitHub ₹0 · Play Store ~₹2,000 once · Apple $99/yr.
