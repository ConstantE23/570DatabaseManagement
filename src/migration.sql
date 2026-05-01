-- =====================================================================
-- Smart Campus: Unify Building + Dorm into single Building table
-- Unify Classroom + dorm Room into single Room table
-- =====================================================================
-- This script is REVERSIBLE. Old tables are renamed, not dropped.
-- Run 02_rollback_buildings.sql to undo.
-- Run 03_finalize_buildings.sql LATER to permanently drop old tables.
-- =====================================================================

START TRANSACTION;

-- ---------------------------------------------------------------------
-- 1. Rename old tables out of the way (preserves all data)
-- ---------------------------------------------------------------------
RENAME TABLE Building TO _old_Building;
RENAME TABLE Classroom TO _old_Classroom;
RENAME TABLE Dorm      TO _old_dorm;
RENAME TABLE Room      TO _old_room;
-- If you have a Bed table, rename it too. Comment out if you don't.
-- RENAME TABLE Bed TO _old_Bed;

-- ---------------------------------------------------------------------
-- 2. Create new unified Building table
-- ---------------------------------------------------------------------
CREATE TABLE Building (
    building_id    INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(100)  NOT NULL,
    address        VARCHAR(255),
    building_type  ENUM('academic', 'residential', 'mixed', 'admin', 'athletic')
                   NOT NULL DEFAULT 'academic',
    INDEX idx_building_type (building_type)
);

-- ---------------------------------------------------------------------
-- 3. Create new unified Room table
-- ---------------------------------------------------------------------
CREATE TABLE Room (
    room_id      INT AUTO_INCREMENT PRIMARY KEY,
    building_id  INT          NOT NULL,
    room_number  VARCHAR(20)  NOT NULL,
    room_type    ENUM('classroom', 'dorm_room', 'office', 'lab', 'common')
                 NOT NULL DEFAULT 'classroom',
    capacity     INT          DEFAULT 0,
    floor        INT,
    FOREIGN KEY (building_id) REFERENCES Building(building_id),
    INDEX idx_room_building (building_id),
    INDEX idx_room_type (room_type),
    UNIQUE KEY uniq_building_room (building_id, room_number)
);

-- ---------------------------------------------------------------------
-- 4. Copy data from old Building → new Building (academic type)
-- ---------------------------------------------------------------------
-- NOTE: Adjust column names if your old Building schema differs.
-- Run `DESCRIBE _old_Building;` first to confirm columns.
INSERT INTO Building (building_id, name, address, building_type)
SELECT building_id, name, NULL, 'academic'
FROM _old_Building;

-- ---------------------------------------------------------------------
-- 5. Copy data from old dorm → new Building (residential type)
-- ---------------------------------------------------------------------
-- NOTE: We need new building_ids for dorms so they don't collide with
-- existing Building IDs. We'll capture the offset here.
SET @dorm_id_offset = (SELECT IFNULL(MAX(building_id), 0) FROM Building);

INSERT INTO Building (building_id, name, address, building_type)
SELECT 
    Dorm_id + @dorm_id_offset,
    Dorm_name,
    Dorm_address,
    'residential'
FROM _old_dorm;

-- ---------------------------------------------------------------------
-- 6. Copy classrooms → new Room table (room_type = 'classroom')
-- ---------------------------------------------------------------------
-- Adjust columns based on your actual Classroom schema
INSERT INTO Room (building_id, room_number, room_type, capacity)
SELECT 
    building_id,
    classroom_number,
    'classroom',
    capacity
FROM _old_Classroom;

-- ---------------------------------------------------------------------
-- 7. Copy dorm rooms → new Room table (room_type = 'dorm_room')
-- ---------------------------------------------------------------------
-- Apply the same offset so room.building_id points at the right dorm
INSERT INTO Room (building_id, room_number, room_type, capacity)
SELECT 
    Dorm_id + @dorm_id_offset,
    Room_number,
    'dorm_room',
    Capacity
FROM _old_room;

-- ---------------------------------------------------------------------
-- 8. Add room_id to MaintenanceTicket (nullable initially)
-- ---------------------------------------------------------------------
ALTER TABLE MaintenanceTicket
    ADD COLUMN room_id INT NULL AFTER user_id,
    ADD CONSTRAINT fk_ticket_room
        FOREIGN KEY (room_id) REFERENCES Room(room_id);

CREATE INDEX idx_ticket_room ON MaintenanceTicket(room_id);

-- ---------------------------------------------------------------------
-- 9. (Optional) Update Section table to reference new Room table
-- ---------------------------------------------------------------------
-- If your Section table currently references Classroom, you'll want to
-- update its FK to point at Room. Uncomment and adjust if applicable.
--
-- ALTER TABLE Section
--     DROP FOREIGN KEY <existing_classroom_fk_name>,
--     ADD COLUMN new_room_id INT NULL;
--
-- UPDATE Section s
-- JOIN Room r ON r.room_number = s.classroom_number
--             AND r.room_type = 'classroom'
-- SET s.new_room_id = r.room_id;
--
-- ALTER TABLE Section DROP COLUMN classroom_id;
-- ALTER TABLE Section CHANGE new_room_id room_id INT NOT NULL;
-- ALTER TABLE Section ADD FOREIGN KEY (room_id) REFERENCES Room(room_id);

COMMIT;

-- ---------------------------------------------------------------------
-- Verification queries (run these to spot-check)
-- ---------------------------------------------------------------------
SELECT building_type, COUNT(*) AS count FROM Building GROUP BY building_type;
SELECT room_type, COUNT(*) AS count FROM Room GROUP BY room_type;
SELECT 
    b.name AS building, b.building_type, COUNT(r.room_id) AS room_count
FROM Building b
LEFT JOIN Room r ON r.building_id = b.building_id
GROUP BY b.building_id;
