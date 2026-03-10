/**
 * FILE: src/modules/hotels/hotels.validation.ts
 * PURPOSE: Input validation for hotel operations
 *
 * WHAT IT DOES:
 * - Validates input data for creating hotels
 * - Validates input data for updating hotels
 * - Validates hotel ID parameters
 * - Validates approval status values
 *
 * USAGE:
 * import { validateCreateHotelInput, validateUpdateHotelInput } from './hotels.validation';
 * const result = validateCreateHotelInput(hotelData);
 * if (!result.isValid) console.log(result.errors);
 */

/**
 * Validates input for creating a new hotel
 *
 * CHECKS:
 * - Hotel name exists, is string, non-empty, length >= 3
 * - Hotel email (optional) matches email format if provided
 * - Hotel address (optional) is string if provided
 * - City (optional) is string if provided
 * - Hotel type (optional) is string if provided
 * - Owner name (optional) is string if provided
 * - Description (optional) is string if provided
 * - Star rating (optional) is decimal 1-5 if provided
 *
 * @param {object} hotelData - Hotel data object
 * @returns {{isValid: boolean, errors: string[]}} Validation result
 *
 * @example
 * const result = validateCreateHotelInput({
 *   name: "Grand Hotel",
 *   email: "info@grandhotel.com",
 *   city: "Dhaka"
 * });
 */
