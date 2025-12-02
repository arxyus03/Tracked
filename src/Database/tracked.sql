-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 02, 2025 at 08:12 AM
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
  `deadline` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `archived` tinyint(1) DEFAULT 0,
  `school_work_edited` tinyint(1) DEFAULT 0,
  `drive_folder_id` varchar(255) DEFAULT NULL,
  `drive_folder_url` text DEFAULT NULL,
  `drive_connected` tinyint(1) DEFAULT 0 COMMENT '1 for true, 0 for false',
  `drive_last_sync` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`id`, `subject_code`, `professor_ID`, `activity_type`, `task_number`, `title`, `instruction`, `link`, `points`, `deadline`, `created_at`, `updated_at`, `archived`, `school_work_edited`, `drive_folder_id`, `drive_folder_url`, `drive_connected`, `drive_last_sync`) VALUES
(97, 'HK4966', '202210602', 'Assignment', '1', 'Measure Me (Assignment #1)', '', '', 100, '2025-12-04 00:46:00', '2025-12-01 08:46:32', '2025-12-01 16:46:32', 0, 0, NULL, NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `activity_drive_links`
--

CREATE TABLE `activity_drive_links` (
  `id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `drive_link` text NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `uploaded_by` enum('professor','student') DEFAULT 'professor',
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `activity_files`
--

CREATE TABLE `activity_files` (
  `id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `file_url` text NOT NULL,
  `file_size` int(11) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `uploaded_by` enum('professor','student') DEFAULT 'professor',
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_files`
--

INSERT INTO `activity_files` (`id`, `activity_id`, `student_id`, `file_name`, `original_name`, `file_url`, `file_size`, `file_type`, `uploaded_by`, `uploaded_at`) VALUES
(2, 97, '202210870', '1764644481_692e56811d385_tracked.pdf', 'tracked.pdf', 'http://localhost/TrackEd/uploads/1764644481_692e56811d385_tracked.pdf', 217177, 'application/pdf', 'professor', '2025-12-02 03:01:21');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `submitted_file_id` varchar(255) DEFAULT NULL,
  `submitted_file_url` text DEFAULT NULL,
  `submitted_file_name` varchar(255) DEFAULT NULL,
  `submitted_file_size` int(11) DEFAULT NULL,
  `drive_link` text DEFAULT NULL,
  `drive_link_name` varchar(255) DEFAULT NULL,
  `drive_uploaded_at` timestamp NULL DEFAULT NULL,
  `uploaded_file_url` text DEFAULT NULL,
  `uploaded_file_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_grades`
--

INSERT INTO `activity_grades` (`id`, `activity_ID`, `student_ID`, `grade`, `submitted`, `submitted_at`, `late`, `created_at`, `updated_at`, `submitted_file_id`, `submitted_file_url`, `submitted_file_name`, `submitted_file_size`, `drive_link`, `drive_link_name`, `drive_uploaded_at`, `uploaded_file_url`, `uploaded_file_name`) VALUES
(442, 97, '202210784', NULL, 0, NULL, 0, '2025-12-01 16:46:32', '2025-12-01 16:46:32', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(443, 97, '202210870', NULL, 0, NULL, 0, '2025-12-01 16:46:32', '2025-12-02 03:01:21', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'http://localhost/TrackEd/uploads/1764644481_692e56811d385_tracked.pdf', 'tracked.pdf'),
(444, 97, '20230003', NULL, 0, NULL, 0, '2025-12-01 16:46:32', '2025-12-01 16:46:32', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(445, 97, '202210718', NULL, 0, NULL, 0, '2025-12-01 16:46:32', '2025-12-01 16:46:32', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(446, 97, '202210868', NULL, 0, NULL, 0, '2025-12-01 16:46:32', '2025-12-01 16:46:32', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `activity_submission_files`
--

CREATE TABLE `activity_submission_files` (
  `id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `file_id` varchar(255) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_url` text DEFAULT NULL,
  `uploaded_by` enum('professor','student') DEFAULT 'professor',
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`announcement_ID`, `professor_ID`, `classroom_ID`, `title`, `description`, `link`, `deadline`, `created_at`, `updated_at`) VALUES
(15, '202210602', 'AY0822', 'SIngerist', 'Baby SHark doo doo', NULL, '2025-11-19 14:43:00', '2025-11-12 06:43:48', '2025-11-20 23:30:36');

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

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `subject_code`, `professor_ID`, `attendance_date`, `student_ID`, `status`, `created_at`, `updated_at`) VALUES
(51, 'AY0822', '202210602', '2025-11-16', '202210718', 'absent', '2025-11-16 06:25:12', '2025-11-16 06:25:12'),
(52, 'AY0822', '202210602', '2025-11-16', '202210784', 'present', '2025-11-16 06:25:12', '2025-11-16 06:25:12'),
(53, 'AY0822', '202210602', '2025-11-16', '202210870', 'late', '2025-11-16 06:25:12', '2025-11-16 06:25:12'),
(54, 'SO0261', '202210602', '2025-11-16', '202210718', 'present', '2025-11-16 07:31:52', '2025-11-16 07:31:52'),
(55, 'SO0261', '202210602', '2025-11-16', '202210784', 'absent', '2025-11-16 07:31:52', '2025-11-16 07:31:52'),
(56, 'SO0261', '202210602', '2025-11-16', '202210870', 'absent', '2025-11-16 07:31:52', '2025-11-16 07:31:52');

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `subject_code` varchar(10) NOT NULL,
  `year_level` varchar(20) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `subject_semester` varchar(50) NOT NULL,
  `section` varchar(50) NOT NULL,
  `professor_ID` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` varchar(10) NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`subject_code`, `year_level`, `subject`, `subject_semester`, `section`, `professor_ID`, `created_at`, `updated_at`, `status`) VALUES
('AY0822', '3rd Year', 'ITEC111', '', 'A', '202210602', '2025-11-16 06:20:18', '2025-11-16 06:20:18', 'Active'),
('DL8870', '1st Year', 'DCIT101', 'first_sem', 'A', '202210602', '2025-11-30 14:36:09', '2025-11-30 14:36:09', 'Active'),
('HK4966', '1st Year', 'DCIT101', 'FIRST SEMESTER', 'B', '202210602', '2025-11-30 14:37:52', '2025-11-30 14:37:52', 'Active'),
('SO0261', '4th Year', 'OMG789', '', 'B', '202210602', '2025-11-16 07:31:13', '2025-11-16 07:31:13', 'Active');

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

-- --------------------------------------------------------

--
-- Table structure for table `student_classes`
--

CREATE TABLE `student_classes` (
  `id` int(11) NOT NULL,
  `student_ID` varchar(20) NOT NULL,
  `subject_code` varchar(10) NOT NULL,
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `archived` tinyint(1) DEFAULT 0,
  `archived_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_classes`
--

INSERT INTO `student_classes` (`id`, `student_ID`, `subject_code`, `enrolled_at`, `archived`, `archived_at`) VALUES
(12, '202210784', 'AY0822', '2025-11-16 06:23:55', 0, NULL),
(13, '202210870', 'AY0822', '2025-11-16 06:24:20', 0, NULL),
(14, '202210718', 'AY0822', '2025-11-16 06:24:55', 0, NULL),
(15, '202210784', 'SO0261', '2025-11-16 07:31:25', 0, NULL),
(16, '202210718', 'SO0261', '2025-11-16 07:31:31', 0, NULL),
(17, '202210870', 'SO0261', '2025-11-16 07:31:37', 0, NULL),
(18, '202210784', 'HK4966', '2025-11-16 06:23:55', 0, NULL),
(19, '202210870', 'HK4966', '2025-11-16 06:23:55', 0, NULL),
(20, '202210718', 'DL8870', '2025-11-16 06:23:55', 0, NULL),
(21, '20230003', 'DL8870', '2025-11-16 06:23:55', 0, NULL),
(22, '20230003', 'HK4966', '2025-11-16 06:24:20', 0, '0000-00-00 00:00:00'),
(23, '202210718', 'HK4966', '2025-11-16 06:24:20', 0, '0000-00-00 00:00:00'),
(24, '202210868', 'HK4966', '2025-11-16 06:24:20', 0, '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `tracked_semester`
--

CREATE TABLE `tracked_semester` (
  `semesterID` int(1) NOT NULL,
  `class_semester` varchar(50) NOT NULL,
  `semester_status` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tracked_semester`
--

INSERT INTO `tracked_semester` (`semesterID`, `class_semester`, `semester_status`) VALUES
(1, 'FIRST SEMESTER', 'ACTIVE'),
(2, 'SECOND SEMESTER', 'INACTIVE'),
(3, 'SUMMER', 'INACTIVE');

-- --------------------------------------------------------

--
-- Table structure for table `tracked_users`
--

CREATE TABLE `tracked_users` (
  `tracked_ID` varchar(20) NOT NULL,
  `tracked_Role` varchar(20) NOT NULL DEFAULT 'Student',
  `tracked_email` varchar(100) NOT NULL,
  `tracked_password` varchar(255) NOT NULL,
  `tracked_firstname` varchar(50) NOT NULL,
  `tracked_lastname` varchar(50) NOT NULL,
  `tracked_middlename` varchar(50) DEFAULT NULL,
  `tracked_program` varchar(50) NOT NULL,
  `tracked_yearandsec` varchar(50) NOT NULL,
  `tracked_semester` varchar(50) NOT NULL,
  `tracked_bday` date NOT NULL,
  `tracked_gender` varchar(10) DEFAULT NULL,
  `tracked_phone` varchar(15) DEFAULT NULL,
  `tracked_Status` varchar(10) NOT NULL DEFAULT 'Active',
  `temporary_password` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tracked_users`
--

INSERT INTO `tracked_users` (`tracked_ID`, `tracked_Role`, `tracked_email`, `tracked_password`, `tracked_firstname`, `tracked_lastname`, `tracked_middlename`, `tracked_program`, `tracked_yearandsec`, `tracked_semester`, `tracked_bday`, `tracked_gender`, `tracked_phone`, `tracked_Status`, `temporary_password`, `created_at`, `updated_at`) VALUES
('12345', 'Admin', 'ic.brielle.balatayo@cvsu.edu.ph', '$2y$10$HQKWZMfWzvUqDjJYbITcmu4aVchIJlmr2ngrtaDjN6VAuUp5EyFIa', 'Brielle Edrian', 'Balatayo', 'Ana', 'Not Applicable', 'Not Applicable', 'Not Applicable', '2002-08-18', 'Male', '9153406553', 'Active', '', '2025-11-10 18:51:38', '2025-11-16 13:39:22'),
('202210602', 'Professor', 'ic.dhenizekristafaith.lopez@cvsu.edu.ph', '$2y$10$H0MgsQHmMC/jFrXqHqmmeesiv4dPPeA9LuRQ0WkpYSadj.LTpANEa', 'Dhenize Krista Faith', 'Lopez', 'Cabardo', 'Information Technology', 'Not Applicable', 'Not Applicable', '2004-11-24', 'Male', '9988262316', 'Active', '', '2025-11-10 18:51:38', '2025-11-16 02:30:09'),
('202210718', 'Student', 'ic.michaelrhoi.gonzales@cvsu.edu.ph', '123', 'Michael Rhoi', 'Gonzales', 'Ladrica', 'BSIT', '4D', 'FIRST', '2004-06-20', 'Female', '9085527790', 'Active', '', '2025-11-12 06:13:21', '2025-11-17 01:12:47'),
('202210784', 'Student', 'ic.jeannen.basay@cvsu.edu.ph', '$2y$10$J0ZYn2vh3krWWjUzTEbBZu4P6MFGcztYVAn5C3sWPl4kEx1DvHjD.', 'Jeannen', 'Basay', 'Kummer', 'BSIT', '4D', 'SECOND', '2002-03-24', 'Female', '0', 'Active', '', '2025-11-10 18:51:38', '2025-11-16 04:58:28'),
('202210868', 'Student', 'ic.cristelnicole.vergara@cvsu.edu.ph', '123', 'Cristel Nicole', 'Vergara', 'S', 'Information Technology', '4D', 'FIRST', '2003-06-21', 'Female', '9234400863', 'Active', '2003-06-21Student202210868EPJ', '2025-11-30 00:04:04', '2025-11-30 00:29:18'),
('202210870', 'Student', 'ic.xyrilljohn.abreu@cvsu.edu.ph', '$2y$10$HKLdOP2Qwajflclg/TjBTuUjAkr3lAXVDVOJJGCb51wvHkOVMEXha', 'Xyrill John', 'Abreu', 'Fecundo', 'BSIT', '4D', 'FIRST', '2003-08-03', 'Female', '9422169425', 'Active', '', '2025-11-10 18:51:39', '2025-11-16 06:23:22'),
('20230003', 'Student', 'ic.juliaann.fajardo@cvsu.edu.ph', '$2y$10$fJcns6eh3Xh0SJVF6mSxOeuLN0cVtmUvqiOoS4MiAOSY7BUSXkCeu', 'Julia Ann', 'Fajardo', 'Sisno', 'Information Technology', 'Not Applicable', 'Not Applicable', '2001-06-07', 'Female', '9679532083', 'Active', '', '2025-11-10 18:51:39', '2025-11-30 21:47:58');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_ID` varchar(20) NOT NULL,
  `user_firstname` varchar(50) NOT NULL,
  `user_middlename` varchar(50) NOT NULL,
  `user_lastname` varchar(50) NOT NULL,
  `user_Email` varchar(100) NOT NULL,
  `user_phonenumber` bigint(11) NOT NULL,
  `user_bday` varchar(50) NOT NULL,
  `user_Gender` varchar(10) DEFAULT NULL,
  `user_Role` varchar(20) NOT NULL DEFAULT 'Student',
  `user_yearandsection` varchar(50) NOT NULL,
  `user_program` varchar(50) NOT NULL,
  `user_semester` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_ID`, `user_firstname`, `user_middlename`, `user_lastname`, `user_Email`, `user_phonenumber`, `user_bday`, `user_Gender`, `user_Role`, `user_yearandsection`, `user_program`, `user_semester`) VALUES
('1035', 'Sherilyn', 'Fontelo', 'Fajutagana', 'sherilyn.fajutagana@cvsu.edu.ph', 9933302365, '1993-08-15', 'Female', 'Professor', 'Not Applicable', 'Information Technology', 'Not Applicable'),
('12345', 'Brielle Edrian', 'Ana', 'Balatayo', 'ic.brielle.balatayo@cvsu.edu.ph', 9153406553, '08/18/2002', 'Male', 'Admin', 'Not Applicable', 'Not Applicable', 'Not Applicable'),
('202210602', 'Dhenize Krista Faith', 'Cabardo', 'Lopez', 'ic.dhenizekristafaith.lopez@cvsu.edu.ph', 9988262316, '11/24/2004', 'Male', 'Professor', 'Not Applicable', 'Information Technology', 'Not Applicable'),
('202210718', 'Michael Rhoi', 'Ladrica', 'Gonzales', 'ic.michaelrhoi.gonzales@cvsu.edu.ph', 9085527790, '06/20/2004', 'Female', 'Student', '4D', 'BSIT', 'FIRST'),
('202210781', 'Cherly Vic', 'C', 'Bakilid', 'ic.cherlyvic.bakilid@cvsu.edu.ph', 9168773102, '2002-11-17', 'Female', 'Student', '4D', 'Information Technology', 'First'),
('202210784', 'Jeannen', 'Kummer', 'Basay', 'ic.jeannen.basay@cvsu.edu.ph', 0, '03/24/2002', 'Female', 'Student', '4D', 'BSIT', 'SECOND'),
('202210838', 'Kate Justine', 'B', 'Pades', 'ic.katejustine.pades@cvsu.edu.ph', 9777429816, '2003-05-13', 'Female', 'Student', '4D', 'Information Technology', 'First'),
('202210868', 'Cristel Nicole', 'S', 'Vergara', 'ic.cristelnicole.vergara@cvsu.edu.ph', 9234400863, '2003-06-21', 'Female', 'Student', '4D', 'Information Technology', 'First'),
('202210870', 'Xyrill John', 'Fecundo', 'Abreu', 'ic.xyrilljohn.abreu@cvsu.edu.ph', 9422169425, '08/03/2003', 'Female', 'Student', '4D', 'BSIT', 'FIRST'),
('20230003', 'Julia Ann', 'Sisno', 'Fajardo', 'ic.juliaann.fajardo@cvsu.edu.ph', 9679532083, '06/07/2001', 'Female', 'Professor', 'Not Applicable', 'Information Technology', 'Not Applicable');

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
-- Indexes for table `activity_drive_links`
--
ALTER TABLE `activity_drive_links`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_activity_student` (`activity_id`,`student_id`);

--
-- Indexes for table `activity_files`
--
ALTER TABLE `activity_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_activity_student` (`activity_id`,`student_id`);

--
-- Indexes for table `activity_grades`
--
ALTER TABLE `activity_grades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_activity_student` (`activity_ID`,`student_ID`),
  ADD KEY `student_ID` (`student_ID`);

--
-- Indexes for table `activity_submission_files`
--
ALTER TABLE `activity_submission_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activity_id` (`activity_id`);

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
-- Indexes for table `student_classes`
--
ALTER TABLE `student_classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_student_subject` (`student_ID`,`subject_code`),
  ADD KEY `subject_code` (`subject_code`);

--
-- Indexes for table `tracked_semester`
--
ALTER TABLE `tracked_semester`
  ADD PRIMARY KEY (`semesterID`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=98;

--
-- AUTO_INCREMENT for table `activity_drive_links`
--
ALTER TABLE `activity_drive_links`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `activity_files`
--
ALTER TABLE `activity_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `activity_grades`
--
ALTER TABLE `activity_grades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=447;

--
-- AUTO_INCREMENT for table `activity_submission_files`
--
ALTER TABLE `activity_submission_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `announcement_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `student_classes`
--
ALTER TABLE `student_classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

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
-- Constraints for table `activity_drive_links`
--
ALTER TABLE `activity_drive_links`
  ADD CONSTRAINT `activity_drive_links_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `activity_files`
--
ALTER TABLE `activity_files`
  ADD CONSTRAINT `activity_files_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `activity_grades`
--
ALTER TABLE `activity_grades`
  ADD CONSTRAINT `activity_grades_ibfk_1` FOREIGN KEY (`activity_ID`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `activity_grades_ibfk_2` FOREIGN KEY (`student_ID`) REFERENCES `tracked_users` (`tracked_ID`);

--
-- Constraints for table `activity_submission_files`
--
ALTER TABLE `activity_submission_files`
  ADD CONSTRAINT `activity_submission_files_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `attendance_ibfk_3` FOREIGN KEY (`student_ID`) REFERENCES `tracked_users` (`tracked_ID`);

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

--
-- Constraints for table `student_classes`
--
ALTER TABLE `student_classes`
  ADD CONSTRAINT `student_classes_ibfk_2` FOREIGN KEY (`subject_code`) REFERENCES `classes` (`subject_code`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_classes_ibfk_3` FOREIGN KEY (`student_ID`) REFERENCES `tracked_users` (`tracked_ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
