import { PSP_HANDLES } from "./pspHandles";

export interface UpiValidationResult {
  valid: boolean;
  reason?: string;
  username?: string;
  handle?: string;
}

const UPI_REGEX = /^([a-zA-Z0-9._-]{2,256})@([a-zA-Z][a-zA-Z0-9]{1,64})$/;

/**
 * Layer 1 validation for UPI ID (VPA) format and PSP handle existence.
 */
export function validateUpiFormat(upi: string): UpiValidationResult {
  if (!upi || upi.trim() === "") {
    return { valid: false, reason: "Empty input" };
  }

  const trimmed = upi.trim().toLowerCase();
  
  if (!trimmed.includes("@")) {
    return { valid: false, reason: "Enter UPI ID like name@bank" };
  }

  const match = trimmed.match(UPI_REGEX);
  
  if (!match) {
    // Determine if it's the username or handle that failed
    const [username] = trimmed.split("@");
    if (!username || username.length < 2) {
      return { valid: false, reason: "Username too short (minimum 2 characters)" };
    }
    return { valid: false, reason: "Enter UPI ID like name@bank" };
  }

  const [, username, handle] = match;

  if (!PSP_HANDLES.has(handle)) {
    return { 
      valid: false, 
      reason: `@${handle} is not a recognized UPI provider`,
      username,
      handle 
    };
  }

  return { 
    valid: true, 
    username, 
    handle 
  };
}
