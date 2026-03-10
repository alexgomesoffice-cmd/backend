/*
  Warnings:

  - You are about to drop the column `amenity_name` on the `hotel_details` table. All the data in the column will be lost.
  - You are about to drop the column `hotel_image_url` on the `hotel_details` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `hotels` table. All the data in the column will be lost.
  - You are about to drop the column `guest_rating` on the `hotels` table. All the data in the column will be lost.
  - You are about to drop the column `reception_no1` on the `hotels` table. All the data in the column will be lost.
  - You are about to drop the column `reception_no2` on the `hotels` table. All the data in the column will be lost.
  - You are about to drop the column `star_rating` on the `hotels` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[hotel_id]` on the table `hotel_details` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `hotel_details` DROP COLUMN `amenity_name`,
    DROP COLUMN `hotel_image_url`,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `guest_rating` DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN `reception_no1` VARCHAR(32) NULL,
    ADD COLUMN `reception_no2` VARCHAR(32) NULL,
    ADD COLUMN `star_rating` DECIMAL(2, 1) NULL;

-- AlterTable
ALTER TABLE `hotels` DROP COLUMN `description`,
    DROP COLUMN `guest_rating`,
    DROP COLUMN `reception_no1`,
    DROP COLUMN `reception_no2`,
    DROP COLUMN `star_rating`;

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

-- CreateIndex
CREATE UNIQUE INDEX `hotel_details_hotel_id_key` ON `hotel_details`(`hotel_id`);

-- AddForeignKey
ALTER TABLE `hotel_images` ADD CONSTRAINT `hotel_images_hotel_id_fkey` FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`hotel_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hotel_amenities` ADD CONSTRAINT `hotel_amenities_hotel_id_fkey` FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`hotel_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hotel_amenities` ADD CONSTRAINT `hotel_amenities_amenity_id_fkey` FOREIGN KEY (`amenity_id`) REFERENCES `amenities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hotel_room_images` ADD CONSTRAINT `hotel_room_images_hotel_room_id_fkey` FOREIGN KEY (`hotel_room_id`) REFERENCES `hotel_rooms`(`hotel_room_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `room_amenities` ADD CONSTRAINT `room_amenities_hotel_room_id_fkey` FOREIGN KEY (`hotel_room_id`) REFERENCES `hotel_rooms`(`hotel_room_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `room_amenities` ADD CONSTRAINT `room_amenities_amenity_id_fkey` FOREIGN KEY (`amenity_id`) REFERENCES `amenities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
