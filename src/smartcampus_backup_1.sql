-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: SmartCampus
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `AccessCard`
--

DROP TABLE IF EXISTS `AccessCard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AccessCard` (
  `card_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `card_number` varchar(50) DEFAULT NULL,
  `issued_date` date DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`card_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `AccessCard_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AccessCard`
--

LOCK TABLES `AccessCard` WRITE;
/*!40000 ALTER TABLE `AccessCard` DISABLE KEYS */;
INSERT INTO `AccessCard` VALUES (1,1,'CARD1001','2026-01-05','Active'),(2,2,'CARD1002','2026-01-05','Active'),(3,3,'CARD1003','2026-01-06','Active'),(4,4,'CARD1004','2026-01-06','Inactive'),(5,5,'CARD1005','2026-01-07','Active'),(6,6,'CARD1006','2026-01-07','Active'),(7,7,'CARD1007','2026-01-08','Active'),(8,8,'CARD1008','2026-01-08','Active');
/*!40000 ALTER TABLE `AccessCard` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AccessLog`
--

DROP TABLE IF EXISTS `AccessLog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AccessLog` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `card_id` int DEFAULT NULL,
  `door_id` int DEFAULT NULL,
  `time` datetime DEFAULT NULL,
  `result` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`log_id`),
  KEY `card_id` (`card_id`),
  KEY `door_id` (`door_id`),
  CONSTRAINT `AccessLog_ibfk_1` FOREIGN KEY (`card_id`) REFERENCES `AccessCard` (`card_id`),
  CONSTRAINT `AccessLog_ibfk_2` FOREIGN KEY (`door_id`) REFERENCES `Door` (`door_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AccessLog`
--

LOCK TABLES `AccessLog` WRITE;
/*!40000 ALTER TABLE `AccessLog` DISABLE KEYS */;
INSERT INTO `AccessLog` VALUES (1,1,1,'2026-03-20 08:15:00','Granted'),(2,2,2,'2026-03-20 08:20:00','Denied'),(3,3,3,'2026-03-20 09:00:00','Granted'),(4,4,4,'2026-03-20 09:10:00','Denied'),(5,6,5,'2026-03-20 10:00:00','Granted');
/*!40000 ALTER TABLE `AccessLog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Building`
--

DROP TABLE IF EXISTS `Building`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Building` (
  `building_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`building_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Building`
--

LOCK TABLES `Building` WRITE;
/*!40000 ALTER TABLE `Building` DISABLE KEYS */;
INSERT INTO `Building` VALUES (1,'Science Hall'),(2,'Library'),(3,'Student Center'),(4,'Engineering Building');
/*!40000 ALTER TABLE `Building` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CardRequest`
--

DROP TABLE IF EXISTS `CardRequest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CardRequest` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `request_date` date DEFAULT NULL,
  `reason` text,
  `status` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`request_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `CardRequest_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CardRequest`
--

LOCK TABLES `CardRequest` WRITE;
/*!40000 ALTER TABLE `CardRequest` DISABLE KEYS */;
INSERT INTO `CardRequest` VALUES (1,4,'2026-03-10','Replacement for lost card','Approved'),(2,2,'2026-03-11','Need a replacement access card','Pending'),(3,5,'2026-03-12','Card is cracked and unreadable','Approved');
/*!40000 ALTER TABLE `CardRequest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Classroom`
--

DROP TABLE IF EXISTS `Classroom`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Classroom` (
  `classroom_id` int NOT NULL AUTO_INCREMENT,
  `building_id` int DEFAULT NULL,
  `classroom_number` varchar(20) DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  PRIMARY KEY (`classroom_id`),
  KEY `building_id` (`building_id`),
  CONSTRAINT `Classroom_ibfk_1` FOREIGN KEY (`building_id`) REFERENCES `Building` (`building_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Classroom`
--

LOCK TABLES `Classroom` WRITE;
/*!40000 ALTER TABLE `Classroom` DISABLE KEYS */;
INSERT INTO `Classroom` VALUES (1,1,'101',30),(2,1,'102',40),(3,2,'201',25),(4,4,'301',35),(5,4,'302',45);
/*!40000 ALTER TABLE `Classroom` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Course`
--

DROP TABLE IF EXISTS `Course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Course` (
  `course_id` int NOT NULL AUTO_INCREMENT,
  `course_code` varchar(20) DEFAULT NULL,
  `title` varchar(100) DEFAULT NULL,
  `credits` int DEFAULT NULL,
  PRIMARY KEY (`course_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Course`
--

LOCK TABLES `Course` WRITE;
/*!40000 ALTER TABLE `Course` DISABLE KEYS */;
INSERT INTO `Course` VALUES (1,'CSC570','Database Systems',3),(2,'CSC410','Networking Fundamentals',3),(3,'CSC308','Programming Languages',3),(4,'BUS201','Principles of Management',3),(5,'DS350','Intro to Data Science',3);
/*!40000 ALTER TABLE `Course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Door`
--

DROP TABLE IF EXISTS `Door`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Door` (
  `door_id` int NOT NULL AUTO_INCREMENT,
  `building_id` int DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `door_type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`door_id`),
  KEY `building_id` (`building_id`),
  CONSTRAINT `Door_ibfk_1` FOREIGN KEY (`building_id`) REFERENCES `Building` (`building_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Door`
--

LOCK TABLES `Door` WRITE;
/*!40000 ALTER TABLE `Door` DISABLE KEYS */;
INSERT INTO `Door` VALUES (1,1,'Front Entrance','Main Entry'),(2,1,'Lab Wing','Restricted'),(3,2,'South Entrance','Main Entry'),(4,3,'Event Hall Door','Public'),(5,4,'Server Room','Restricted');
/*!40000 ALTER TABLE `Door` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Dorm`
--

DROP TABLE IF EXISTS `Dorm`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Dorm` (
  `dorm_id` int NOT NULL AUTO_INCREMENT,
  `dorm_name` varchar(100) DEFAULT NULL,
  `dorm_address` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`dorm_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Dorm`
--

LOCK TABLES `Dorm` WRITE;
/*!40000 ALTER TABLE `Dorm` DISABLE KEYS */;
INSERT INTO `Dorm` VALUES (1,'Maple Hall','500 Residence Way'),(2,'Oak Hall','501 Residence Way'),(3,'Pine Hall','502 Residence Way');
/*!40000 ALTER TABLE `Dorm` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Enrollment`
--

DROP TABLE IF EXISTS `Enrollment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Enrollment` (
  `enrollment_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int DEFAULT NULL,
  `section_id` int DEFAULT NULL,
  `enrollment_date` date DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `grade` varchar(5) DEFAULT NULL,
  PRIMARY KEY (`enrollment_id`),
  KEY `student_id` (`student_id`),
  KEY `section_id` (`section_id`),
  CONSTRAINT `Enrollment_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `Student` (`student_id`),
  CONSTRAINT `Enrollment_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `Section` (`section_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Enrollment`
--

LOCK TABLES `Enrollment` WRITE;
/*!40000 ALTER TABLE `Enrollment` DISABLE KEYS */;
INSERT INTO `Enrollment` VALUES (1,1,1,'2026-01-10','Enrolled','A'),(2,1,2,'2026-01-10','Enrolled','B+'),(3,2,1,'2026-01-11','Enrolled','A-'),(4,3,3,'2026-01-12','Enrolled','B'),(5,4,4,'2026-01-12','Enrolled','A'),(6,5,5,'2026-01-13','Enrolled','A-');
/*!40000 ALTER TABLE `Enrollment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `HousingContract`
--

DROP TABLE IF EXISTS `HousingContract`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `HousingContract` (
  `contract_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int DEFAULT NULL,
  `room_id` int DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`contract_id`),
  KEY `student_id` (`student_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `HousingContract_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `Student` (`student_id`),
  CONSTRAINT `HousingContract_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `Room` (`room_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `HousingContract`
--

LOCK TABLES `HousingContract` WRITE;
/*!40000 ALTER TABLE `HousingContract` DISABLE KEYS */;
INSERT INTO `HousingContract` VALUES (1,1,1,'2026-01-01','2026-05-15'),(2,2,2,'2026-01-01','2026-05-15'),(3,3,3,'2026-01-01','2026-05-15'),(4,4,4,'2026-01-01','2026-05-15'),(5,5,5,'2026-01-01','2026-05-15');
/*!40000 ALTER TABLE `HousingContract` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `LossReport`
--

DROP TABLE IF EXISTS `LossReport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `LossReport` (
  `report_id` int NOT NULL AUTO_INCREMENT,
  `card_id` int DEFAULT NULL,
  `report_date` date DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`report_id`),
  KEY `card_id` (`card_id`),
  CONSTRAINT `LossReport_ibfk_1` FOREIGN KEY (`card_id`) REFERENCES `AccessCard` (`card_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LossReport`
--

LOCK TABLES `LossReport` WRITE;
/*!40000 ALTER TABLE `LossReport` DISABLE KEYS */;
INSERT INTO `LossReport` VALUES (1,4,'2026-03-10','Student reported lost access card near dorm lobby'),(2,2,'2026-03-11','Card misplaced after class'),(3,5,'2026-03-12','Card damaged and no longer scans');
/*!40000 ALTER TABLE `LossReport` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MaintenanceTicket`
--

DROP TABLE IF EXISTS `MaintenanceTicket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MaintenanceTicket` (
  `ticket_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `priority` varchar(20) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`ticket_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `MaintenanceTicket_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MaintenanceTicket`
--

LOCK TABLES `MaintenanceTicket` WRITE;
/*!40000 ALTER TABLE `MaintenanceTicket` DISABLE KEYS */;
INSERT INTO `MaintenanceTicket` VALUES (1,1,'Leaking Faucet in Kitchen','High','Pending','2026-03-20 00:00:00'),(2,2,'AC Unit Not Cooling','Medium','Approved','2026-03-19 00:00:00'),(3,3,'Broken Window in Dorm Room','Low','Pending','2026-03-18 00:00:00'),(4,4,'Light Bulb Out in Hallway','Low','Resolved','2026-03-17 00:00:00'),(5,5,'Door Lock Not Working','High','In Progress','2026-03-16 00:00:00');
/*!40000 ALTER TABLE `MaintenanceTicket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Room`
--

DROP TABLE IF EXISTS `Room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Room` (
  `room_id` int NOT NULL AUTO_INCREMENT,
  `dorm_id` int DEFAULT NULL,
  `room_number` varchar(10) DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `room_type` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`room_id`),
  KEY `dorm_id` (`dorm_id`),
  CONSTRAINT `Room_ibfk_1` FOREIGN KEY (`dorm_id`) REFERENCES `Dorm` (`dorm_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Room`
--

LOCK TABLES `Room` WRITE;
/*!40000 ALTER TABLE `Room` DISABLE KEYS */;
INSERT INTO `Room` VALUES (1,1,'101A',2,'Double'),(2,1,'102B',1,'Single'),(3,2,'201A',2,'Double'),(4,2,'202B',1,'Single'),(5,3,'301A',2,'Suite');
/*!40000 ALTER TABLE `Room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Section`
--

DROP TABLE IF EXISTS `Section`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Section` (
  `section_id` int NOT NULL AUTO_INCREMENT,
  `course_id` int DEFAULT NULL,
  `instructor` varchar(100) DEFAULT NULL,
  `term` varchar(20) DEFAULT NULL,
  `seat_cap` int DEFAULT NULL,
  PRIMARY KEY (`section_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `Section_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `Course` (`course_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Section`
--

LOCK TABLES `Section` WRITE;
/*!40000 ALTER TABLE `Section` DISABLE KEYS */;
INSERT INTO `Section` VALUES (1,1,'Dr. Harris','Spring 2026',30),(2,2,'Prof. Allen','Spring 2026',25),(3,3,'Dr. Carter','Spring 2026',35),(4,4,'Prof. White','Spring 2026',40),(5,5,'Dr. Green','Spring 2026',30);
/*!40000 ALTER TABLE `Section` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Staff`
--

DROP TABLE IF EXISTS `Staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Staff` (
  `staff_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`staff_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `Staff_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Staff`
--

LOCK TABLES `Staff` WRITE;
/*!40000 ALTER TABLE `Staff` DISABLE KEYS */;
INSERT INTO `Staff` VALUES (1,6,'Computer Science'),(2,7,'Housing'),(3,8,'Campus Security');
/*!40000 ALTER TABLE `Staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Student`
--

DROP TABLE IF EXISTS `Student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Student` (
  `student_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `major` varchar(100) DEFAULT NULL,
  `class_level` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`student_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `Student_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Student`
--

LOCK TABLES `Student` WRITE;
/*!40000 ALTER TABLE `Student` DISABLE KEYS */;
INSERT INTO `Student` VALUES (1,1,'Computer Science','Senior'),(2,2,'Information Technology','Junior'),(3,3,'Cybersecurity','Sophomore'),(4,4,'Business Administration','Freshman'),(5,5,'Data Science','Senior');
/*!40000 ALTER TABLE `Student` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES (1,'Ezaria','Alexander','ezaria.alexander@email.com','','555-1001','101 Campus Dr'),(2,'Jordan','Miles','jordan.miles@email.com','','555-1002','102 Campus Dr'),(3,'Taylor','Brown','taylor.brown@email.com','','555-1003','103 Campus Dr'),(4,'Morgan','Lee','morgan.lee@email.com','','555-1004','104 Campus Dr'),(5,'Chris','Walker','chris.walker@email.com','','555-1005','105 Campus Dr'),(6,'Ava','Johnson','ava.johnson@email.com','','555-1006','201 Faculty Ln'),(7,'Noah','Smith','noah.smith@email.com','','555-1007','202 Faculty Ln'),(8,'Emma','Davis','emma.davis@email.com','','555-1008','203 Staff Rd');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-01  8:19:28
