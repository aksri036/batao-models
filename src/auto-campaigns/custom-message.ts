import { Timestamp } from "../timestamp";

// A seller's own wording for one auto campaign (plan entry). Each submit is a
// new MARKETING template on the store's WABA (approved templates can't be
// edited), with the same image header and buttons as Batao's default. The
// campaign uses it only once WhatsApp approves it; until then, or if it's
// rejected, `onReject` decides: Batao's default message, or don't send.

// Placeholders a seller can use, written as {name} etc. in the text.
export const CUSTOM_MESSAGE_PLACEHOLDERS = [
  "name",
  "store",
  "festival",
  "offer",
  "validTill",
] as const;
export type CustomMessagePlaceholder = (typeof CUSTOM_MESSAGE_PLACEHOLDERS)[number];

// Placeholders that need the campaign to carry an offer.
export const OFFER_PLACEHOLDERS: CustomMessagePlaceholder[] = ["offer", "validTill"];

// Template doc ids (stores/{id}/wa-automsg-templates/{key}) start with this.
export const CUSTOM_MESSAGE_TEMPLATE_PREFIX = "auto-custom-";

export const CUSTOM_MESSAGE_RULES = {
  maxLength: 1024, // WhatsApp's limit for a template body
  minLength: 20,
  minWordsPerPlaceholder: 3, // fixed words per placeholder, so Meta doesn't reject it as too variable
};

export type CustomMessageOnReject = "default" | "skip";

// On the plan entry (AutoCampaignPlanEntry.customMessage). Approval status is
// on the template doc (waTemplateStatus), updated by WhatsApp's webhook.
export interface AutoCampaignCustomMessage {
  text: string; // seller's text with {placeholders}
  templateKey: string; // wa-automsg-templates doc id, CUSTOM_MESSAGE_TEMPLATE_PREFIX + timestamp
  withOffer: boolean; // written for the campaign's offer version (may use {offer}, {validTill})
  onReject: CustomMessageOnReject;
  submittedAt: Timestamp | Date;
  submittedBy: string; // uid
}

// Written by the backend on the template doc, so the sender doesn't rely on
// the seller-writable plan doc for the parameter order.
export interface CustomMessageTemplateInfo {
  entryId: string;
  params: CustomMessagePlaceholder[]; // value for {{1}}, {{2}}, ...
  withOffer: boolean;
}

export type ParsedCustomMessage = {
  body: string; // text with {{1}}..{{n}}
  params: CustomMessagePlaceholder[];
  errors: string[]; // seller-readable; empty when it can be submitted
};

const PLACEHOLDER_RE = /\{([a-zA-Z]+)\}/g;
const LINK_RE = /(https?:\/\/|www\.)\S+/i;

export const normaliseCustomMessage = (text: string) =>
  text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

// Checks a seller's text against WhatsApp's template rules and turns its
// {placeholders} into numbered variables. Shared by the seller app (live
// errors) and the backend (final check before submitting).
export function parseCustomMessage(
  rawText: string,
  { withOffer }: { withOffer: boolean },
): ParsedCustomMessage {
  const text = normaliseCustomMessage(rawText);
  const errors: string[] = [];
  const params: CustomMessagePlaceholder[] = [];

  const unknown = new Set<string>();
  const body = text.replace(PLACEHOLDER_RE, (match, name: string) => {
    if (!(CUSTOM_MESSAGE_PLACEHOLDERS as readonly string[]).includes(name)) {
      unknown.add(match);
      return match;
    }
    params.push(name as CustomMessagePlaceholder);
    return `{{${params.length}}}`;
  });

  if (text.length < CUSTOM_MESSAGE_RULES.minLength) errors.push("The message is too short");
  if (body.length > CUSTOM_MESSAGE_RULES.maxLength)
    errors.push(`Keep the message under ${CUSTOM_MESSAGE_RULES.maxLength} characters`);
  if (unknown.size > 0)
    errors.push(`Unknown placeholder ${[...unknown].join(", ")}. Use only the ones listed.`);
  if (/\{\{|\}\}/.test(text.replace(PLACEHOLDER_RE, ""))) errors.push("Remove the {{ }} brackets");
  if (LINK_RE.test(text)) errors.push("Remove links. The button below the message already opens your page.");

  if (withOffer && !params.includes("offer"))
    errors.push("Add {offer} so guests know what they get");
  if (!withOffer && params.some((p) => OFFER_PLACEHOLDERS.includes(p)))
    errors.push("This campaign has no offer. Remove {offer} and {validTill}.");

  if (params.length > 0) {
    if (/^\{\{\d+\}\}/.test(body)) errors.push("Don't start the message with a placeholder");
    if (/\{\{\d+\}\}[\s.!?,:;*_~]*$/.test(body)) errors.push("Don't end the message with a placeholder");
    if (/\{\{\d+\}\}[\s*_~]*\{\{\d+\}\}/.test(body))
      errors.push("Put some words between two placeholders");
    const fixedWords = body
      .replace(/\{\{\d+\}\}/g, " ")
      .split(/\s+/)
      .filter((w) => /[A-Za-z0-9\u00C0-\u024F\u0900-\u0DFF]/.test(w)).length; // Latin and Indian scripts
    if (fixedWords < params.length * CUSTOM_MESSAGE_RULES.minWordsPerPlaceholder)
      errors.push("Add more of your own words around the placeholders");
  }

  return { body, params, errors };
}

// Replaces {placeholders} with values, for previews.
export function fillCustomMessage(
  text: string,
  values: Partial<Record<CustomMessagePlaceholder, string>>,
): string {
  return normaliseCustomMessage(text).replace(PLACEHOLDER_RE, (match, name: string) =>
    values[name as CustomMessagePlaceholder] ?? match,
  );
}

// Turns a default template body ({{1}}.. with its param order) back into
// seller-editable text, to prefill the editor.
export function templateBodyToCustomText(
  body: string,
  params: CustomMessagePlaceholder[],
): string {
  return body.replace(/\{\{(\d+)\}\}/g, (match, n: string) => {
    const p = params[Number(n) - 1];
    return p ? `{${p}}` : match;
  });
}

// Param order of Batao's default festival templates.
export const DEFAULT_TEMPLATE_PARAMS: Record<"greeting" | "offer", CustomMessagePlaceholder[]> = {
  greeting: ["name", "store", "festival"],
  offer: ["name", "store", "festival", "offer", "validTill"],
};
