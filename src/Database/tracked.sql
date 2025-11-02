-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 02, 2025 at 12:12 PM
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
-- Table structure for table `activities`
--

CREATE TABLE `activities` (
  `id` int(11) NOT NULL,
  `subject_code` varchar(10) NOT NULL,
  `professor_ID` varchar(20) NOT NULL,
  `activity_type` varchar(50) NOT NULL,
  `task_number` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `instruction` text DEFAULT NULL,
  `link` varchar(500) DEFAULT NULL,
  `points` int(11) DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `archived` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`id`, `subject_code`, `professor_ID`, `activity_type`, `task_number`, `title`, `instruction`, `link`, `points`, `deadline`, `created_at`, `updated_at`, `archived`) VALUES
(33, 'VD5248', '1156', 'Activity', 'Activity 1', 'HTML', 'Create a HTML code', '', 100, '2025-11-07', '2025-10-31 12:33:43', '2025-10-31 12:36:12', 0),
(36, 'VD5248', '1156', 'Laboratory', 'asdasda', 'dasdasdasd', 'asdasdasd', '', 100, '2025-11-09', '2025-11-02 10:46:36', '2025-11-02 10:46:36', 0);

-- --------------------------------------------------------

--
-- Table structure for table `activity_grades`
--

CREATE TABLE `activity_grades` (
  `id` int(11) NOT NULL,
  `activity_ID` int(11) NOT NULL,
  `student_ID` varchar(20) NOT NULL,
  `grade` decimal(5,2) DEFAULT NULL,
  `submitted` tinyint(1) DEFAULT 0,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `late` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_grades`
--

INSERT INTO `activity_grades` (`id`, `activity_ID`, `student_ID`, `grade`, `submitted`, `submitted_at`, `late`, `created_at`, `updated_at`) VALUES
(193, 33, '202210602', 100.00, 1, NULL, 0, '2025-10-31 12:33:43', '2025-11-02 10:59:25'),
(194, 33, '202210718', 100.00, 1, NULL, 0, '2025-10-31 12:33:43', '2025-11-02 10:59:25'),
(195, 33, '202210784', 100.00, 1, NULL, 0, '2025-10-31 12:33:43', '2025-11-02 10:59:25'),
(196, 33, '202210870', 100.00, 1, NULL, 0, '2025-10-31 12:33:43', '2025-11-02 10:59:25'),
(197, 33, '202218101', 100.00, 1, NULL, 0, '2025-10-31 12:33:43', '2025-11-02 10:59:25'),
(198, 33, '20230001', 100.00, 1, NULL, 0, '2025-10-31 12:33:43', '2025-11-02 10:59:25'),
(199, 33, '20230002', 100.00, 1, NULL, 0, '2025-10-31 12:33:43', '2025-11-02 10:59:25'),
(200, 33, '20230003', 100.00, 1, NULL, 0, '2025-10-31 12:33:43', '2025-11-02 10:59:25'),
(213, 36, '202210602', 100.00, 1, NULL, 0, '2025-11-02 10:46:36', '2025-11-02 10:58:56'),
(215, 36, '202210718', 100.00, 1, NULL, 1, '2025-11-02 10:46:36', '2025-11-02 10:59:16'),
(216, 36, '202210784', 0.00, 0, NULL, 0, '2025-11-02 10:46:36', '2025-11-02 11:08:38'),
(217, 36, '202210870', 100.00, 1, NULL, 0, '2025-11-02 10:46:36', '2025-11-02 10:58:56'),
(218, 36, '202218101', 100.00, 1, NULL, 0, '2025-11-02 10:46:36', '2025-11-02 10:58:56'),
(219, 36, '20230001', 100.00, 1, NULL, 0, '2025-11-02 10:46:36', '2025-11-02 10:58:56'),
(220, 36, '20230002', 100.00, 1, NULL, 0, '2025-11-02 10:46:36', '2025-11-02 10:58:56'),
(221, 36, '20230003', 100.00, 1, NULL, 0, '2025-11-02 10:46:36', '2025-11-02 10:58:56');

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `announcement_ID` int(11) NOT NULL,
  `professor_ID` varchar(20) NOT NULL,
  `classroom_ID` varchar(10) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `link` varchar(500) DEFAULT NULL,
  `deadline` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `subject_code` varchar(10) NOT NULL,
  `professor_ID` varchar(20) NOT NULL,
  `attendance_date` date NOT NULL,
  `student_ID` varchar(20) NOT NULL,
  `status` enum('present','absent','late') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `subject_code` varchar(10) NOT NULL,
  `year_level` varchar(20) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `section` varchar(50) NOT NULL,
  `professor_ID` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` varchar(10) NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`subject_code`, `year_level`, `subject`, `section`, `professor_ID`, `created_at`, `updated_at`, `status`) VALUES
