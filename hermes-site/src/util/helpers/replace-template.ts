import type { Sponsor } from "../api/types";

/**
 * Replaces placeholders in a template string with sponsor data.
 * @param text The template text (subject or body)
 * @param sponsor The sponsor object (can be null)
 * @returns The parsed text
 */
export const replaceTemplate = (text: string, sponsor: Sponsor | null): string => {
    if (!text) return '';
    let parsedText = text;

    // 1. Replace %COMPANY_NAME%
    // Defaults to an empty string if sponsor or company_name is null
    const companyName = sponsor?.company_name || '[COMPANY_NAME]';
    parsedText = parsedText.replace(/%COMPANY_NAME%/gi, companyName);

    console.log("companyName", companyName);

    // 2. Replace %CONTACT_FNAME%
    // Gets the first part of the sponsor_name
    const sponsorName = sponsor?.sponsor_name || '';
    const firstName = sponsorName.split(' ')[0] || '[CONTACT_FNAME]';
    parsedText = parsedText.replace(/%CONTACT_FNAME%/gi, firstName);

    console.log("firstName", firstName);
    console.log("parsedText", parsedText);

    return parsedText;
};