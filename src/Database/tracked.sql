-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 06, 2025 at 09:43 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tracked`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_ID` varchar(20) NOT NULL,
  `user_Name` varchar(100) NOT NULL,
  `user_Email` varchar(100) NOT NULL,
  `user_Gender` varchar(10) DEFAULT NULL,
  `user_Role` varchar(20) NOT NULL DEFAULT 'Student',
  `YearandSection` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_ID`, `user_Name`, `user_Email`, `user_Gender`, `user_Role`, `YearandSection`) VALUES
('1123', 'Admin', 'admin@cvsu.edu.ph', 'Male', 'Admin', 'Not Applicable'),
('1156', 'Patrick Star', 'patrick.star@cvsu.edu.ph', 'Male', 'Professor', 'Not Applicable'),
('1223', 'Dr. Robert Smith', 'robert.smith@cvsu.edu.ph', 'Male', 'Professor', 'Not Applicable'),
('1233', 'Dr. Lisa Garcia', 'lisa.garcia@cvsu.edu.ph', 'Female', 'Professor', 'Not Applicable'),
('12345', 'System Administrator', 'system.admin@cvsu.edu.ph', 'Male', 'Admin', 'Not Applicable'),
('202210602', 'Dhenize Krista Faith C. Lopez', 'ic.dhenizekristafaith.lopez@cvsu.edu.ph', 'Male', 'Student', 'BSIT-4D'),
('202210718', 'Masarap Syang Tunay Gonzales', 'ic.michaelrhoi.gonzales@cvsu.edu.ph', 'Female', 'Student', 'BSIT-4D'),
('202210784', 'Jeannen K. Basay', 'ic.jeannen.basay@cvsu.edu.ph', 'Female', 'Student', 'BSIT-4D'),
('202210870', 'Xyrill John F. Abreu', 'ic.xyrilljohn.abreu@cvsu.edu.ph', 'Female', 'Student', 'BSIT-4D'),
('202218101', 'Spongebob Squarepants', 'spongebob.squarepants@cvsu.edu.ph', 'Male', 'Student', 'BSIT-4D'),
('20230001', 'Maria Santos', 'maria.santos@cvsu.edu.ph', 'Female', 'Student', 'BSIT-4D'),
('20230002', 'Juan Dela Cruz', 'juan.delacruz@cvsu.edu.ph', 'Male', 'Student', 'BSIT-4D'),
('20230003', 'Ana Reyes', 'ana.reyes@cvsu.edu.ph', 'Female', 'Student', 'BSIT-4D');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_ID`),
  ADD UNIQUE KEY `user_Email` (`user_Email`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
