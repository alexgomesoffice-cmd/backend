/**
 * FILE: src/modules/endUsers/endUsers.validation.ts
 * PURPOSE: Input validation for end user operations
 */

export function validateEndUserId(id: any) {
  const endUserId = parseInt(id);
  if (isNaN(endUserId) || endUserId <= 0) {
    return { isValid: false, errors: ["Invalid end user ID"] };
  }
  return { isValid: true, errors: [] };
}

export function validateBlockToggle(data: any) {
  const errors: string[] = [];

  if (data.is_blocked === undefined || typeof data.is_blocked !== "boolean") {
    errors.push("is_blocked must be a boolean");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
