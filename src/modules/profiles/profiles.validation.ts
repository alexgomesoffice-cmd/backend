/**
 * FILE: src/modules/profiles/profiles.validation.ts
 * PURPOSE: Input validation for profile operations
 *
 * WHAT IT DOES:
 * - validateUpdateProfileInput() - Validates profile update data
 * - validateDate() - Validates date format (optional DOB)
 * - validateGender() - Validates gender value
 * - validateCountry() - Validates country name
 *
 * USAGE:
 * import { validateUpdateProfileInput } from './profiles.validation';
 * const { isValid, errors } = validateUpdateProfileInput(profileData);
 */

/**
 * Validates profile update input (used by all profile types)
 *
 * OPTIONAL FIELDS (all fields are optional, but at least one required):
 * - dob (ISO date string, must be in past)
 * - gender (string, 1-20 chars)
 * - address (string, max 1000 chars)
 * - country (string, max 100 chars)
 * - nid_no (string, max 50 chars)
 * - passport (string, max 50 chars)
 * - phone (string, max 32 chars, E.164 format preferred)
 * - emergency_contact (string, max 100 chars)
 * - image_url (string, max 500 chars, valid URL)
 *
 * For admin profiles only (system_admin_details, hotel_admin_details):
 * - manager_name (string, max 150 chars)
 * - manager_phone (string, max 32 chars)
 * - emergency_contact1 (string, max 100 chars)
 * - emergency_contact2 (string, max 100 chars)
 *
 * @param {any} profileData - Profile data object
 * @returns {object} { isValid: boolean, errors: string[] }
 *
 * @example
 * const result = validateUpdateProfileInput({
 *   phone: "+8801712345678",
 *   dob: "1990-05-15"
 * });
 */
