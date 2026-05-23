export interface ActivepiecesPayload {
  fullName: string;
  phoneNumber: string;
  email: string;
  city: string;
  budgetRange: string;
  submittedAt: string;
  source: "homepage_consultation_form";
}

/**
 * Sends consultation form data to Activepieces webhook.
 * This is designed to be a fire-and-forget function that never throws errors
 * or blocks the main UI thread.
 */
export const sendToActivepieces = async (payload: ActivepiecesPayload): Promise<void> => {
  try {
    const webhookUrl = import.meta.env.VITE_AP_WEBHOOK_URL || "https://cloud.activepieces.com/api/v1/webhooks/XPoIcBtWxwf8pUZ07q1rw";
    
    // Normalize phone number (strip non-numeric, prepend +91 if not present)
    let normalizedPhone = payload.phoneNumber.replace(/\D/g, "");
    if (normalizedPhone.length === 10) {
      normalizedPhone = `+91${normalizedPhone}`;
    } else if (normalizedPhone.length > 10 && !normalizedPhone.startsWith("+")) {
      // Just ensure it has + if we have country code but no + sign
      normalizedPhone = `+${normalizedPhone}`;
    }

    const finalPayload = {
      ...payload,
      phoneNumber: normalizedPhone,
    };

    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(finalPayload),
    });
  } catch (error) {
    // Only log to console, do not throw or show user-facing errors
    console.error("Failed to send data to Activepieces:", error);
  }
};
