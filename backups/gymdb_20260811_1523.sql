-- MySQL dump 10.13  Distrib 8.4.3, for Win64 (x86_64)
--
-- Host: localhost    Database: gymdb
-- ------------------------------------------------------
-- Server version	8.4.3

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
-- Current Database: `gymdb`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `gymdb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `gymdb`;

--
-- Table structure for table `__efmigrationshistory`
--

DROP TABLE IF EXISTS `__efmigrationshistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `__efmigrationshistory` (
  `MigrationId` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ProductVersion` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `__efmigrationshistory`
--

LOCK TABLES `__efmigrationshistory` WRITE;
/*!40000 ALTER TABLE `__efmigrationshistory` DISABLE KEYS */;
INSERT INTO `__efmigrationshistory` VALUES ('20260807165232_InitialCreate','9.0.0'),('20260811134650_AddPersonalTrainerAndMeasurements','9.0.0');
/*!40000 ALTER TABLE `__efmigrationshistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classactivities`
--

DROP TABLE IF EXISTS `classactivities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classactivities` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `Name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Category` int NOT NULL,
  `Description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DurationMinutes` int NOT NULL,
  `Capacity` int NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classactivities`
--

LOCK TABLES `classactivities` WRITE;
/*!40000 ALTER TABLE `classactivities` DISABLE KEYS */;
INSERT INTO `classactivities` VALUES ('2aa969ee-0e53-4dd3-8ada-81958fa0f7ab','HIIT Funcional',3,'Intervalos de alta intensidad.',45,18,'2026-08-10 13:50:36.117053',NULL,1),('3126f1be-c8fa-45ef-8a32-09711139edae','Pilates Mat',1,'Control, respiraci?n y postura - nivel inicial.',50,14,'2026-08-11 16:33:04.095869','2026-08-11 16:33:04.388035',0),('c01d28d5-0865-4332-ba37-c1e8c24b5d22','Spinning Express',2,'Clase corta de alta intensidad.',45,20,'2026-08-10 13:50:36.046226',NULL,1),('c4e9966b-0670-4cf1-80d8-d1e87ae5016b','Ciclismo Indoor',2,'Ruta virtual en bicicleta estática.',60,22,'2026-08-10 13:50:36.131891',NULL,1),('ceb557bd-45a7-4c38-a034-1af31016a4ea','Yoga Restaurativo',1,'Flexibilidad y relajación.',60,15,'2026-08-10 13:50:36.093410',NULL,1),('f490c052-70ec-4435-a093-cf77e5286b20','Full Body',1,'Entrenamiento de fuerza de cuerpo completo.',60,25,'2026-08-10 13:50:36.074483',NULL,1);
/*!40000 ALTER TABLE `classactivities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientmeasurements`
--

DROP TABLE IF EXISTS `clientmeasurements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientmeasurements` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `ClientId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `MeasuredOn` date NOT NULL,
  `WeightKg` decimal(6,2) DEFAULT NULL,
  `HeightCm` decimal(6,2) DEFAULT NULL,
  `BodyFatPercentage` decimal(5,2) DEFAULT NULL,
  `MuscleMassKg` decimal(6,2) DEFAULT NULL,
  `WaistCm` decimal(6,2) DEFAULT NULL,
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_ClientMeasurements_ClientId_MeasuredOn` (`ClientId`,`MeasuredOn`),
  CONSTRAINT `FK_ClientMeasurements_Clients_ClientId` FOREIGN KEY (`ClientId`) REFERENCES `clients` (`Id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientmeasurements`
--

LOCK TABLES `clientmeasurements` WRITE;
/*!40000 ALTER TABLE `clientmeasurements` DISABLE KEYS */;
INSERT INTO `clientmeasurements` VALUES ('98b4fb27-4735-465f-bd51-463708ec945c','24c46805-e2f7-4708-be87-3ce93e63dbae','2026-08-11',83.00,175.00,17.90,35.90,87.00,'Actualizada','2026-08-11 13:53:48.298957','2026-08-11 13:53:49.529287',0),('f6351095-d67c-4f3f-9ecc-37b4d4106e98','24c46805-e2f7-4708-be87-3ce93e63dbae','2026-08-10',82.50,175.00,18.20,35.40,88.00,'Medici?n de ejemplo','2026-08-11 13:57:19.868791',NULL,1);
/*!40000 ALTER TABLE `clientmeasurements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientplans`
--

DROP TABLE IF EXISTS `clientplans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientplans` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `ClientId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `PlanId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `Status` int NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_ClientPlans_ClientId_PlanId` (`ClientId`,`PlanId`),
  KEY `IX_ClientPlans_PlanId` (`PlanId`),
  CONSTRAINT `FK_ClientPlans_Clients_ClientId` FOREIGN KEY (`ClientId`) REFERENCES `clients` (`Id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_ClientPlans_Plans_PlanId` FOREIGN KEY (`PlanId`) REFERENCES `plans` (`Id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientplans`
--

LOCK TABLES `clientplans` WRITE;
/*!40000 ALTER TABLE `clientplans` DISABLE KEYS */;
/*!40000 ALTER TABLE `clientplans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `FirstName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `LastName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `BirthDate` date DEFAULT NULL,
  `Address` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL,
  `TrainerId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_Clients_Email` (`Email`),
  KEY `IX_Clients_TrainerId` (`TrainerId`),
  CONSTRAINT `FK_Clients_Trainers_TrainerId` FOREIGN KEY (`TrainerId`) REFERENCES `trainers` (`Id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES ('24c46805-e2f7-4708-be87-3ce93e63dbae','Ana','Torres','ana.torres@mail.com','555-1001','1990-05-12','Av. Siempre Viva 123','2026-08-10 13:50:35.604827','2026-08-11 13:49:49.163388',1,'1a8a3aae-f004-4b46-b71d-f9dbdef7529a'),('65b5b3fb-1cc0-4000-98f9-540f5759f003','Piero','Villata','ironpiero1@gmail.com','28783737','1983-03-15','Calle sin fin','2026-08-11 13:23:32.953350','2026-08-11 13:31:45.629885',0,NULL),('6ea1d5b3-667e-4a8e-8296-77fdcdc40113','Luis','García','luis.garcia@mail.com','555-1002','1988-11-03','Calle 9 #45-67','2026-08-10 13:50:35.778887',NULL,1,NULL),('838d950b-10e6-4997-8533-bad115203e01','Carlos','Ramírez','carlos.ramirez@mail.com','555-1004','1992-07-30','Cra 7 #33-21','2026-08-10 13:50:35.817881',NULL,1,NULL),('8eba2569-64b3-4496-883b-d27e4ac19fce','Lucía','Mendoza','lucia.mendoza@mail.com','555-1005','1998-09-15','Calle 23 #11-08','2026-08-10 13:50:35.833507',NULL,1,NULL),('f0e12f08-8a7d-4905-8254-0e7adb7e4b19','María','Fernández','maria.fernandez@mail.com','555-1003','1995-02-20','Carrera 15 #20-10','2026-08-10 13:50:35.798177',NULL,1,NULL);
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plans`
--

DROP TABLE IF EXISTS `plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plans` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `Name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ReferencePrice` decimal(10,2) NOT NULL,
  `DurationDays` int NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plans`
--

LOCK TABLES `plans` WRITE;
/*!40000 ALTER TABLE `plans` DISABLE KEYS */;
/*!40000 ALTER TABLE `plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedules`
--

DROP TABLE IF EXISTS `schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedules` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `ClassActivityId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `TrainerId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `DayOfWeek` int NOT NULL,
  `StartTime` time(6) NOT NULL,
  `EndTime` time(6) NOT NULL,
  `Room` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Schedules_ClassActivityId` (`ClassActivityId`),
  KEY `IX_Schedules_TrainerId` (`TrainerId`),
  CONSTRAINT `FK_Schedules_ClassActivities_ClassActivityId` FOREIGN KEY (`ClassActivityId`) REFERENCES `classactivities` (`Id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_Schedules_Trainers_TrainerId` FOREIGN KEY (`TrainerId`) REFERENCES `trainers` (`Id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedules`
--

LOCK TABLES `schedules` WRITE;
/*!40000 ALTER TABLE `schedules` DISABLE KEYS */;
INSERT INTO `schedules` VALUES ('09f392d6-5dac-4ff7-bf2f-7b5c88d86673','c01d28d5-0865-4332-ba37-c1e8c24b5d22','8ee09d31-f235-4056-90da-e2cc17501b34',1,'07:00:00.000000','07:45:00.000000','Sala A','2026-08-10 13:53:14.804847',NULL,1),('1040af0c-4298-4e65-aaec-c938a486f146','2aa969ee-0e53-4dd3-8ada-81958fa0f7ab','1a8a3aae-f004-4b46-b71d-f9dbdef7529a',1,'07:00:00.000000','07:45:00.000000','Sala A','2026-08-10 13:51:53.425485','2026-08-10 13:53:14.584728',0),('10851098-474e-4d71-a115-287da8a109e1','ceb557bd-45a7-4c38-a034-1af31016a4ea','c777ff94-217e-4818-88b3-0800a24594df',3,'17:00:00.000000','18:00:00.000000','Sala D','2026-08-10 13:53:14.904116',NULL,1),('11dae7e2-bb2b-4017-b5bf-8eb5bf0b2af3','f490c052-70ec-4435-a093-cf77e5286b20','1a8a3aae-f004-4b46-b71d-f9dbdef7529a',2,'07:00:00.000000','08:00:00.000000','Sala B','2026-08-10 13:53:14.881752',NULL,1),('2723a78c-50f6-4b51-96d9-e6d265c98700','c01d28d5-0865-4332-ba37-c1e8c24b5d22','8ee09d31-f235-4056-90da-e2cc17501b34',5,'20:00:00.000000','21:00:00.000000','Sala D','2026-08-11 18:04:38.593886','2026-08-11 18:04:39.106157',0),('2f291d67-5fac-4d00-a0cf-5d74a51e6df5','f490c052-70ec-4435-a093-cf77e5286b20','1a8a3aae-f004-4b46-b71d-f9dbdef7529a',1,'18:00:00.000000','19:00:00.000000','Sala B','2026-08-10 13:53:14.836547',NULL,1),('74c2eb10-18f8-42bd-86de-bac0ad7a271f','2aa969ee-0e53-4dd3-8ada-81958fa0f7ab','9be8b57c-ae96-4cf8-b252-468676f4455d',1,'19:00:00.000000','19:45:00.000000','Sala C','2026-08-10 13:53:14.859728',NULL,1),('85bb3926-7435-4126-acc7-3bb7da7d5181','2aa969ee-0e53-4dd3-8ada-81958fa0f7ab','1a8a3aae-f004-4b46-b71d-f9dbdef7529a',6,'09:00:00.000000','10:00:00.000000','Sala A','2026-08-10 13:51:53.616353','2026-08-10 13:53:14.617129',0),('8a534b11-fd84-4e37-b1e9-8d2f79af4ee3','c01d28d5-0865-4332-ba37-c1e8c24b5d22','8ee09d31-f235-4056-90da-e2cc17501b34',5,'12:00:00.000000','12:45:00.000000','Sala A','2026-08-10 13:53:14.925593',NULL,1),('8a5c6358-f077-4a4e-a34d-a2542e16ac1d','2aa969ee-0e53-4dd3-8ada-81958fa0f7ab','1a8a3aae-f004-4b46-b71d-f9dbdef7529a',1,'18:00:00.000000','19:00:00.000000','Sala B','2026-08-10 13:51:53.483880','2026-08-10 13:53:14.635313',0),('8e3d8fec-68f5-4da7-b0f4-9dc22caa8dac','c4e9966b-0670-4cf1-80d8-d1e87ae5016b','8ee09d31-f235-4056-90da-e2cc17501b34',6,'09:00:00.000000','10:00:00.000000','Sala A','2026-08-10 13:53:14.944765',NULL,1),('924aa58e-0722-4f64-8970-23004071d138','2aa969ee-0e53-4dd3-8ada-81958fa0f7ab','1a8a3aae-f004-4b46-b71d-f9dbdef7529a',3,'17:00:00.000000','18:00:00.000000','Sala D','2026-08-10 13:51:53.561263','2026-08-11 18:11:32.072370',0),('b5d1573e-5280-4bec-afb8-ccd3c919c82a','2aa969ee-0e53-4dd3-8ada-81958fa0f7ab','1a8a3aae-f004-4b46-b71d-f9dbdef7529a',5,'12:00:00.000000','12:45:00.000000','Sala A','2026-08-10 13:51:53.584026','2026-08-10 13:53:14.668395',0),('c5303c3b-19cb-4e8f-9a68-b05d5b98caa1','2aa969ee-0e53-4dd3-8ada-81958fa0f7ab','1a8a3aae-f004-4b46-b71d-f9dbdef7529a',2,'07:00:00.000000','08:00:00.000000','Sala B','2026-08-10 13:51:53.536803','2026-08-10 13:53:14.683724',0),('dd2a4ce1-9cd0-4867-a46d-e985dcb2ea66','2aa969ee-0e53-4dd3-8ada-81958fa0f7ab','1a8a3aae-f004-4b46-b71d-f9dbdef7529a',1,'19:00:00.000000','19:45:00.000000','Sala C','2026-08-10 13:51:53.507102','2026-08-10 13:53:14.698804',0);
/*!40000 ALTER TABLE `schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trainers`
--

DROP TABLE IF EXISTS `trainers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trainers` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `FirstName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `LastName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Specialty` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_Trainers_Email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trainers`
--

LOCK TABLES `trainers` WRITE;
/*!40000 ALTER TABLE `trainers` DISABLE KEYS */;
INSERT INTO `trainers` VALUES ('1a8a3aae-f004-4b46-b71d-f9dbdef7529a','Pedro','Sánchez','pedro.sanchez@mail.com','555-2001','Musculación','2026-08-10 13:50:35.881896',NULL,1),('8ee09d31-f235-4056-90da-e2cc17501b34','Laura','Gómez','laura.gomez@mail.com','555-2002','Spinning','2026-08-10 13:50:35.910989',NULL,1),('9be8b57c-ae96-4cf8-b252-468676f4455d','Jorge','Ruiz','jorge.ruiz@mail.com','555-2003','Funcional','2026-08-10 13:50:35.928230',NULL,1),('c777ff94-217e-4818-88b3-0800a24594df','Carla','Díaz','carla.diaz@mail.com','555-2004','Yoga','2026-08-10 13:50:35.945845',NULL,1);
/*!40000 ALTER TABLE `trainers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trainershifts`
--

DROP TABLE IF EXISTS `trainershifts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trainershifts` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `TrainerId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `DayOfWeek` int NOT NULL,
  `StartTime` time(6) NOT NULL,
  `EndTime` time(6) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_TrainerShifts_TrainerId` (`TrainerId`),
  CONSTRAINT `FK_TrainerShifts_Trainers_TrainerId` FOREIGN KEY (`TrainerId`) REFERENCES `trainers` (`Id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trainershifts`
--

LOCK TABLES `trainershifts` WRITE;
/*!40000 ALTER TABLE `trainershifts` DISABLE KEYS */;
INSERT INTO `trainershifts` VALUES ('1c37b48b-26b3-47e2-9384-0c322fcba7fe','1a8a3aae-f004-4b46-b71d-f9dbdef7529a',1,'06:00:00.000000','14:00:00.000000','2026-08-10 13:53:14.994752',NULL,1),('2abe8e71-1f60-4f66-8ba9-90b86e3bbc69','1a8a3aae-f004-4b46-b71d-f9dbdef7529a',5,'20:00:00.000000','22:00:00.000000','2026-08-11 16:14:39.764048','2026-08-11 16:14:53.705359',0),('66758ece-78e5-4bd6-bfaa-5eab18d7c2a3','8ee09d31-f235-4056-90da-e2cc17501b34',6,'10:00:00.000000','14:00:00.000000','2026-08-10 13:53:15.077216',NULL,1),('b676f28f-6b3d-47aa-9d35-488edeaa8814','1a8a3aae-f004-4b46-b71d-f9dbdef7529a',3,'06:00:00.000000','14:00:00.000000','2026-08-10 13:53:15.018327',NULL,1),('bbef53e9-368f-43fe-b454-325b7e3045f2','c777ff94-217e-4818-88b3-0800a24594df',1,'08:00:00.000000','12:00:00.000000','2026-08-10 13:53:15.132322',NULL,1),('bc08f7a6-e799-4011-8c3b-3f51af053ada','9be8b57c-ae96-4cf8-b252-468676f4455d',4,'08:00:00.000000','16:00:00.000000','2026-08-10 13:53:15.114265',NULL,1),('bc4f8c33-1943-49c4-8000-e8f7e254548e','9be8b57c-ae96-4cf8-b252-468676f4455d',1,'06:00:00.000000','18:00:00.000000','2026-08-10 13:53:15.092488',NULL,1),('d21aa5fb-b918-4cf7-8f32-11afdfd8e7ac','8ee09d31-f235-4056-90da-e2cc17501b34',1,'14:00:00.000000','22:00:00.000000','2026-08-10 13:53:15.043228',NULL,1),('d5fdae1a-3596-42e2-9192-d07d443483fb','c777ff94-217e-4818-88b3-0800a24594df',3,'18:00:00.000000','22:00:00.000000','2026-08-10 13:53:15.157696',NULL,1),('e862bfc9-a3c9-41d0-afe1-9b0ad514b00d','8ee09d31-f235-4056-90da-e2cc17501b34',5,'06:00:00.000000','11:00:00.000000','2026-08-10 13:53:15.061226',NULL,1);
/*!40000 ALTER TABLE `trainershifts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'gymdb'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-11 15:23:46