export function validateUpdateProfileInput(profileData: any) {
  const errors: string[] = [];

  // Check at least one field is provided
  const hasField =
    profileData.dob !== undefined ||
    profileData.gender !== undefined ||
    profileData.address !== undefined ||
    profileData.country !== undefined ||
    profileData.nid_no !== undefined ||
    profileData.passport !== undefined ||
    profileData.phone !== undefined ||
    profileData.emergency_contact !== undefined ||
    profileData.image_url !== undefined ||
    profileData.manager_name !== undefined ||
    profileData.manager_phone !== undefined ||
    profileData.emergency_contact1 !== undefined ||
    profileData.emergency_contact2 !== undefined;

  if (!hasField) {
    errors.push("At least one field is required for update");
    return { isValid: false, errors };
  }

  // Validate dob (optional)
  if (profileData.dob !== undefined && profileData.dob !== null) {
    const dobValidation = validateDate(profileData.dob);
    if (!dobValidation.isValid) {
      errors.push(`dob: ${dobValidation.errors[0]}`);
    }
  }

  // Validate gender (optional)
  if (profileData.gender !== undefined && profileData.gender !== null) {
    if (typeof profileData.gender !== "string") {
      errors.push("gender must be a string");
    } else if (profileData.gender.length > 20) {
      errors.push("gender cannot exceed 20 characters");
    }
  }

  // Validate address (optional)
  if (profileData.address !== undefined && profileData.address !== null) {
    if (typeof profileData.address !== "string") {
      errors.push("address must be a string");
    } else if (profileData.address.length > 1000) {
      errors.push("address cannot exceed 1000 characters");
    }
  }

  // Validate country (optional)
  if (profileData.country !== undefined && profileData.country !== null) {
    const countryValidation = validateCountry(profileData.country);
    if (!countryValidation.isValid) {
      errors.push(`country: ${countryValidation.errors[0]}`);
    }
  }

  // Validate nid_no (optional)
  if (profileData.nid_no !== undefined && profileData.nid_no !== null) {
    if (typeof profileData.nid_no !== "string") {
      errors.push("nid_no must be a string");
    } else if (profileData.nid_no.length > 50) {
      errors.push("nid_no cannot exceed 50 characters");
    }
  }

  // Validate passport (optional)
  if (profileData.passport !== undefined && profileData.passport !== null) {
    if (typeof profileData.passport !== "string") {
      errors.push("passport must be a string");
    } else if (profileData.passport.length > 50) {
      errors.push("passport cannot exceed 50 characters");
    }
  }

  // Validate phone (optional)
  if (profileData.phone !== undefined && profileData.phone !== null) {
    if (typeof profileData.phone !== "string") {
      errors.push("phone must be a string");
    } else if (profileData.phone.length > 32) {
      errors.push("phone cannot exceed 32 characters");
    }
  }

  // Validate emergency_contact (optional)
  if (profileData.emergency_contact !== undefined && profileData.emergency_contact !== null) {
    if (typeof profileData.emergency_contact !== "string") {
      errors.push("emergency_contact must be a string");
    } else if (profileData.emergency_contact.length > 100) {
      errors.push("emergency_contact cannot exceed 100 characters");
    }
  }

  // Validate image_url (optional)
  if (profileData.image_url !== undefined && profileData.image_url !== null) {
    if (typeof profileData.image_url !== "string") {
      errors.push("image_url must be a string");
    } else if (profileData.image_url.length > 500) {
      errors.push("image_url cannot exceed 500 characters");
    } else {
      try {
        new URL(profileData.image_url);
      } catch {
        errors.push("image_url must be a valid URL");
      }
    }
  }

  // Validate manager_name (optional, admin profiles)
  if (profileData.manager_name !== undefined && profileData.manager_name !== null) {
    if (typeof profileData.manager_name !== "string") {
      errors.push("manager_name must be a string");
    } else if (profileData.manager_name.length > 150) {
      errors.push("manager_name cannot exceed 150 characters");
    }
  }

  // Validate manager_phone (optional, admin profiles)
  if (profileData.manager_phone !== undefined && profileData.manager_phone !== null) {
    if (typeof profileData.manager_phone !== "string") {
      errors.push("manager_phone must be a string");
    } else if (profileData.manager_phone.length > 32) {
      errors.push("manager_phone cannot exceed 32 characters");
    }
  }

  // Validate emergency_contact1 (optional, admin profiles)
  if (profileData.emergency_contact1 !== undefined && profileData.emergency_contact1 !== null) {
    if (typeof profileData.emergency_contact1 !== "string") {
      errors.push("emergency_contact1 must be a string");
    } else if (profileData.emergency_contact1.length > 100) {
      errors.push("emergency_contact1 cannot exceed 100 characters");
    }
  }

  // Validate emergency_contact2 (optional, admin profiles)
  if (profileData.emergency_contact2 !== undefined && profileData.emergency_contact2 !== null) {
    if (typeof profileData.emergency_contact2 !== "string") {
      errors.push("emergency_contact2 must be a string");
    } else if (profileData.emergency_contact2.length > 100) {
      errors.push("emergency_contact2 cannot exceed 100 characters");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates date format and ensures it's in the past
 *
 * @param {any} dateStr - Date string (ISO format)
 * @returns {object} { isValid: boolean, errors: string[] }
 *
 * @example
 * const result = validateDate("1990-05-15");
 */
export function validateDate(dateStr: any) {
  const errors: string[] = [];

  if (!dateStr) {
    errors.push("Date is required");
    return { isValid: false, errors };
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    errors.push("Date must be in ISO format (YYYY-MM-DD)");
    return { isValid: false, errors };
  }

  // Check if date is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date >= today) {
    errors.push("Date of birth must be in the past");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates gender value
 *
 * @param {any} gender - Gender value
 * @returns {object} { isValid: boolean, errors: string[] }
 *
 * @example
 * const result = validateGender("Male");
 */
export function validateGender(gender: any) {
  const errors: string[] = [];

  if (!gender) {
    errors.push("Gender is required");
    return { isValid: false, errors };
  }

  if (typeof gender !== "string") {
    errors.push("Gender must be a string");
    return { isValid: false, errors };
  }

  if (gender.length > 20) {
    errors.push("Gender cannot exceed 20 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates country value
 *
 * @param {any} country - Country name
 * @returns {object} { isValid: boolean, errors: string[] }
 *
 * @example
 * const result = validateCountry("Bangladesh");
 */
export function validateCountry(country: any) {
  const errors: string[] = [];

  if (!country) {
    errors.push("Country is required");
    return { isValid: false, errors };
  }

  if (typeof country !== "string") {
    errors.push("Country must be a string");
    return { isValid: false, errors };
  }

  if (country.length > 100) {
    errors.push("Country cannot exceed 100 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
