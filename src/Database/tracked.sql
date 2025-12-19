-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Dec 10, 2025 at 10:31 AM
-- Server version: 11.8.3-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u713320770_tracked`
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
(79, 'LY0391', '202210602', 'Assignment', '1', 'Assignment #1', '', '', 100, '2025-12-04 17:33:00', '2025-12-03 09:34:17', '2025-12-03 09:34:17', 0, 0),
(80, 'LY0391', '202210602', 'Quiz', '1', 'Quiz #1', '', '', 100, '2025-12-04 17:33:00', '2025-12-03 09:35:01', '2025-12-03 09:35:01', 0, 0),
(81, 'LY0391', '202210602', 'Activity', '1', 'Activity #1', '', '', 100, '2025-12-04 17:33:00', '2025-12-03 09:35:32', '2025-12-03 09:35:32', 0, 0),
(82, 'LY0391', '202210602', 'Project', '1', 'Project #1', '', '', 100, '2025-12-04 17:33:00', '2025-12-03 09:35:57', '2025-12-03 09:35:57', 0, 0),
(83, 'LY0391', '202210602', 'Laboratory', '1', 'Laboratory #1', '', '', 100, '2025-12-04 17:33:00', '2025-12-03 09:36:21', '2025-12-03 09:36:21', 0, 0),
(84, 'DF1710', '202210602', 'Assignment', '1', 'Assignment #1', '', '', 100, '2025-12-04 17:43:00', '2025-12-03 09:43:22', '2025-12-03 09:43:22', 0, 0),
(85, 'DF1710', '202210602', 'Quiz', '1', 'Quiz #1', '', '', 100, '2025-12-04 17:43:00', '2025-12-03 09:45:06', '2025-12-03 09:45:06', 0, 0),
(86, 'DF1710', '202210602', 'Activity', '1', 'Activity #1', '', '', 100, '2025-12-04 17:43:00', '2025-12-03 09:45:38', '2025-12-03 09:45:38', 0, 0),
(87, 'DF1710', '202210602', 'Project', '1', 'Project #1', '', '', 100, '2025-12-04 17:43:00', '2025-12-03 09:46:01', '2025-12-03 09:46:01', 0, 0),
(88, 'DF1710', '202210602', 'Laboratory', '1', 'Laboratory #1', '', '', 100, '2025-12-04 17:43:00', '2025-12-03 09:46:29', '2025-12-03 09:46:29', 0, 0),
(89, 'DF1710', '202210602', 'Assignment', '2', 'Assignment #2', '', '', 99, '2025-12-05 17:51:00', '2025-12-03 09:51:33', '2025-12-03 09:51:33', 0, 0),
(90, 'ZM6922', '1035', 'Assignment', '1', 'Introduction to API', 'build a small REST API. keep it simple but clear.\n\nmake an API that lets a user create, read, update, and delete items. you can choose the item type. for example: tasks, notes, products, movies.', '', 20, '2025-12-08 12:23:00', '2025-12-04 02:25:22', '2025-12-04 02:25:22', 0, 0),
(91, 'ZM6922', '1035', 'Quiz', '1', 'API Quiz', 'API Quiz', '', 20, '2025-12-04 10:27:00', '2025-12-04 02:26:35', '2025-12-04 02:26:35', 0, 0),
(92, 'SJ1849', '202210602', 'Assignment', '1', 'Sample', 'SAMPLE INSTRUCTION', 'https://www.youtube.com/shorts/wpC-uHqhqso', 50, '2025-12-05 16:23:00', '2025-12-04 08:25:02', '2025-12-04 08:26:33', 0, 1);

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
  `file_url` varchar(500) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `uploaded_by` varchar(50) DEFAULT 'professor',
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_files`
--

INSERT INTO `activity_files` (`id`, `activity_id`, `student_id`, `file_name`, `original_name`, `file_url`, `file_size`, `file_type`, `uploaded_by`, `uploaded_at`) VALUES
(36, 89, '202210718', '1764823654_693112667633b_Screenshot_20251204-122700.png', 'Screenshot_20251204-122700.png', 'https://tracked.6minds.site/TrackEd_Uploads/To_Students/1764823654_693112667633b_Screenshot_20251204-122700.png', 235295, 'image/png', 'student', '2025-12-04 04:47:34');

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
  `uploaded_file_url` varchar(500) DEFAULT NULL,
  `uploaded_file_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_grades`
--