('LY7552', '2nd Year', 'DCIT 25A', '2E', '1156', '2025-10-31 12:35:21', '2025-11-02 10:46:19', 'Archived'),
('VD5248', '4th Year', 'ITEC 101', '4D', '1156', '2025-10-31 12:33:15', '2025-11-02 10:15:57', 'Active'),
('VI9168', '4th Year', 'ITEC 90', '4A', '1156', '2025-11-02 10:05:57', '2025-11-02 10:05:57', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `tracked_ID` varchar(20) NOT NULL,
  `token` varchar(64) NOT NULL,
  `expiry` datetime NOT NULL,
  `used` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_resets`
--

INSERT INTO `password_resets` (`id`, `tracked_ID`, `token`, `expiry`, `used`, `created_at`) VALUES
(7, '202210870', '84cf2b1e12f30beda3bffbc647c2d7416259ee02e78db47f26020ded09e73206', '2025-10-08 19:46:59', 1, '2025-10-07 17:46:59');

-- --------------------------------------------------------

--
-- Table structure for table `tracked_users`
--

CREATE TABLE `tracked_users` (
  `tracked_ID` varchar(20) NOT NULL,
  `tracked_Role` varchar(20) NOT NULL DEFAULT 'Student',
  `tracked_email` varchar(100) NOT NULL,
  `tracked_password` varchar(255) NOT NULL,
  `tracked_fname` varchar(50) NOT NULL,
  `tracked_lname` varchar(50) NOT NULL,
  `tracked_mi` varchar(5) DEFAULT NULL,
  `tracked_program` varchar(50) NOT NULL,
  `tracked_yearandsec` varchar(50) NOT NULL,
  `tracked_bday` date NOT NULL,
  `tracked_gender` varchar(10) DEFAULT NULL,
  `tracked_phone` varchar(15) DEFAULT NULL,
  `tracked_Status` varchar(10) NOT NULL DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tracked_users`
--

INSERT INTO `tracked_users` (`tracked_ID`, `tracked_Role`, `tracked_email`, `tracked_password`, `tracked_fname`, `tracked_lname`, `tracked_mi`, `tracked_program`, `tracked_yearandsec`, `tracked_bday`, `tracked_gender`, `tracked_phone`, `tracked_Status`, `created_at`, `updated_at`) VALUES
('1123', 'Admin', 'admin@cvsu.edu.ph', '$2y$10$1YMz3I5brKKoL.zgSN225ubRTBgeFZ5UT./XRGY3s.SBSQbtBe0la', 'John', 'Admin', 'A', 'BSIT', '', '2000-12-08', 'Male', '09864518549', 'Active', '2025-09-26 05:10:40', '2025-09-26 05:10:40'),
('1156', 'Professor', 'patrick.star@cvsu.edu.ph', '$2y$10$bDgTGNu6YIat9k621TSb4.mUetk7VGr5fdlq5MiqGcVp8Al7jV/ja', 'Patrick', 'Star', 'S', 'BSIT', '', '2001-01-01', 'Male', '09123613618', 'Active', '2025-10-07 11:29:33', '2025-10-31 12:34:56'),
('1223', 'Professor', 'robert.smith@cvsu.edu.ph', '$2y$10$iribSN/82ELXIjWjvxLDnOcb6h.ihKz5qdNPIX1pvvoZN8a4oeFkS', 'Robert', 'Smith', 'S', 'BSIT', 'Not Applicable', '1995-08-10', 'Male', '09123681723', 'Active', '2025-10-20 08:05:47', '2025-10-31 08:32:08'),
('202210870', 'Student', 'ic.xyrilljohn.abreu@cvsu.edu.ph', '$2y$10$C8VK3O1BOdz4Br5HpcNchO1GEUoPXd5eM4vz2nNAofwTe8mRoK0Ke', 'Xyrill John', 'Abreu', 'F', 'BSIT', 'BSIT-4D', '2003-08-03', 'Female', '09422169425', 'Active', '2025-10-07 17:46:42', '2025-10-07 17:47:38'),
('202218101', 'Student', 'spongebob.squarepants@cvsu.edu.ph', '$2y$10$JfTw/0p6wqh1onqCRuKpL..BBsVDmqSF1tiBirQWXfl.O5b8qM0/K', 'Spongebob', 'Squarepants', 'S', 'BSIT', 'BSIT-4D', '2000-01-01', 'Male', '09357633953', 'Active', '2025-10-07 12:45:51', '2025-10-07 12:45:51');

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
-- Indexes for table `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subject_code` (`subject_code`),
  ADD KEY `professor_ID` (`professor_ID`);

--
-- Indexes for table `activity_grades`
--
ALTER TABLE `activity_grades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_activity_student` (`activity_ID`,`student_ID`),
  ADD KEY `student_ID` (`student_ID`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`announcement_ID`),
  ADD KEY `professor_ID` (`professor_ID`),
  ADD KEY `classroom_ID` (`classroom_ID`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_attendance_record` (`subject_code`,`attendance_date`,`student_ID`),
  ADD KEY `professor_ID` (`professor_ID`),
  ADD KEY `student_ID` (`student_ID`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`subject_code`),
  ADD UNIQUE KEY `subject_code` (`subject_code`),
  ADD KEY `professor_ID` (`professor_ID`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD UNIQUE KEY `unique_user_reset` (`tracked_ID`);

--
-- Indexes for table `tracked_users`
--
ALTER TABLE `tracked_users`
  ADD PRIMARY KEY (`tracked_ID`),
  ADD UNIQUE KEY `tracked_email` (`tracked_email`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_ID`),
  ADD UNIQUE KEY `user_Email` (`user_Email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activities`
--
ALTER TABLE `activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `activity_grades`
--
ALTER TABLE `activity_grades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=233;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `announcement_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activities`
--
ALTER TABLE `activities`
  ADD CONSTRAINT `activities_ibfk_1` FOREIGN KEY (`subject_code`) REFERENCES `classes` (`subject_code`) ON DELETE CASCADE,
  ADD CONSTRAINT `activities_ibfk_2` FOREIGN KEY (`professor_ID`) REFERENCES `tracked_users` (`tracked_ID`) ON DELETE CASCADE;

--
-- Constraints for table `activity_grades`
--
ALTER TABLE `activity_grades`
  ADD CONSTRAINT `activity_grades_ibfk_1` FOREIGN KEY (`activity_ID`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `activity_grades_ibfk_2` FOREIGN KEY (`student_ID`) REFERENCES `users` (`user_ID`) ON DELETE CASCADE;

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`professor_ID`) REFERENCES `tracked_users` (`tracked_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `announcements_ibfk_2` FOREIGN KEY (`classroom_ID`) REFERENCES `classes` (`subject_code`) ON DELETE CASCADE;

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`subject_code`) REFERENCES `classes` (`subject_code`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`professor_ID`) REFERENCES `tracked_users` (`tracked_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_ibfk_3` FOREIGN KEY (`student_ID`) REFERENCES `users` (`user_ID`) ON DELETE CASCADE;

--
-- Constraints for table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`professor_ID`) REFERENCES `tracked_users` (`tracked_ID`) ON DELETE CASCADE;

--
-- Constraints for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`tracked_ID`) REFERENCES `tracked_users` (`tracked_ID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
