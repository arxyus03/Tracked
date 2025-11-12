-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 12, 2025 at 09:07 AM
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
  `school_work_edited` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`id`, `subject_code`, `professor_ID`, `activity_type`, `task_number`, `title`, `instruction`, `link`, `points`, `deadline`, `created_at`, `updated_at`, `archived`, `school_work_edited`) VALUES
(53, 'DQ1766', '202210602', 'Assignment', 'Assignment', 'Song lyricist', 'Create a musicalkhfilubawlb', '', 10, '2025-11-12 20:45:00', '2025-11-11 12:47:49', '2025-11-11 12:47:49', 0, 0),
(54, 'DQ1766', '202210602', 'Assignment', 'Assignment 2', 'Songerist', 'dubi dubi duwa', '', 20, '2025-11-13 20:58:00', '2025-11-11 12:58:14', '2025-11-11 13:15:59', 1, 0),
(55, 'DQ1766', '202210602', 'Assignment', 'Assignment 2', 'Songerist', 'dubi dubi duwa', '', 20, '2025-11-13 20:58:00', '2025-11-11 12:58:18', '2025-11-11 13:15:54', 1, 0),
(56, 'DQ1766', '202210602', 'Activity', 'Activity 1', 'Dance and Sing', 'Sing along with Elsa.', '', 30, '2025-11-14 22:52:00', '2025-11-11 14:52:26', '2025-11-11 14:52:26', 0, 0),
(57, 'DQ1766', '202210602', 'Project', 'Project 1', 'Idol Project', 'Do a concert', '', 50, '2025-11-14 23:06:00', '2025-11-11 15:06:31', '2025-11-11 15:06:31', 0, 0),
(58, 'DQ1766', '202210602', 'Laboratory', 'Laboratory 1', 'Lab Live', 'work as a team and produce a concert worthy of your fans', '', 50, '2025-11-17 06:42:00', '2025-11-11 22:42:15', '2025-11-11 22:42:15', 0, 0),
(59, 'DQ1766', '202210602', 'Assignment', 'Assignment 5', 'Cover Up', 'Produce a cover song of a famous song', '', 30, '2025-11-19 07:40:00', '2025-11-11 23:40:19', '2025-11-11 23:40:19', 0, 0),
(60, 'DQ1766', '202210602', 'Laboratory', 'Laboratory 2', 'Anonymous Concerto', 'Produce your own concert without the help of your agency', '', 30, '2025-11-20 08:04:00', '2025-11-12 00:04:55', '2025-11-12 00:04:55', 0, 0),
(61, 'DQ1766', '202210602', 'Laboratory', 'Laboratory 3', 'Actingerist', 'Be more than just an Idol', '', 50, '2025-11-15 09:06:00', '2025-11-12 01:06:08', '2025-11-12 01:06:08', 0, 0),
(62, 'DQ1766', '202210602', 'Laboratory', 'Laboratory 4', 'Musical Heart', 'Create a song that brings out your soul', '', 40, '2025-11-18 09:39:00', '2025-11-12 01:39:20', '2025-11-12 01:39:20', 0, 0),
(63, 'DQ1766', '202210602', 'Laboratory', 'Laboratory 5', 'Dance the night away', 'Produce a dance concert under the moonlight using the custom Lily pad lake stage', '', 60, '2025-11-18 10:20:00', '2025-11-12 02:20:45', '2025-11-12 02:20:45', 0, 0);

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
(317, 53, '202210718', 10.00, 1, '2025-11-11 12:57:28', 0, '2025-11-11 12:56:36', '2025-11-11 12:57:28'),
(319, 55, '202210718', 0.00, 0, NULL, 0, '2025-11-11 13:03:48', '2025-11-11 13:07:47'),
(321, 54, '202210718', NULL, 0, NULL, 0, '2025-11-11 13:03:48', '2025-11-11 13:03:48'),
(323, 56, '202210718', NULL, 0, NULL, 0, '2025-11-11 15:05:11', '2025-11-11 15:05:11'),
(325, 57, '202210718', NULL, 0, NULL, 0, '2025-11-11 15:06:31', '2025-11-11 15:06:31'),
(327, 58, '202210718', NULL, 0, NULL, 0, '2025-11-11 22:42:15', '2025-11-11 22:42:15'),
(329, 59, '202210718', NULL, 0, NULL, 0, '2025-11-11 23:40:19', '2025-11-11 23:40:19'),
(331, 60, '202210718', NULL, 0, NULL, 0, '2025-11-12 00:04:55', '2025-11-12 00:04:55'),
(333, 61, '202210718', NULL, 0, NULL, 0, '2025-11-12 01:06:08', '2025-11-12 01:06:08'),
(335, 62, '202210718', NULL, 0, NULL, 0, '2025-11-12 01:39:20', '2025-11-12 01:39:20'),
(337, 63, '202210718', 50.00, 1, '2025-11-12 06:42:02', 0, '2025-11-12 02:20:45', '2025-11-12 06:42:02');

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
(15, '202210602', 'DQ1766', 'SIngerist', 'Baby SHark doo doo', NULL, '2025-11-19 14:43:00', '2025-11-12 06:43:48', '2025-11-12 06:43:48');

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
(43, 'DQ1766', '202210602', '2025-11-12', '202210718', 'present', '2025-11-12 06:42:44', '2025-11-12 06:42:44');

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
('DQ1766', '1st Year', 'Song Class', 'A', '202210602', '2025-11-11 07:21:11', '2025-11-11 07:21:11', 'Active');

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
(8, '202210718', 'DQ1766', '2025-11-11 07:29:15', 0, NULL);

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tracked_users`
--

INSERT INTO `tracked_users` (`tracked_ID`, `tracked_Role`, `tracked_email`, `tracked_password`, `tracked_firstname`, `tracked_lastname`, `tracked_middlename`, `tracked_program`, `tracked_yearandsec`, `tracked_semester`, `tracked_bday`, `tracked_gender`, `tracked_phone`, `tracked_Status`, `created_at`, `updated_at`) VALUES
('12345', 'Admin', 'ic.brielle.balatayo@cvsu.edu.ph', '$2y$10$B3yrvzrWdNFmq.e0rS/u6eVStEKlWSPpv/idHypuZhPQoWgi5oCy2', 'Brielle Edrian', 'Balatayo', 'Ana', 'Not Applicable', 'Not Applicable', 'Not Applicable', '2002-08-18', 'Male', '9153406553', 'Active', '2025-11-10 18:51:38', '2025-11-12 07:55:29'),
('202210602', 'Professor', 'ic.dhenizekristafaith.lopez@cvsu.edu.ph', '$2y$10$6H/SCZLMwlKwVb2ellhE8OJ4D154dE8MWKUrGWeKoQ0mmNClE3Qbe', 'Dhenize Krista Faith', 'Lopez', 'Cabardo', 'Information Technology', 'Not Applicable', 'Not Applicable', '2004-11-24', 'Male', '9988262316', 'Active', '2025-11-10 18:51:38', '2025-11-12 07:55:34'),
('202210718', 'Student', 'ic.michaelrhoi.gonzales@cvsu.edu.ph', '$2y$10$IzdNzXPizuoPIR3oWMvbC.igOyWkjUVq6yFm6F1O1b/LY1ITDw7XK', 'Michael Rhoi', 'Gonzales', 'Ladrica', 'BSIT', '4D', 'FIRST', '2004-06-20', 'Female', '9085527790', 'Active', '2025-11-12 06:13:21', '2025-11-12 07:55:42'),
('202210784', 'Student', 'ic.jeannen.basay@cvsu.edu.ph', '$2y$10$QwgY/r6MrhcjlMZg5DzcIur12fgtBo2Jo4Owp4opMUvAQ9hhyspiS', 'Jeannen', 'Basay', 'Kummer', 'BSIT', '4D', 'SECOND', '2002-03-24', 'Female', '0', 'Active', '2025-11-10 18:51:38', '2025-11-12 07:55:51'),
('202210870', 'Student', 'ic.xyrilljohn.abreu@cvsu.edu.ph', '$2y$10$gDY1LQreqxfD/UIiE19/weHxN.jWIsMuwpg8HUqowO9tvujhKAu8W', 'Xyrill John', 'Abreu', 'Fecundo', 'BSIT', '4D', 'FIRST', '2003-08-03', 'Female', '9422169425', 'Active', '2025-11-10 18:51:39', '2025-11-12 07:55:59'),
('20230003', 'Professor', 'ic.juliaann.fajardo@cvsu.edu.ph', '$2y$10$fJcns6eh3Xh0SJVF6mSxOeuLN0cVtmUvqiOoS4MiAOSY7BUSXkCeu', 'Julia Ann', 'Fajardo', 'Sisno', 'Information Technology', 'Not Applicable', 'Not Applicable', '2001-06-07', 'Female', '9679532083', 'Active', '2025-11-10 18:51:39', '2025-11-12 07:56:08');

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
('12345', 'Brielle Edrian', 'Ana', 'Balatayo', 'ic.brielle.balatayo@cvsu.edu.ph', 9153406553, '08/18/2002', 'Male', 'Admin', 'Not Applicable', 'Not Applicable', 'Not Applicable'),
('202210602', 'Dhenize Krista Faith', 'Cabardo', 'Lopez', 'ic.dhenizekristafaith.lopez@cvsu.edu.ph', 9988262316, '11/24/2004', 'Male', 'Professor', 'Not Applicable', 'Information Technology', 'Not Applicable'),
('202210718', 'Michael Rhoi', 'Ladrica', 'Gonzales', 'ic.michaelrhoi.gonzales@cvsu.edu.ph', 9085527790, '06/20/2004', 'Female', 'Student', '4D', 'BSIT', 'FIRST'),
('202210784', 'Jeannen', 'Kummer', 'Basay', 'ic.jeannen.basay@cvsu.edu.ph', 0, '03/24/2002', 'Female', 'Student', '4D', 'BSIT', 'SECOND'),
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
-- Indexes for table `student_classes`
--
ALTER TABLE `student_classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_student_subject` (`student_ID`,`subject_code`),
  ADD KEY `subject_code` (`subject_code`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT for table `activity_grades`
--
ALTER TABLE `activity_grades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=339;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `announcement_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `student_classes`
--
ALTER TABLE `student_classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

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

--
-- Constraints for table `student_classes`
--
ALTER TABLE `student_classes`
  ADD CONSTRAINT `student_classes_ibfk_1` FOREIGN KEY (`student_ID`) REFERENCES `users` (`user_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_classes_ibfk_2` FOREIGN KEY (`subject_code`) REFERENCES `classes` (`subject_code`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
