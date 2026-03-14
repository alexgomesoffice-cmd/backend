-- CreateTable
CREATE TABLE `roles` (
    `role_id` INTEGER NOT NULL AUTO_INCREMENT,
    `role_name` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `roles_role_name_key`(`role_name`),
    PRIMARY KEY (`role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_admins` (
    `system_admin_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_blocked` BOOLEAN NOT NULL DEFAULT false,
    `created_by` INTEGER NULL,
    `last_login_at` DATETIME(3) NULL,
    `login_attempts` INTEGER NOT NULL DEFAULT 0,
    `password_reset_token` VARCHAR(255) NULL,
    `password_reset_expires` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `system_admins_email_key`(`email`),
    INDEX `system_admins_email_idx`(`email`),
    PRIMARY KEY (`system_admin_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_admin_details` (
    `system_admin_details_id` INTEGER NOT NULL AUTO_INCREMENT,
    `system_admin_id` INTEGER NOT NULL,
    `dob` DATE NULL,
    `gender` VARCHAR(20) NULL,
    `address` TEXT NULL,
    `nid_no` VARCHAR(50) NULL,
    `phone` VARCHAR(32) NULL,
    `image_url` VARCHAR(500) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `system_admin_details_system_admin_id_key`(`system_admin_id`),
    PRIMARY KEY (`system_admin_details_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `end_users` (
    `end_user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `email_verified` BOOLEAN NOT NULL DEFAULT false,
    `email_verified_at` DATETIME(3) NULL,
    `is_blocked` BOOLEAN NOT NULL DEFAULT false,
    `last_login_at` DATETIME(3) NULL,
    `login_attempts` INTEGER NOT NULL DEFAULT 0,
    `locked_until` DATETIME(3) NULL,
    `password_reset_token` VARCHAR(255) NULL,
    `password_reset_expires` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `end_users_email_key`(`email`),
    INDEX `end_users_email_idx`(`email`),
    PRIMARY KEY (`end_user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `end_user_details` (
    `end_user_detail_id` INTEGER NOT NULL AUTO_INCREMENT,
    `end_user_id` INTEGER NOT NULL,
    `dob` DATE NULL,
    `gender` VARCHAR(20) NULL,
    `address` TEXT NULL,
    `country` VARCHAR(100) NULL DEFAULT 'Bangladesh',
    `nid_no` VARCHAR(50) NULL,
    `passport` VARCHAR(50) NULL,
    `phone` VARCHAR(32) NULL,
    `emergency_contact` VARCHAR(100) NULL,
    `image_url` VARCHAR(500) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `end_user_details_end_user_id_key`(`end_user_id`),
    PRIMARY KEY (`end_user_detail_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hotels` (
    `hotel_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(150) NULL,
    `address` TEXT NULL,
    `city` VARCHAR(100) NULL,
    `hotel_type` VARCHAR(100) NULL,
    `emergency_contact1` VARCHAR(100) NULL,
    `emergency_contact2` VARCHAR(100) NULL,
    `owner_name` VARCHAR(150) NULL,
    `zip_code` VARCHAR(20) NULL,
    `created_by` INTEGER NOT NULL,
    `approval_status` ENUM('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
    `published_at` DATETIME(3) NULL,
    `approved_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `hotels_approval_status_idx`(`approval_status`),
    INDEX `hotels_city_idx`(`city`),
    PRIMARY KEY (`hotel_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hotel_details` (
    `hotel_details_id` INTEGER NOT NULL AUTO_INCREMENT,
    `hotel_id` INTEGER NOT NULL,
    `description` TEXT NULL,
    `reception_no1` VARCHAR(32) NULL,
    `reception_no2` VARCHAR(32) NULL,
    `star_rating` DECIMAL(2, 1) NULL,
    `guest_rating` DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `hotel_details_hotel_id_key`(`hotel_id`),
    PRIMARY KEY (`hotel_details_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hotel_admins` (
    `hotel_admin_id` INTEGER NOT NULL AUTO_INCREMENT,
    `role_id` INTEGER NOT NULL DEFAULT 1,
    `hotel_id` INTEGER NOT NULL,
    `created_by` INTEGER NULL,
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_blocked` BOOLEAN NOT NULL DEFAULT false,
    `last_login_at` DATETIME(3) NULL,
    `login_attempts` INTEGER NOT NULL DEFAULT 0,
    `locked_until` DATETIME(3) NULL,
    `password_reset_token` VARCHAR(255) NULL,
    `password_reset_expires` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `hotel_admins_hotel_id_key`(`hotel_id`),
    UNIQUE INDEX `hotel_admins_email_key`(`email`),
    INDEX `hotel_admins_email_idx`(`email`),
    PRIMARY KEY (`hotel_admin_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hotel_admin_details` (
    `hotel_admin_details_id` INTEGER NOT NULL AUTO_INCREMENT,
    `hotel_admin_id` INTEGER NOT NULL,
    `dob` DATE NULL,
    `phone` VARCHAR(32) NULL,
    `nid_no` VARCHAR(50) NULL,
    `address` TEXT NULL,
    `passport` VARCHAR(50) NULL,
    `manager_name` VARCHAR(150) NULL,
    `manager_phone` VARCHAR(32) NULL,
    `emergency_contact1` VARCHAR(100) NULL,
    `emergency_contact2` VARCHAR(100) NULL,
    `image_url` VARCHAR(500) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `hotel_admin_details_hotel_admin_id_key`(`hotel_admin_id`),
    PRIMARY KEY (`hotel_admin_details_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hotel_sub_admins` (
    `hotel_sub_admin_id` INTEGER NOT NULL AUTO_INCREMENT,
    `role_id` INTEGER NOT NULL DEFAULT 2,
    `hotel_id` INTEGER NOT NULL,
    `created_by` INTEGER NULL,
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_blocked` BOOLEAN NOT NULL DEFAULT false,
    `last_login_at` DATETIME(3) NULL,
    `login_attempts` INTEGER NOT NULL DEFAULT 0,
    `locked_until` DATETIME(3) NULL,
    `password_reset_token` VARCHAR(255) NULL,
    `password_reset_expires` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `hotel_sub_admins_email_key`(`email`),
    INDEX `hotel_sub_admins_email_idx`(`email`),
    INDEX `hotel_sub_admins_hotel_id_idx`(`hotel_id`),
    PRIMARY KEY (`hotel_sub_admin_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hotel_sub_admin_details` (
    `hotel_sub_admin_details_id` INTEGER NOT NULL AUTO_INCREMENT,
    `hotel_sub_admin_id` INTEGER NOT NULL,
    `phone` VARCHAR(32) NULL,
    `nid_no` VARCHAR(50) NULL,
    `image_url` VARCHAR(500) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `hotel_sub_admin_details_hotel_sub_admin_id_key`(`hotel_sub_admin_id`),
    PRIMARY KEY (`hotel_sub_admin_details_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `amenities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `icon` VARCHAR(100) NULL,
    `context` ENUM('HOTEL', 'ROOM', 'BOTH') NOT NULL DEFAULT 'BOTH',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `amenities_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hotel_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hotel_id` INTEGER NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `is_cover` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `hotel_images_hotel_id_idx`(`hotel_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hotel_amenities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hotel_id` INTEGER NOT NULL,
    `amenity_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `hotel_amenities_hotel_id_idx`(`hotel_id`),
    UNIQUE INDEX `hotel_amenities_hotel_id_amenity_id_key`(`hotel_id`, `amenity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hotel_rooms` (
    `hotel_room_id` INTEGER NOT NULL AUTO_INCREMENT,
    `hotel_id` INTEGER NOT NULL,
    `room_type` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `base_price` DECIMAL(12, 2) NOT NULL,
    `room_size` VARCHAR(50) NULL,
    `approval_status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `hotel_rooms_hotel_id_idx`(`hotel_id`),
    PRIMARY KEY (`hotel_room_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hotel_room_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hotel_room_id` INTEGER NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `is_cover` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `hotel_room_images_hotel_room_id_idx`(`hotel_room_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `room_amenities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hotel_room_id` INTEGER NOT NULL,
    `amenity_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `room_amenities_hotel_room_id_idx`(`hotel_room_id`),
    UNIQUE INDEX `room_amenities_hotel_room_id_amenity_id_key`(`hotel_room_id`, `amenity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hotel_room_details` (
    `hotel_room_details_id` INTEGER NOT NULL AUTO_INCREMENT,
    `hotel_rooms_id` INTEGER NOT NULL,
    `room_number` VARCHAR(50) NOT NULL,
    `room_size` VARCHAR(50) NULL,
    `bed_type` VARCHAR(50) NULL,
    `max_occupancy` INTEGER NOT NULL DEFAULT 2,
    `smoking_allowed` BOOLEAN NOT NULL DEFAULT false,
    `pet_allowed` BOOLEAN NOT NULL DEFAULT false,
    `image_url` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `hotel_room_details_hotel_rooms_id_idx`(`hotel_rooms_id`),
    PRIMARY KEY (`hotel_room_details_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `booking_id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_reference` VARCHAR(64) NOT NULL,
    `end_user_id` INTEGER NOT NULL,
    `hotel_id` INTEGER NOT NULL,
    `check_in` DATE NOT NULL,
    `check_out` DATE NOT NULL,
    `special_request` TEXT NULL,
    `status` ENUM('RESERVED', 'BOOKED', 'EXPIRED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW') NOT NULL DEFAULT 'RESERVED',
    `reserved_until` DATETIME(3) NULL,
    `total_price` DECIMAL(12, 2) NOT NULL,
    `locked_price` DECIMAL(12, 2) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `bookings_booking_reference_key`(`booking_reference`),
    INDEX `bookings_booking_reference_idx`(`booking_reference`),
    INDEX `bookings_hotel_id_check_in_check_out_idx`(`hotel_id`, `check_in`, `check_out`),
    INDEX `bookings_end_user_id_status_idx`(`end_user_id`, `status`),
    INDEX `bookings_reserved_until_idx`(`reserved_until`),
    PRIMARY KEY (`booking_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `booking_rooms` (
    `booking_room_id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `hotel_room_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `price_per_night` DECIMAL(12, 2) NOT NULL,
    `nights` INTEGER NOT NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `booking_rooms_booking_id_idx`(`booking_id`),
    INDEX `booking_rooms_hotel_room_id_idx`(`hotel_room_id`),
    PRIMARY KEY (`booking_room_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `room_booking_trackers` (
    `tracker_id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `hotel_room_details_id` INTEGER NOT NULL,
    `hotel_room_id` INTEGER NOT NULL,
    `check_in` DATE NOT NULL,
    `check_out` DATE NOT NULL,
    `status` ENUM('RESERVED', 'BOOKED', 'EXPIRED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT') NOT NULL DEFAULT 'RESERVED',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `room_booking_trackers_hotel_room_id_check_in_check_out_idx`(`hotel_room_id`, `check_in`, `check_out`),
    INDEX `room_booking_trackers_booking_id_idx`(`booking_id`),
    INDEX `room_booking_trackers_status_idx`(`status`),
    INDEX `room_booking_trackers_check_in_idx`(`check_in`),
    INDEX `room_booking_trackers_hotel_room_details_id_check_in_check_o_idx`(`hotel_room_details_id`, `check_in`, `check_out`),
    INDEX `room_booking_trackers_hotel_room_details_id_status_check_in__idx`(`hotel_room_details_id`, `status`, `check_in`, `check_out`),
    UNIQUE INDEX `room_booking_trackers_hotel_room_details_id_check_in_check_o_key`(`hotel_room_details_id`, `check_in`, `check_out`),
    PRIMARY KEY (`tracker_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blacklisted_tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token_hash` VARCHAR(500) NOT NULL,
    `actor_id` INTEGER NOT NULL,
    `actor_type` ENUM('SYSTEM_ADMIN', 'HOTEL_ADMIN', 'HOTEL_SUB_ADMIN', 'END_USER') NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `blacklisted_tokens_token_hash_key`(`token_hash`),
    INDEX `blacklisted_tokens_token_hash_idx`(`token_hash`),
    INDEX `blacklisted_tokens_expires_at_idx`(`expires_at`),
    INDEX `blacklisted_tokens_actor_id_actor_type_idx`(`actor_id`, `actor_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `system_admins` ADD CONSTRAINT `system_admins_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `system_admins`(`system_admin_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_admin_details` ADD CONSTRAINT `system_admin_details_system_admin_id_fkey` FOREIGN KEY (`system_admin_id`) REFERENCES `system_admins`(`system_admin_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `end_user_details` ADD CONSTRAINT `end_user_details_end_user_id_fkey` FOREIGN KEY (`end_user_id`) REFERENCES `end_users`(`end_user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hotels` ADD CONSTRAINT `hotels_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `system_admins`(`system_admin_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hotels` ADD CONSTRAINT `hotels_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `system_admins`(`system_admin_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hotel_details` ADD CONSTRAINT `hotel_details_hotel_id_fkey` FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`hotel_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hotel_admins` ADD CONSTRAINT `hotel_admins_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hotel_admins` ADD CONSTRAINT `hotel_admins_hotel_id_fkey` FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`hotel_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hotel_admins` ADD CONSTRAINT `hotel_admins_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `system_admins`(`system_admin_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hotel_admin_details` ADD CONSTRAINT `hotel_admin_details_hotel_admin_id_fkey` FOREIGN KEY (`hotel_admin_id`) REFERENCES `hotel_admins`(`hotel_admin_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hotel_sub_admins` ADD CONSTRAINT `hotel_sub_admins_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hotel_sub_admins` ADD CONSTRAINT `hotel_sub_admins_hotel_id_fkey` FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`hotel_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hotel_sub_admin_details` ADD CONSTRAINT `hotel_sub_admin_details_hotel_sub_admin_id_fkey` FOREIGN KEY (`hotel_sub_admin_id`) REFERENCES `hotel_sub_admins`(`hotel_sub_admin_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hotel_images` ADD CONSTRAINT `hotel_images_hotel_id_fkey` FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`hotel_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hotel_amenities` ADD CONSTRAINT `hotel_amenities_hotel_id_fkey` FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`hotel_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hotel_amenities` ADD CONSTRAINT `hotel_amenities_amenity_id_fkey` FOREIGN KEY (`amenity_id`) REFERENCES `amenities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hotel_rooms` ADD CONSTRAINT `hotel_rooms_hotel_id_fkey` FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`hotel_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hotel_room_images` ADD CONSTRAINT `hotel_room_images_hotel_room_id_fkey` FOREIGN KEY (`hotel_room_id`) REFERENCES `hotel_rooms`(`hotel_room_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `room_amenities` ADD CONSTRAINT `room_amenities_hotel_room_id_fkey` FOREIGN KEY (`hotel_room_id`) REFERENCES `hotel_rooms`(`hotel_room_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `room_amenities` ADD CONSTRAINT `room_amenities_amenity_id_fkey` FOREIGN KEY (`amenity_id`) REFERENCES `amenities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hotel_room_details` ADD CONSTRAINT `hotel_room_details_hotel_rooms_id_fkey` FOREIGN KEY (`hotel_rooms_id`) REFERENCES `hotel_rooms`(`hotel_room_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_end_user_id_fkey` FOREIGN KEY (`end_user_id`) REFERENCES `end_users`(`end_user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_hotel_id_fkey` FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`hotel_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking_rooms` ADD CONSTRAINT `booking_rooms_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`booking_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking_rooms` ADD CONSTRAINT `booking_rooms_hotel_room_id_fkey` FOREIGN KEY (`hotel_room_id`) REFERENCES `hotel_rooms`(`hotel_room_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `room_booking_trackers` ADD CONSTRAINT `room_booking_trackers_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`booking_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `room_booking_trackers` ADD CONSTRAINT `room_booking_trackers_hotel_room_details_id_fkey` FOREIGN KEY (`hotel_room_details_id`) REFERENCES `hotel_room_details`(`hotel_room_details_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `room_booking_trackers` ADD CONSTRAINT `room_booking_trackers_hotel_room_id_fkey` FOREIGN KEY (`hotel_room_id`) REFERENCES `hotel_rooms`(`hotel_room_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
