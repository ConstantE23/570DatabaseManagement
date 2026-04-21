CREATE DATABASE SmartCampus;
USE SmartCampus;
CREATE TABLE User (
	user_id INT auto_increment primary key,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) Unique,
    phone VARCHAR(20),
    address VARCHAR(150)
);

CREATE TABLE Student(
	student_id INT auto_increment primary key,
    user_id INT,
    major VARCHAR(100),
    class_level VARCHAR(20),
    FOREIGN KEY (user_id) references User(user_id)
);

CREATE TABLE Staff (
	staff_id INT auto_increment primary key,
    user_id INT,
    department VARCHAR(100),
    FOREIGN KEY (user_id) references User(user_id)
);

CREATE TABLE Building (
	building_id INT auto_increment primary key,
	name VARCHAR(100)
);

CREATE TABLE Classroom (
    classroom_id INT AUTO_INCREMENT PRIMARY KEY,
    building_id INT,
    classroom_number VARCHAR(20),
    capacity INT,
    FOREIGN KEY (building_id) REFERENCES Building(building_id)
);
CREATE TABLE Course (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(20),
    title VARCHAR(100),
    credits INT
);
CREATE TABLE Section (
    section_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT,
    instructor VARCHAR(100),
    term VARCHAR(20),
    seat_cap INT,
    FOREIGN KEY (course_id) REFERENCES Course(course_id)
);

CREATE TABLE Enrollment (
    enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    section_id INT,
    enrollment_date DATE,
    status VARCHAR(20),
    grade VARCHAR(5),
    FOREIGN KEY (student_id) REFERENCES Student(student_id),
    FOREIGN KEY (section_id) REFERENCES Section(section_id)
);

CREATE TABLE Dorm (
    dorm_id INT AUTO_INCREMENT PRIMARY KEY,
    dorm_name VARCHAR(100),
    dorm_address VARCHAR(150)
);

CREATE TABLE Room (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    dorm_id INT,
    room_number VARCHAR(10),
    capacity INT,
    room_type VARCHAR(20),
    FOREIGN KEY (dorm_id) REFERENCES Dorm(dorm_id)
);

CREATE TABLE HousingContract (
    contract_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    room_id INT,
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (student_id) REFERENCES Student(student_id),
    FOREIGN KEY (room_id) REFERENCES Room(room_id)
);

CREATE TABLE MaintenanceTicket (
    ticket_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255),
    priority VARCHAR(20),
    status VARCHAR(20),
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);


CREATE TABLE Door (
    door_id INT AUTO_INCREMENT PRIMARY KEY,
    building_id INT,
    location VARCHAR(100),
    door_type VARCHAR(50),
    FOREIGN KEY (building_id) REFERENCES Building(building_id)
);

CREATE TABLE AccessCard (
    card_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    card_number VARCHAR(50),
    issued_date DATE,
    status VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

CREATE TABLE AccessLog (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    card_id INT,
    door_id INT,
    time DATETIME,
    result VARCHAR(20),
    FOREIGN KEY (card_id) REFERENCES AccessCard(card_id),
    FOREIGN KEY (door_id) REFERENCES Door(door_id)
);

CREATE TABLE LossReport (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    card_id INT,
    report_date DATE,
    notes TEXT,
    FOREIGN KEY (card_id) REFERENCES AccessCard(card_id)
);

CREATE TABLE CardRequest (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    request_date DATE,
    reason TEXT,
    status VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);
