/**
 * Discovery & AI Referral Tracking (Pillar 5 - D of CITED Framework)
 * Detects whether an incoming visitor was referred by an AI Search Engine / LLM.
 */

export const AI_REFERRAL_SOURCES: Record<string, string> = {
  'chatgpt.com': 'ChatGPT',
  'chat.openai.com': 'ChatGPT',
  'perplexity.ai': 'Perplexity AI',
  'claude.ai': 'Claude',
  'copilot.microsoft.com': 'Microsoft Copilot',
  'gemini.google.com': 'Google Gemini',
  'poe.com': 'Poe AI',
  'you.com': 'You.com AI',
  'meta.ai': 'Meta AI',
};

export function detectAIReferral(referrerUrl?: string | null): { isAI: boolean; source: string | null } {
  if (!referrerUrl) return { isAI: false, source: null };

  try {
    const url = new URL(referrerUrl);
    const hostname = url.hostname.toLowerCase();

    for (const [domain, name] of Object.entries(AI_REFERRAL_SOURCES)) {
      if (hostname === domain || hostname.endsWith(`.${domain}`)) {
        return { isAI: true, source: name };
      }
    }
  } catch {
    // Malformed URL string
  }

  return { isAI: false, source: null };
}