export function validateCreateHotelInput(hotelData: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Hotel name (required)
  if (!hotelData?.name || typeof hotelData.name !== "string") {
    errors.push("Hotel name is required and must be a string");
  } else if (hotelData.name.trim() === "") {
    errors.push("Hotel name cannot be empty");
  } else if (hotelData.name.trim().length < 3) {
    errors.push("Hotel name must be at least 3 characters");
  }

  // Optional flat fields (email, address, city, hotel_type, owner_name, zip_code)
  const optionalString = (field: any, name: string) => {
    if (field !== undefined && field !== null) {
      if (typeof field !== "string") {
        errors.push(`${name} must be a string`);
      }
    }
  };
  optionalString(hotelData?.email, "Hotel email");
  optionalString(hotelData?.address, "Hotel address");
  optionalString(hotelData?.city, "City");
  optionalString(hotelData?.hotel_type, "Hotel type");
  optionalString(hotelData?.owner_name, "Owner name");
  optionalString(hotelData?.zip_code, "Zip code");

  // Details object (optional)
  if (hotelData?.details !== undefined && hotelData.details !== null) {
    if (typeof hotelData.details !== "object") {
      errors.push("Details must be an object");
    } else {
      const d = hotelData.details;
      optionalString(d?.description, "Description");
      optionalString(d?.reception_no1, "Reception no 1");
      optionalString(d?.reception_no2, "Reception no 2");
      if (d?.star_rating !== undefined && d.star_rating !== null) {
        const rating = parseFloat(d.star_rating);
        if (isNaN(rating) || rating < 1 || rating > 5) {
          errors.push("Star rating must be between 1 and 5");
        }
      }
      if (d?.guest_rating !== undefined && d.guest_rating !== null) {
        const gr = parseFloat(d.guest_rating);
        if (isNaN(gr) || gr < 0) {
          errors.push("Guest rating must be a number >= 0");
        }
      }
    }
  }

  // Amenities array (optional)
  if (hotelData?.amenities !== undefined && hotelData.amenities !== null) {
    if (!Array.isArray(hotelData.amenities)) {
      errors.push("Amenities must be an array of strings");
    } else {
      for (const a of hotelData.amenities) {
        if (typeof a !== "string") {
          errors.push("Each amenity must be a string");
          break;
        }
      }
    }
  }

  // Images array (optional)
  if (hotelData?.images !== undefined && hotelData.images !== null) {
    if (!Array.isArray(hotelData.images)) {
      errors.push("Images must be an array of URLs");
    } else if (hotelData.images.length > 8) {
      errors.push("A maximum of 8 images is allowed");
    } else {
      for (const u of hotelData.images) {
        if (typeof u !== "string") {
          errors.push("Each image URL must be a string");
          break;
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates input for updating a hotel
 *
 * CHECKS:
 * - Same as createHotelInput but all fields are optional
 * - At least one field must be provided for update
 *
 * @param {object} hotelData - Hotel data object with fields to update
 * @returns {{isValid: boolean, errors: string[]}} Validation result
 */
export function validateUpdateHotelInput(hotelData: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const optionalString = (field: any, name: string) => {
    if (field !== undefined && field !== null) {
      if (typeof field !== "string") {
        errors.push(`${name} must be a string`);
      }
    }
  };

  // Check if at least one field is provided (including nested)
  const hasFields =
    hotelData?.name !== undefined ||
    hotelData?.email !== undefined ||
    hotelData?.address !== undefined ||
    hotelData?.city !== undefined ||
    hotelData?.hotel_type !== undefined ||
    hotelData?.owner_name !== undefined ||
    hotelData?.zip_code !== undefined ||
    hotelData?.details !== undefined ||
    hotelData?.amenities !== undefined ||
    hotelData?.images !== undefined;

  if (!hasFields) {
    errors.push("At least one field must be provided for update");
  }

  // Hotel name (optional)
  if (hotelData?.name !== undefined && hotelData.name !== null) {
    if (typeof hotelData.name !== "string") {
      errors.push("Hotel name must be a string");
    } else if (hotelData.name.trim() === "") {
      errors.push("Hotel name cannot be empty");
    } else if (hotelData.name.trim().length < 3) {
      errors.push("Hotel name must be at least 3 characters");
    }
  }

  // Email (optional)
  if (hotelData?.email !== undefined && hotelData.email !== null && hotelData.email !== "") {
    if (typeof hotelData.email !== "string") {
      errors.push("Hotel email must be a string");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(hotelData.email)) {
      errors.push("Hotel email is invalid");
    }
  }

  // Address (optional)
  if (hotelData?.address !== undefined && hotelData.address !== null) {
    if (typeof hotelData.address !== "string") {
      errors.push("Hotel address must be a string");
    }
  }

  // City (optional)
  if (hotelData?.city !== undefined && hotelData.city !== null) {
    if (typeof hotelData.city !== "string") {
      errors.push("City must be a string");
    }
  }

  // Hotel type (optional)
  if (hotelData?.hotel_type !== undefined && hotelData.hotel_type !== null) {
    if (typeof hotelData.hotel_type !== "string") {
      errors.push("Hotel type must be a string");
    }
  }

  // Owner name (optional)
  if (hotelData?.owner_name !== undefined && hotelData.owner_name !== null) {
    if (typeof hotelData.owner_name !== "string") {
      errors.push("Owner name must be a string");
    }
  }

  // Description, star_rating moved into details object now; ignore here

  // Details object (optional)
  if (hotelData?.details !== undefined && hotelData.details !== null) {
    if (typeof hotelData.details !== "object") {
      errors.push("Details must be an object");
    } else {
      const d = hotelData.details;
      optionalString(d?.description, "Description");
      optionalString(d?.reception_no1, "Reception no 1");
      optionalString(d?.reception_no2, "Reception no 2");
      if (d?.star_rating !== undefined && d.star_rating !== null) {
        const rating = parseFloat(d.star_rating);
        if (isNaN(rating) || rating < 1 || rating > 5) {
          errors.push("Star rating must be between 1 and 5");
        }
      }
      if (d?.guest_rating !== undefined && d.guest_rating !== null) {
        const gr = parseFloat(d.guest_rating);
        if (isNaN(gr) || gr < 0) {
          errors.push("Guest rating must be a number >= 0");
        }
      }
    }
  }

  // Amenities array (optional)
  if (hotelData?.amenities !== undefined && hotelData.amenities !== null) {
    if (!Array.isArray(hotelData.amenities)) {
      errors.push("Amenities must be an array of strings");
    } else {
      for (const a of hotelData.amenities) {
        if (typeof a !== "string") {
          errors.push("Each amenity must be a string");
          break;
        }
      }
    }
  }

  // Images array (optional)
  if (hotelData?.images !== undefined && hotelData.images !== null) {
    if (!Array.isArray(hotelData.images)) {
      errors.push("Images must be an array of URLs");
    } else if (hotelData.images.length > 8) {
      errors.push("A maximum of 8 images is allowed");
    } else {
      for (const u of hotelData.images) {
        if (typeof u !== "string") {
          errors.push("Each image URL must be a string");
          break;
        }
      }
    }
  }

  // Contact fields (optional)
  if (hotelData?.emergency_contact1 !== undefined && hotelData.emergency_contact1 !== null) {
    if (typeof hotelData.emergency_contact1 !== "string") {
      errors.push("Emergency contact 1 must be a string");
    }
  }

  if (hotelData?.emergency_contact2 !== undefined && hotelData.emergency_contact2 !== null) {
    if (typeof hotelData.emergency_contact2 !== "string") {
      errors.push("Emergency contact 2 must be a string");
    }
  }

  if (hotelData?.reception_no1 !== undefined && hotelData.reception_no1 !== null) {
    if (typeof hotelData.reception_no1 !== "string") {
      errors.push("Reception no 1 must be a string");
    }
  }

  if (hotelData?.reception_no2 !== undefined && hotelData.reception_no2 !== null) {
    if (typeof hotelData.reception_no2 !== "string") {
      errors.push("Reception no 2 must be a string");
    }
  }

  if (hotelData?.zip_code !== undefined && hotelData.zip_code !== null) {
    if (typeof hotelData.zip_code !== "string") {
      errors.push("Zip code must be a string");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates hotel ID parameter
 *
 * CHECKS:
 * - ID exists and is a valid number
 * - ID is greater than 0
 *
 * @param {unknown} hotelId - Hotel ID to validate
 * @returns {{isValid: boolean, errors: string[]}} Validation result
 */
export function validateHotelId(hotelId: unknown): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (hotelId === null || hotelId === undefined) {
    errors.push("Hotel ID is required");
  } else if (typeof hotelId !== "number") {
    const parsed = Number(hotelId);
    if (isNaN(parsed)) {
      errors.push("Hotel ID must be a valid number");
    } else if (parsed <= 0) {
      errors.push("Hotel ID must be greater than 0");
    }
  } else if (hotelId <= 0) {
    errors.push("Hotel ID must be greater than 0");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates approval status value
 *
 * CHECKS:
 * - Status is one of valid ApprovalStatus enum values
 * - Status is a string
 *
 * @param {unknown} status - Approval status to validate
 * @returns {{isValid: boolean, errors: string[]}} Validation result
 */
export function validateApprovalStatus(status: unknown): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const validStatuses = ["DRAFT", "PENDING_APPROVAL", "PUBLISHED", "REJECTED"];

  if (status === null || status === undefined) {
    errors.push("Approval status is required");
  } else if (typeof status !== "string") {
    errors.push("Approval status must be a string");
  } else if (!validStatuses.includes(status)) {
    errors.push(`Approval status must be one of: ${validStatuses.join(", ")}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