INSERT INTO `activity_grades` (`id`, `activity_ID`, `student_ID`, `grade`, `submitted`, `submitted_at`, `late`, `created_at`, `updated_at`, `uploaded_file_url`, `uploaded_file_name`) VALUES
(401, 79, '202210870', 75.00, 1, '2025-12-03 09:37:20', 0, '2025-12-03 09:34:17', '2025-12-03 09:37:20', NULL, NULL),
(402, 79, '202210838', 50.00, 1, '2025-12-03 09:37:20', 0, '2025-12-03 09:34:17', '2025-12-03 09:37:20', NULL, NULL),
(403, 79, '202210718', 100.00, 1, '2025-12-03 09:37:20', 0, '2025-12-03 09:34:17', '2025-12-03 09:37:20', NULL, NULL),
(404, 80, '202210870', 55.00, 1, '2025-12-03 09:37:36', 0, '2025-12-03 09:35:01', '2025-12-03 09:37:36', NULL, NULL),
(405, 80, '202210838', 100.00, 1, '2025-12-03 09:37:36', 0, '2025-12-03 09:35:01', '2025-12-03 09:37:36', NULL, NULL),
(406, 80, '202210718', 76.00, 1, '2025-12-03 09:37:36', 0, '2025-12-03 09:35:01', '2025-12-03 09:37:36', NULL, NULL),
(407, 81, '202210870', 100.00, 1, '2025-12-03 09:37:48', 0, '2025-12-03 09:35:32', '2025-12-03 09:37:49', NULL, NULL),
(408, 81, '202210838', 10.00, 1, '2025-12-03 09:37:48', 0, '2025-12-03 09:35:32', '2025-12-03 09:37:49', NULL, NULL),
(409, 81, '202210718', 95.00, 1, '2025-12-03 09:37:48', 0, '2025-12-03 09:35:32', '2025-12-03 09:37:49', NULL, NULL),
(410, 82, '202210870', 60.00, 1, '2025-12-03 09:38:04', 0, '2025-12-03 09:35:57', '2025-12-03 09:38:04', NULL, NULL),
(411, 82, '202210838', 75.00, 1, '2025-12-03 09:38:04', 0, '2025-12-03 09:35:57', '2025-12-03 09:38:04', NULL, NULL),
(412, 82, '202210718', 100.00, 1, '2025-12-03 09:38:04', 0, '2025-12-03 09:35:57', '2025-12-03 09:38:04', NULL, NULL),
(413, 83, '202210870', NULL, 0, NULL, 0, '2025-12-03 09:36:21', '2025-12-03 09:36:21', NULL, NULL),
(414, 83, '202210838', NULL, 0, NULL, 0, '2025-12-03 09:36:21', '2025-12-03 09:36:21', NULL, NULL),
(415, 83, '202210718', NULL, 0, NULL, 0, '2025-12-03 09:36:21', '2025-12-03 09:36:21', NULL, NULL),
(425, 84, '202210870', 10.00, 1, '2025-12-03 09:46:54', 0, '2025-12-03 09:43:22', '2025-12-03 09:46:54', NULL, NULL),
(426, 84, '202210838', 100.00, 1, '2025-12-03 09:46:54', 0, '2025-12-03 09:43:22', '2025-12-03 09:46:54', NULL, NULL),
(427, 84, '202210718', 50.00, 1, '2025-12-03 09:46:54', 0, '2025-12-03 09:43:22', '2025-12-03 09:46:54', NULL, NULL),
(428, 85, '202210870', 100.00, 1, '2025-12-03 09:47:05', 0, '2025-12-03 09:45:06', '2025-12-03 09:47:05', NULL, NULL),
(429, 85, '202210838', 75.00, 1, '2025-12-03 09:47:05', 0, '2025-12-03 09:45:06', '2025-12-03 09:47:05', NULL, NULL),
(430, 85, '202210718', 50.00, 1, '2025-12-03 09:47:05', 0, '2025-12-03 09:45:06', '2025-12-03 09:47:05', NULL, NULL),
(431, 86, '202210870', 100.00, 1, '2025-12-03 09:47:16', 0, '2025-12-03 09:45:38', '2025-12-03 09:47:16', NULL, NULL),
(432, 86, '202210838', 88.00, 1, '2025-12-03 09:47:16', 0, '2025-12-03 09:45:38', '2025-12-03 09:47:16', NULL, NULL),
(433, 86, '202210718', 79.00, 1, '2025-12-03 09:47:16', 0, '2025-12-03 09:45:38', '2025-12-03 09:47:16', NULL, NULL),
(434, 87, '202210870', 100.00, 1, '2025-12-03 09:48:00', 0, '2025-12-03 09:46:01', '2025-12-03 09:48:00', NULL, NULL),
(435, 87, '202210838', 90.00, 1, '2025-12-03 09:48:00', 0, '2025-12-03 09:46:01', '2025-12-03 09:48:00', NULL, NULL),
(436, 87, '202210718', 55.00, 1, '2025-12-03 09:48:00', 0, '2025-12-03 09:46:01', '2025-12-03 09:48:00', NULL, NULL),
(437, 88, '202210870', 100.00, 1, '2025-12-03 09:48:14', 0, '2025-12-03 09:46:29', '2025-12-03 09:48:14', NULL, NULL),
(438, 88, '202210838', 87.00, 1, '2025-12-03 09:48:14', 0, '2025-12-03 09:46:29', '2025-12-03 09:48:14', NULL, NULL),
(439, 88, '202210718', 56.00, 1, '2025-12-03 09:48:14', 0, '2025-12-03 09:46:29', '2025-12-03 09:48:14', NULL, NULL),
(455, 89, '202210870', 85.00, 1, '2025-12-03 09:52:07', 0, '2025-12-03 09:51:33', '2025-12-03 09:52:07', NULL, NULL),
(456, 89, '202210838', 99.00, 1, '2025-12-03 09:52:07', 0, '2025-12-03 09:51:33', '2025-12-03 09:52:07', NULL, NULL),
(457, 89, '202210718', 90.00, 1, '2025-12-04 04:47:34', 0, '2025-12-03 09:51:33', '2025-12-04 04:47:34', 'https://tracked.6minds.site/TrackEd_Uploads/To_Students/1764823654_693112667633b_Screenshot_20251204-122700.png', 'Screenshot_20251204-122700.png'),
(461, 92, '202210870', 49.00, 1, '2025-12-04 08:29:59', 0, '2025-12-04 08:25:02', '2025-12-04 08:30:26', 'https://tracked.6minds.site/TrackEd_Uploads/To_Students/1764836999_693146870b77e_Capstone_TrackED.pdf', 'Capstone_TrackED.pdf');

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
(18, '202210602', 'LY0391', 'Presentation', 'For Presentation Use', NULL, '2025-12-04 17:26:00', '2025-12-03 09:27:32', '2025-12-03 09:27:32'),
(19, '1035', 'ZM6922', 'Capstone Presentation', 'The defense will begin at 8 a.m. (call time is 7:30 a.m.), and each group will have 30–45 minutes to present. This means that being late is not allowed. Any group that arrives late will have their presentation time reduced. Please also ensure that the succeeding groups are already on standby one hour before their scheduled time.\n\nWhat the students will bring for the final defense:\n• Their system (with their own internet connection)\n• Hardware and move in/out forms (if applicable)\n• PPT presentation\n• 3 copies of printed documents\n• 5 copies of filled-out evaluation forms\n• Food/token for the panel\n• Their courage and commitment!\n\nRegarding the food or tokens for the panelists, the advisers will discuss it with their respective groups.\n\nThank you po and God bless.😊', NULL, '2025-12-04 12:00:00', '2025-12-04 02:13:26', '2025-12-04 02:13:26');

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
(72, 'LY0391', '202210602', '2025-12-03', '202210718', 'present', '2025-12-03 09:33:42', '2025-12-03 09:33:42'),
(73, 'LY0391', '202210602', '2025-12-03', '202210838', 'present', '2025-12-03 09:33:42', '2025-12-03 09:33:42'),
(74, 'LY0391', '202210602', '2025-12-03', '202210870', 'present', '2025-12-03 09:33:42', '2025-12-03 09:33:42'),
(78, 'DF1710', '202210602', '2025-12-03', '202210718', 'present', '2025-12-03 09:48:40', '2025-12-03 09:48:40'),
(79, 'DF1710', '202210602', '2025-12-03', '202210838', 'present', '2025-12-03 09:48:40', '2025-12-03 09:48:40'),
(80, 'DF1710', '202210602', '2025-12-03', '202210870', 'present', '2025-12-03 09:48:40', '2025-12-03 09:48:40'),
(81, 'SJ1849', '202210602', '2025-12-04', '202210870', 'present', '2025-12-04 08:32:18', '2025-12-04 08:32:18');

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
('CH0445', '4th Year', 'DCIT101', 'second_sem', 'A', '202210602', '2025-12-03 09:17:29', '2025-12-03 09:17:38', 'Archived'),
('DF1710', '4th Year', 'DCIT101', 'FIRST SEMESTER', 'B', '202210602', '2025-12-03 09:26:25', '2025-12-03 09:26:25', 'Active'),
('LY0391', '4th Year', 'DCIT101', 'FIRST SEMESTER', 'A', '202210602', '2025-12-03 09:25:50', '2025-12-03 09:25:50', 'Active'),
('MB6161', '4th Year', 'DCIT101', 'first_sem', 'A', '202210602', '2025-12-03 09:24:49', '2025-12-03 09:25:38', 'Archived'),
('SJ1849', '4th Year', 'ITEC90', 'FIRST SEMESTER', 'D', '202210602', '2025-12-04 08:23:00', '2025-12-04 08:23:00', 'Active'),
('ZM6922', '4th Year', 'ITEC116', 'FIRST SEMESTER', 'D', '1035', '2025-12-04 02:07:26', '2025-12-04 02:07:26', 'Active');

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
(15, '202210808', 'e15bea4364e9511c2cd23ce3b25544ebf8084c46476611071a6697f76ef26b3b', '2025-12-04 13:51:54', 1, '2025-12-03 13:00:17');

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
(20, '202210870', 'LY0391', '2025-12-03 09:30:40', 0, NULL),
(21, '202210838', 'LY0391', '2025-12-03 09:33:26', 0, NULL),
(22, '202210718', 'LY0391', '2025-12-03 09:33:28', 0, NULL),
(23, '202210870', 'DF1710', '2025-12-03 09:30:40', 0, '0000-00-00 00:00:00'),
(24, '202210838', 'DF1710', '2025-12-03 09:30:40', 0, '0000-00-00 00:00:00'),
(25, '202210718', 'DF1710', '2025-12-03 09:30:40', 0, '0000-00-00 00:00:00'),
(26, '202210609', 'DF1710', '2025-12-03 10:51:52', 0, NULL),
(27, '202210625', 'DF1710', '2025-12-03 10:53:20', 0, NULL),
(28, '202210625', 'LY0391', '2025-12-03 10:53:28', 0, NULL),
(29, '202210784', 'DF1710', '2025-12-03 10:54:08', 0, NULL),
(30, '202210784', 'LY0391', '2025-12-03 10:54:15', 0, NULL),
(31, '202210781', 'DF1710', '2025-12-03 10:54:57', 0, NULL),
(32, '202210781', 'LY0391', '2025-12-03 10:55:05', 0, NULL),
(33, '202210808', 'DF1710', '2025-12-03 10:55:57', 0, NULL),
(34, '202210808', 'LY0391', '2025-12-03 10:56:07', 0, NULL),
(35, '202210834', 'DF1710', '2025-12-03 11:11:02', 0, NULL),
(36, '202210834', 'LY0391', '2025-12-03 11:11:09', 0, NULL),
(37, '202210836', 'DF1710', '2025-12-03 11:11:44', 0, NULL),
(38, '202210836', 'LY0391', '2025-12-03 11:11:58', 0, NULL),
(39, '202210870', 'SJ1849', '2025-12-04 08:23:28', 0, NULL);

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
(3, 'SUMMER SEMESTER', 'INACTIVE');

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
('080806', 'Admin', 'ic.brielle.balatayo@cvsu.edu.ph', '$2y$10$g4Fm5KBCn0343QdT2UqcEuQmV.BHS3Q3UXfZbZhIQi7T.WGExiLTu', 'Brielle Edrian', 'Balatayo', 'Ana', 'Not Applicable', 'Not Applicable', 'Not Applicable', '2002-08-18', 'Male', '9153406553', 'Active', '2002-08-18Admin', '2025-12-03 09:04:16', '2025-12-10 10:21:57'),
('1035', 'Professor', 'sherilyn.fajutagana@cvsu.edu.ph', '$2y$10$AFU5ft./tf9Zs89hjHAWY.H2cJkRGNXP1JZ8JGpIooSeCKuLcE.TO', 'Sherilyn', 'Fajutagana', 'Fontelo', 'Information Technology', 'Not Applicable', 'Not Applicable', '1993-08-15', 'Female', '9933302365', 'Active', '1993-08-15Professor10350WJ', '2025-12-03 09:04:12', '2025-12-04 05:05:13'),
('202111683', 'Student', 'ic.noerjan.cleofe@cvsu.edu.ph', '$2y$10$q8aWgFVFrLfAPU796JAOb.SZ.Scns/7cZhppPB5pJ1D4NWJ829MeC', 'Noerjan', 'Cleofe', 'Catayong', 'Information Technology', '4D', 'FIRST', '2002-10-17', 'Male', '91234567891', 'Active', '2002-10-17Student202111683S8P', '2025-12-03 09:04:16', '2025-12-04 05:05:18'),
('202210602', 'Professor', 'ic.dhenizekristafaith.lopez@cvsu.edu.ph', '$2y$10$t1qKXZGiO0a6bJchB5RrHO9F3O15.eA8he45uHkqqEkLLzmxDnhh2', 'Dhenize Krista Faith', 'Lopez', 'Cabardo', 'Information Technology', 'Not Applicable', 'Not Applicable', '2004-11-24', 'Male', '9988262316', 'Active', '11242004Professor2022106024EG', '2025-12-03 09:04:20', '2025-12-04 06:15:46'),
('202210609', 'Student', 'ic.matthewkeane.mariano@cvsu.edu.ph', '$2y$10$1AWwTpZItqOpc0O1RHYVn.gWsI/IV1n67kez7cC0f.h5BRGs2o862', 'Matthew Keane', 'Mariano', 'Yap', 'Information Technology', '4D', 'FIRST', '2002-10-29', 'Male', '91234567891', 'Active', '2002-10-29Student202210609ZQB', '2025-12-03 09:04:23', '2025-12-04 05:05:25'),
('202210625', 'Student', 'ic.kenclarence.orosco@cvsu.edu.ph', '$2y$10$p5r/cmMbsVBPhikg3SyYWeluHqZphy.bXX/FuT2g4ho1ApdyjqQNG', 'Ken Clarence', 'Orosco', 'Roque', 'Information Technology', '4D', 'FIRST', '2003-12-23', 'Male', '91234567891', 'Active', '2003-12-23Student202210625Q6F', '2025-12-03 09:04:26', '2025-12-04 05:05:29'),
('202210631', 'Student', 'ic.marcedlin.pasquin.cvsu.edu.ph', '$2y$10$l806Bwa7JXDy05eKt6WjzeUx7QjPCRjdfHl9Yqz2QP2FT1.lcTizK', 'Marc Edlin', 'Pasquin', 'Reyes', 'Information Technology', '4D', 'FIRST', '2003-12-02', 'Male', '91234567891', 'Active', '2003-12-02Student20221063131G', '2025-12-03 09:04:30', '2025-12-04 05:05:32'),
('202210669', 'Student', 'ic.geruel.alcaraz@cvsu.edu.ph', '$2y$10$JKf0RJBXVlNc4GfkpOi6c.NA43pF.wo6ulk0IVYQ993x/67wt1yca', 'Geruel', 'Alcaraz', 'Hilado', 'Information Technology', '4G', 'FIRST', '2002-12-09', 'Male', '91234567891', 'Active', '2002-12-09Student202210669QK1', '2025-12-03 09:04:30', '2025-12-04 05:05:32'),
('202210700', 'Student', 'ic.johncarmichael.delosreyes@cvsu.edu.ph', '$2y$10$CvxZhnCFx/l.cIXcGAfe/epbNyMCR6uUrmhYn8GRZBsqC..B3H.8m', 'John Car Michael', 'Delos Reyes', 'Delos Santos', 'Information Technology', '4G', 'FIRST', '2002-05-18', 'Male', '91234567891', 'Active', '2002-05-18Student202210700HLR', '2025-12-03 09:04:33', '2025-12-04 05:05:35'),
('202210718', 'Student', 'ic.michaelrhoi.gonzales@cvsu.edu.ph', '$2y$10$iG8mD2BKDjg/vftUtYpKEOXwXxC1zeWIhK.FcAz236HFJHtJKd10O', 'Michael Rhoi', 'Gonzales', 'Ladrica', 'Information Technology', '4D', 'FIRST', '2004-06-20', 'Female', '9085527790', 'Active', '06202004Student20221071868Q', '2025-12-03 09:04:36', '2025-12-04 06:00:21'),
('202210781', 'Student', 'ic.cherlyvic.bakilid@cvsu.edu.ph', '$2y$10$KxGbbQPvNaR5agBvNZ2HeuZa5Qr2JdY/c0MgGvnNuD/MCQxo/1Tt.', 'Cherly Vic', 'Bakilid', 'C', 'Information Technology', '4F', 'FIRST', '2002-11-17', 'Female', '9168773102', 'Active', '2002-11-17Student2022107819E3', '2025-12-03 09:04:40', '2025-12-04 09:02:05'),
('202210784', 'Student', 'ic.jeannen.basay@cvsu.edu.ph', '$2y$10$/F6PGAfJN6Z9VLmXEjfZkebkQ9DVgKGB4qj7Q5/EaevJKtlUXNHyG', 'Jeannen', 'Basay', 'Kummer', 'Information Technology', '4F', 'FIRST', '2002-03-24', 'Female', '0', 'Active', '03242002Student202210784TFR', '2025-12-03 09:04:43', '2025-12-04 05:05:45'),
('202210808', 'Student', 'ic.walidbinsaid.dimao@cvsu.edu.ph', '$2y$10$yRX5DP6A4gT2l6n9eGrNg.fICNUyq62OQG40sfubxJTEo/g8Td3fW', 'Walid Binsaid', 'Dimao', 'Lucman', 'Information Technology', '4E', 'FIRST', '2003-05-18', 'Male', '91234567891', 'Active', '2003-05-18Student202210808BFW', '2025-12-03 09:04:46', '2025-12-04 05:05:49'),
('202210834', 'Student', 'ic.shaunrusselle.obsenares@cvsu.edu.ph', '$2y$10$45mVFgb2/3INN05XTgWJFOnXk.nf0yoMD0XxH9W8jyCyz9oZBF296', 'Shaun Russelle', 'Obseñares', 'Merano', 'Information Technology', '4E', 'FIRST', '2002-07-31', 'Male', '91234567891', 'Active', '2002-07-31Student202210834EQ8', '2025-12-03 09:04:49', '2025-12-04 05:05:53'),
('202210836', 'Student', 'ic.ferdinand.olaira@cvsu.edu.ph', '$2y$10$jNoL/NqcF7Iu0lqIvw94oObTeb987iT0kWdCh/qf1di.Xh1NSXS.6', 'Ferdinand', 'Olaira', 'Villamor', 'Information Technology', '4D', 'FIRST', '2004-12-04', 'Male', '91234567891', 'Active', '2004-12-04Student202210836C5Q', '2025-12-03 09:04:53', '2025-12-04 05:05:57'),
('202210838', 'Student', 'ic.katejustine.pades@cvsu.edu.ph', '$2y$10$P8bdWUu0JUkdypvuTx8PbOecT6gzeCWjI5KlUxh0M3iW220fWrUWW', 'Kate Justine', 'Pades', 'B', 'Information Technology', '4D', 'FIRST', '2003-05-13', 'Female', '9777429816', 'Active', '2003-05-13Student20221083829U', '2025-12-03 09:04:56', '2025-12-04 05:06:00'),
('202210844', 'Student', 'ic.reween.rambonanza@cvsu.edu.ph', '$2y$10$yiQKslghg7B4LcGZ7lc9nOgdmoMAJsco.kr3J2r8BSa2D00j4r0K6', 'Reween', 'Rambonanza', 'Ocampo', 'Information Technology', '4C', 'FIRST', '2000-12-25', 'Male', '91234567891', 'Active', '2000-12-25Student202210844NO8', '2025-12-03 09:04:59', '2025-12-04 05:06:04'),
('202210867', 'Student', 'ic.erwin.vallez@cvsu.edu.ph', '$2y$10$2gZ1v/4B1i1GKJZI3o3hOOPiPggg3F6tSC73ASn5u0SnVEyLat8Sy', 'Erwin', 'Vallez', 'Manalo', 'Information Technology', '4C', 'FIRST', '2003-11-24', 'Male', '91234567891', 'Active', '2003-11-24Student202210867TFM', '2025-12-03 09:05:03', '2025-12-04 05:06:07'),
('202210868', 'Student', 'ic.cristelnicole.vergara@cvsu.edu.ph', '$2y$10$ugvqRzbJRQ423jGX4wbVy.loWm4EqFn7z7K5Zp0gUCfarTBuvzyUS', 'Cristel Nicole', 'Vergara', 'S', 'Information Technology', '4B', 'First', '2003-06-21', 'Female', '9234400863', 'Active', '2003-06-21Student202210868AB1', '2025-12-03 09:05:06', '2025-12-04 05:06:10'),
('202210870', 'Student', 'ic.xyrilljohn.abreu@cvsu.edu.ph', '$2y$10$jN6jA2Jd2bylgd5YFODUH.d4EZOOVQiq9jQrOCXikCAd7CkWkePFW', 'Xyrill John', 'Abreu', 'Fecundo', 'Information Technology', '4B', 'FIRST', '2003-08-03', 'Female', '9422169425', 'Active', '08032003Student202210870H0D', '2025-12-03 09:05:09', '2025-12-04 08:08:13'),
('202210881', 'Student', 'ic.gerandyernest.buensuceso@cvsu.edu.ph', '$2y$10$zFUCGBAnFkJDquE9/UkHqes9SW/2TZtjQfZWoCRX4AZhTfzpv5L66', 'Gerandy Ernest', 'Buensuceso', 'Jamanila', 'Information Technology', '4A', 'FIRST', '2004-12-09', 'Male', '91234567891', 'Active', '2004-12-09Student202210881ZX0', '2025-12-03 09:05:12', '2025-12-04 05:06:17'),
('202211199', 'Student', 'ic.desalit.jeann@cvsu.edu.ph', '$2y$10$Co1j1AI.ZeSC/UCaJOy/Sus9WLgp97wCAeqg1jSJmKJSqd4kLPVvG', 'Jeann', 'Desalit', 'Boaw', 'Information Technology', '4A', 'FIRST', '2002-01-07', 'Female', '91234567891', 'Active', '2002-01-07Student2022111990R2', '2025-12-03 09:05:16', '2025-12-04 05:06:20'),
('20230003', 'Student', 'ic.juliaann.fajardo@cvsu.edu.ph', '$2y$10$KV3l3Llo8izhWkXBwWekp.cNvPGHEAQ05ICkKopYmt2t7HiRvQ/vW', 'Julia Ann', 'Fajardo', 'Sisno', 'Information Technology', '4A', 'FIRST', '2001-06-07', 'Female', '9679532083', 'Active', '06072001Student20230003NB3', '2025-12-03 09:05:19', '2025-12-04 05:06:24');

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
('202111683', 'Noerjan', 'Catayong', 'Cleofe', 'ic.noerjan.cleofe@cvsu.edu.ph', 91234567891, '2002-10-17', 'Male', 'Student', '4D', 'Information Technology', 'FIRST'),
('202210602', 'Dhenize Krista Faith', 'Cabardo', 'Lopez', 'ic.dhenizekristafaith.lopez@cvsu.edu.ph', 9988262316, '11/24/2004', 'Male', 'Professor', 'Not Applicable', 'Information Technology', 'Not Applicable'),
('202210609', 'Matthew Keane', 'Yap', 'Mariano', 'ic.matthewkeane.mariano@cvsu.edu.ph', 91234567891, '2002-10-29', 'Male', 'Student', '4D', 'Information Technology', 'FIRST'),
('202210625', 'Ken Clarence', 'Roque', 'Orosco', 'ic.kenclarence.orosco@cvsu.edu.ph', 91234567891, '2003-12-23', 'Male', 'Student', '4D', 'Information Technology', 'FIRST'),
('202210631', 'Marc Edlin', 'Reyes', 'Pasquin', 'ic.marcedlin.pasquin.cvsu.edu.ph', 91234567891, '2003-12-02', 'Male', 'Student', '4D', 'Information Technology', 'FIRST'),
('202210669', 'Geruel', 'Hilado', 'Alcaraz', 'ic.geruel.alcaraz@cvsu.edu.ph', 91234567891, '2002-12-09', 'Male', 'Student', '4G', 'Information Technology', 'FIRST'),
('202210700', 'John Car Michael', 'Delos Santos', 'Delos Reyes', 'ic.johncarmichael.delosreyes@cvsu.edu.ph', 91234567891, '2002-05-18', 'Male', 'Student', '4G', 'Information Technology', 'FIRST'),
('202210718', 'Michael Rhoi', 'Ladrica', 'Gonzales', 'ic.michaelrhoi.gonzales@cvsu.edu.ph', 9085527790, '06/20/2004', 'Female', 'Student', '4D', 'Information Technology', 'FIRST'),
('202210781', 'Cherly Vic', 'C', 'Bakilid', 'ic.cherlyvic.bakilid@cvsu.edu.ph', 9168773102, '2002-11-17', 'Female', 'Student', '4F', 'Information Technology', 'FIRST'),
('202210784', 'Jeannen', 'Kummer', 'Basay', 'ic.jeannen.basay@cvsu.edu.ph', 0, '03/24/2002', 'Female', 'Student', '4F', 'Information Technology', 'FIRST'),
('202210808', 'Walid Binsaid', 'Lucman', 'Dimao', 'ic.walidbinsaid.dimao@cvsu.edu.ph', 91234567891, '2003-05-18', 'Male', 'Student', '4E', 'Information Technology', 'FIRST'),
('202210834', 'Shaun Russelle', 'Merano', 'Obseñares', 'ic.shaunrusselle.obsenares@cvsu.edu.ph', 91234567891, '2002-07-31', 'Male', 'Student', '4E', 'Information Technology', 'FIRST'),
('202210836', 'Ferdinand', 'Villamor', 'Olaira', 'ic.ferdinand.olaira@cvsu.edu.ph', 91234567891, '2004-12-04', 'Male', 'Student', '4D', 'Information Technology', 'FIRST'),
('202210838', 'Kate Justine', 'B', 'Pades', 'ic.katejustine.pades@cvsu.edu.ph', 9777429816, '2003-05-13', 'Female', 'Student', '4D', 'Information Technology', 'FIRST'),
('202210844', 'Reween', 'Ocampo', 'Rambonanza', 'ic.reween.rambonanza@cvsu.edu.ph', 91234567891, '2000-12-25', 'Male', 'Student', '4C', 'Information Technology', 'FIRST'),
('202210867', 'Erwin', 'Manalo', 'Vallez', 'ic.erwin.vallez@cvsu.edu.ph', 91234567891, '2003-11-24', 'Male', 'Student', '4C', 'Information Technology', 'FIRST'),
('202210868', 'Cristel Nicole', 'S', 'Vergara', 'ic.cristelnicole.vergara@cvsu.edu.ph', 9234400863, '2003-06-21', 'Female', 'Student', '4B', 'Information Technology', 'First'),
('202210870', 'Xyrill John', 'Fecundo', 'Abreu', 'ic.xyrilljohn.abreu@cvsu.edu.ph', 9422169425, '08/03/2003', 'Female', 'Student', '4B', 'Information Technology', 'FIRST'),
('202210881', 'Gerandy Ernest', 'Jamanila', 'Buensuceso', 'ic.gerandyernest.buensuceso@cvsu.edu.ph', 91234567891, '2004-12-09', 'Male', 'Student', '4A', 'Information Technology', 'FIRST'),
('202211199', 'Jeann', 'Boaw', 'Desalit', 'ic.desalit.jeann@cvsu.edu.ph', 91234567891, '2002-01-07', 'Female', 'Student', '4A', 'Information Technology', 'FIRST'),
('20230003', 'Julia Ann', 'Sisno', 'Fajardo', 'ic.juliaann.fajardo@cvsu.edu.ph', 9679532083, '06/07/2001', 'Female', 'Student', '4A', 'Information Technology', 'FIRST'),
('789', 'Mei', 'Diablo', 'Deeto', 'brylebalatayo@gmail.com', 9052739644, '08-18-2002', 'Male', 'Admin', 'Not Applicable', 'Informatoion Technology', 'Not Applicable');

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
-- Indexes for table `activity_files`
--
ALTER TABLE `activity_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activity_id` (`activity_id`),
  ADD KEY `student_id` (`student_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT for table `activity_files`
--
ALTER TABLE `activity_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `activity_grades`
--
ALTER TABLE `activity_grades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=463;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `announcement_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `student_classes`
--
ALTER TABLE `student_classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

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
-- Constraints for table `activity_files`
--
ALTER TABLE `activity_files`
  ADD CONSTRAINT `activity_files_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `activity_files_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `tracked_users` (`tracked_ID`);

--
-- Constraints for table `activity_grades`
--
ALTER TABLE `activity_grades`
  ADD CONSTRAINT `activity_grades_ibfk_1` FOREIGN KEY (`activity_ID`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `activity_grades_ibfk_2` FOREIGN KEY (`student_ID`) REFERENCES `tracked_users` (`tracked_ID`);

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
