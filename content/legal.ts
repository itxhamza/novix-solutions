/**
 * Privacy policy and terms.
 *
 * Both are written against what the site actually does: there is no analytics,
 * no cookie and no browser storage, and the contact form is the only thing
 * that collects anything — it writes to Firestore and sends an email. Change
 * the site's behaviour and these need changing with it.
 *
 * A page with an empty `body` says plainly that the document is not published
 * yet, stays out of the sitemap and is noindex, rather than showing invented
 * boilerplate. `governingLaw` is the one field only Novix can fill; its
 * section is hidden until it has a value.
 *
 * Paragraphs are separated by a blank line. A line that starts with "## " is a
 * heading.
 */
export const legal = {
  privacy: {
    title: "Privacy policy",
    /** e.g. "16 November 2026". Hidden while empty. */
    updated: "16 November 2026",
    body: `Novix Solutions runs novixsolutions.com. This policy explains what happens to your information when you use the site or get in touch. It is short, because the site does very little with it.

## What the site collects

There is no analytics on this site, no tracking pixels, no advertising tags, and no cookies. Nothing is written to your browser's storage. Nothing here follows you between visits, or between sites.

The only information you hand over is what you type into the contact form: your name, your email address and your message. There is no account to create, and nothing else is asked for.

## What we do with it

A submitted form does two things. It is saved to our database, which runs on Google Firebase, and it is emailed to us at info@novixsolutions.com through Resend, the service that delivers our mail. Both happen so that an enquiry is not lost if one of them fails. We use what you sent to reply to you, and to carry out any work that follows.

While a form is being submitted your IP address is held in memory for a few minutes, so that one sender cannot flood the form. It is not written to a database and it does not survive a restart.

## Who else is involved

Vercel hosts the site. Like any web host, its servers log requests, and those logs include IP addresses, for security and reliability.

Google Firebase stores the enquiries sent through the contact form, on Google's infrastructure and on our behalf.

Resend delivers the email from the contact form.

Calendly runs our booking page. If you book a call you leave this site, and what you enter there is covered by Calendly's own privacy policy.

Links to the App Store, Google Play and our social profiles take you to services that have their own policies.

Our fonts are served from this domain, so opening a page does not call out to a font provider.

## How long we keep it

We keep enquiries, in the database and in our inbox, for as long as there is a reason to: to answer you, and to keep a record of what was discussed, quoted or agreed. Ask us to delete your enquiry and we will remove it from both, unless we are required to keep it.

## Your choices

Write to info@novixsolutions.com to ask what we hold about you, to have it corrected, or to have it deleted. Depending on where you live you may also have the right to object to how we use it, or to complain to a data protection authority.

## Children

This site is aimed at businesses. It is not intended for children.

## Changes

If this policy changes, the date at the top of this page changes with it.

## Contact

Questions about this policy go to info@novixsolutions.com.`,
  },

  terms: {
    title: "Terms and conditions",
    /** e.g. "16 November 2026". Hidden while empty. */
    updated: "16 November 2026",
    /**
     * Confirmed by Novix with their lawyer. The section is hidden while empty,
     * so this is the only place the jurisdiction is stated.
     */
    governingLaw: "the laws of Pakistan",
    body: `These terms cover your use of novixsolutions.com.

They do not cover work we do for clients. That is governed by the written agreement and scope we sign with you, and where anything here conflicts with that agreement, the agreement wins.

## Using the site

You are welcome to read the site, link to it, and get in touch. Please do not try to break it, scrape it at a volume that degrades it for other people, or use the contact form to send unlawful or abusive material.

## What is on the site

The site describes what we do and shows work we have built. Nothing on it is an offer, a quote, or a commitment to take on a project. Scope, timeline and price are agreed in writing before any work starts.

We try to keep the site accurate and current. We do not promise that it is free of errors, or that it will always be available.

## Our work, and other people's

The design, code, words and images on this site are ours, with one exception: client product names, logos and screenshots belong to their owners and appear here to describe work we did. Please do not reuse any of it without asking.

Who owns the work we build for a client is set by that client's agreement with us, not by this page.

## Links out

The site links to the App Store, Google Play, our clients' products, our booking page and our social profiles. We do not control those services and we are not responsible for them.

## Liability

To the extent the law allows, we are not liable for loss arising out of your use of this site, including lost profit, lost data, or any indirect or consequential loss. Nothing here limits liability that cannot lawfully be limited.

## Changes

We may update these terms. The date at the top of this page shows when they last changed.

## Contact

Questions about these terms go to info@novixsolutions.com.`,
  },
} as const;

export type LegalDoc = {
  title: string;
  updated: string;
  body: string;
  governingLaw?: string;
};
