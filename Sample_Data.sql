USE SmartCampus;

INSERT INTO User (first_name, last_name, email, phone, address) VALUES
('Ezaria', 'Alexander', 'ezaria.alexander@email.com', '555-1001', '101 Campus Dr'),
('Jordan', 'Miles', 'jordan.miles@email.com', '555-1002', '102 Campus Dr'),
('Taylor', 'Brown', 'taylor.brown@email.com', '555-1003', '103 Campus Dr'),
('Morgan', 'Lee', 'morgan.lee@email.com', '555-1004', '104 Campus Dr'),
('Chris', 'Walker', 'chris.walker@email.com', '555-1005', '105 Campus Dr'),
('Ava', 'Johnson', 'ava.johnson@email.com', '555-1006', '201 Faculty Ln'),
('Noah', 'Smith', 'noah.smith@email.com', '555-1007', '202 Faculty Ln'),
('Emma', 'Davis', 'emma.davis@email.com', '555-1008', '203 Staff Rd');

INSERT INTO Student (user_id, major, class_level) VALUES
(1, 'Computer Science', 'Senior'),
(2, 'Information Technology', 'Junior'),
(3, 'Cybersecurity', 'Sophomore'),
(4, 'Business Administration', 'Freshman'),
(5, 'Data Science', 'Senior');

INSERT INTO Staff (user_id, department) VALUES
(6, 'Computer Science'),
(7, 'Housing'),
(8, 'Campus Security');

INSERT INTO Building (name) VALUES
('Science Hall'),
('Library'),
('Student Center'),
('Engineering Building');

INSERT INTO Classroom (building_id, classroom_number, capacity) VALUES
(1, '101', 30),
(1, '102', 40),
(2, '201', 25),
(4, '301', 35),
(4, '302', 45);

INSERT INTO Course (course_code, title, credits) VALUES
('CSC570', 'Database Systems', 3),
('CSC410', 'Networking Fundamentals', 3),
('CSC308', 'Programming Languages', 3),
('BUS201', 'Principles of Management', 3),
('DS350', 'Intro to Data Science', 3);

INSERT INTO Section (course_id, instructor, term, seat_cap) VALUES
(1, 'Dr. Harris', 'Spring 2026', 30),
(2, 'Prof. Allen', 'Spring 2026', 25),
(3, 'Dr. Carter', 'Spring 2026', 35),
(4, 'Prof. White', 'Spring 2026', 40),
(5, 'Dr. Green', 'Spring 2026', 30);

INSERT INTO Enrollment (student_id, section_id, enrollment_date, status, grade) VALUES
(1, 1, '2026-01-10', 'Enrolled', 'A'),
(1, 2, '2026-01-10', 'Enrolled', 'B+'),
(2, 1, '2026-01-11', 'Enrolled', 'A-'),
(3, 3, '2026-01-12', 'Enrolled', 'B'),
(4, 4, '2026-01-12', 'Enrolled', 'A'),
(5, 5, '2026-01-13', 'Enrolled', 'A-');

INSERT INTO Dorm (dorm_name, dorm_address) VALUES
('Maple Hall', '500 Residence Way'),
('Oak Hall', '501 Residence Way'),
('Pine Hall', '502 Residence Way');

INSERT INTO Room (dorm_id, room_number, capacity, room_type) VALUES
(1, '101A', 2, 'Double'),
(1, '102B', 1, 'Single'),
(2, '201A', 2, 'Double'),
(2, '202B', 1, 'Single'),
(3, '301A', 2, 'Suite');

INSERT INTO HousingContract (student_id, room_id, start_date, end_date) VALUES
(1, 1, '2026-01-01', '2026-05-15'),
(2, 2, '2026-01-01', '2026-05-15'),
(3, 3, '2026-01-01', '2026-05-15'),
(4, 4, '2026-01-01', '2026-05-15'),
(5, 5, '2026-01-01', '2026-05-15');

INSERT INTO MaintenanceTicket (user_id, title, priority, status, created_at) VALUES
(1, 'Leaking Faucet in Kitchen', 'High', 'Pending', '2026-03-20'),
(2, 'AC Unit Not Cooling', 'Medium', 'Approved', '2026-03-19'),
(3, 'Broken Window in Dorm Room', 'Low', 'Pending', '2026-03-18'),
(4, 'Light Bulb Out in Hallway', 'Low', 'Resolved', '2026-03-17'),
(5, 'Door Lock Not Working', 'High', 'In Progress', '2026-03-16');

INSERT INTO Door (building_id, location, door_type) VALUES
(1, 'Front Entrance', 'Main Entry'),
(1, 'Lab Wing', 'Restricted'),
(2, 'South Entrance', 'Main Entry'),
(3, 'Event Hall Door', 'Public'),
(4, 'Server Room', 'Restricted');

INSERT INTO AccessCard (user_id, card_number, issued_date, status) VALUES
(1, 'CARD1001', '2026-01-05', 'Active'),
(2, 'CARD1002', '2026-01-05', 'Active'),
(3, 'CARD1003', '2026-01-06', 'Active'),
(4, 'CARD1004', '2026-01-06', 'Inactive'),
(5, 'CARD1005', '2026-01-07', 'Active'),
(6, 'CARD1006', '2026-01-07', 'Active'),
(7, 'CARD1007', '2026-01-08', 'Active'),
(8, 'CARD1008', '2026-01-08', 'Active');

INSERT INTO AccessLog (card_id, door_id, time, result) VALUES
(1, 1, '2026-03-20 08:15:00', 'Granted'),
(2, 2, '2026-03-20 08:20:00', 'Denied'),
(3, 3, '2026-03-20 09:00:00', 'Granted'),
(4, 4, '2026-03-20 09:10:00', 'Denied'),
(6, 5, '2026-03-20 10:00:00', 'Granted');

INSERT INTO LossReport (card_id, report_date, notes) VALUES
(4, '2026-03-10', 'Student reported lost access card near dorm lobby'),
(2, '2026-03-11', 'Card misplaced after class'),
(5, '2026-03-12', 'Card damaged and no longer scans');

INSERT INTO CardRequest (user_id, request_date, reason, status) VALUES
(4, '2026-03-10', 'Replacement for lost card', 'Approved'),
(2, '2026-03-11', 'Need a replacement access card', 'Pending'),
(5, '2026-03-12', 'Card is cracked and unreadable', 'Approved');

SELECT * FROM User;
SELECT * FROM Student;
SELECT * FROM MaintenanceTicket;
SELECT * FROM Course;