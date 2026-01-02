-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Dec 29, 2025 at 06:06 PM
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
(81, 'LY0391', '202210602', 'Activity', '1', 'Activity #1', '', '', 100, '2025-12-04 17:33:00', '2025-12-03 09:35:32', '2025-12-13 08:35:30', 1, 0),
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
(92, 'SJ1849', '202210602', 'Assignment', '1', 'Sample', 'SAMPLE INSTRUCTION', 'https://www.youtube.com/shorts/wpC-uHqhqso', 50, '2025-12-05 16:23:00', '2025-12-04 08:25:02', '2025-12-04 08:26:33', 0, 1),
(93, 'LY0391', '202210602', 'Project', '2', 'Capstone RePresent', 'This is your capstone redefence pls sana pumasa na kayo also thisis a test for a long instruction to see if di mag bbreak yung components if may mahabang insturction mag aadd din ako link to see if nakikita rin ng student yun lang.. goodluck', 'youtube.com', 100, '2026-01-05 00:32:00', '2025-12-11 16:34:27', '2025-12-11 16:34:27', 0, 0),
(94, 'LY0391', '202210602', 'Quiz', '5', 'Testing', 'asfsduifbfiusfbsiudfbisdbisgbbgdgbdfgbdigbdsibgsdijbsdijbsdigbsdigbsdigbsdibgisdbgisdbgiusdbgiusdbgisdbgisgbiusgbigbisgbdjksn kv mdvbzvdsfghjfdsdfghkjhdspoiuytrewqasdfghjkl,mnbvcxwbdbfifbisfbsibsidfbsfbsifbdsfbdfibdfisdbfiusdbfisdfasfsduifbfiusfbsiudfbisdbisgbbgdgbdfgbdigbdsibgsdijbsdijbsdigbsdigbsdigbsdibgisdbgisdbgiusdbgiusdbgisdbgisgbiusgbigbisgbdjksn kv mdvbzvdsfghjfdsdfghkjhdspoiuytrewqasdfghjkl,mnbvcxwbdbfifbisfbsibsidfbsfbsifbdsfbdfibdfisdbfiusdbfisdfasfsduifbfiusfbsiudfbisdbisgbbgdgbdfgbdigbdsibgsdijbsdijbsdigbsdigbsdigbsdibgisdbgisdbgiusdbgiusdbgisdbgisgbiusgbigbisgbdjksn kv mdvbzvdsfghjfdsdfghkjhdspoiuytrewqasdfghjkl,mnbvcxwbdbfifbisfbsibsidfbsfbsifbdsfbdfibdfisdbfiusdbfisdfasfsduifbfiusfbsiudfbisdbisgbbgdgbdfgbdigbdsibgsdijbsdijbsdigbsdigbsdigbsdibgisdbgisdbgiusdbgiusdbgisdbgisgbiusgbigbisgbdjksn kv mdvbzvdsfghjfdsdfghkjhdspoiuytrewqasdfghjkl,mnbvcxwbdbfifbisfbsibsidfbsfbsifbdsfbdfibdfisdbfiusdbfisdf', 'Facebook.com', 20, '2026-01-05 01:22:00', '2025-12-11 17:23:38', '2025-12-11 17:23:38', 0, 0),
(95, 'LY0391', '202210602', 'Assignment', '5', 'High Grade', 'High Grade Example', '', 50, '2026-01-13 22:41:00', '2025-12-12 14:42:30', '2025-12-12 14:42:30', 0, 0),
(96, 'LY0391', '202210602', 'Assignment', '6', 'Mid Grade', 'Mid Grade Example', '', 50, '2026-02-12 22:43:00', '2025-12-12 14:43:49', '2025-12-12 14:43:49', 0, 0),
(97, 'LY0391', '202210602', 'Assignment', '7', 'Low Grade', 'Low Grade Example', '', 50, '2026-01-11 22:44:00', '2025-12-12 14:45:03', '2025-12-12 14:45:03', 0, 0),
(98, 'IY5720', '202210602', 'Assignment', '1', 'Fail', 'Fail and shame', 'google.com ', 20, '2026-01-13 12:55:00', '2025-12-13 04:55:41', '2025-12-13 04:55:41', 0, 0),
(99, 'IY5720', '202210602', 'Assignment', '2', 'Failure', 'Fail and shame and failure', 'google.com ', 50, '2026-02-13 12:55:00', '2025-12-13 04:56:13', '2025-12-13 04:56:13', 0, 0),
(100, 'LY0391', '202210602', 'Assignment', '24', 'hfghfghfghfghfgh', 'hfghfghfhfghfghfghfghgfhfghfghfg', 'gjfgjf', 245, '2025-12-27 17:26:00', '2025-12-13 09:26:48', '2025-12-13 09:26:48', 0, 0),
(101, 'LY0391', '202210602', 'Quiz', '6', 'File Upload Try', 'Try file upload', 'youtube.com', 50, '2025-12-16 17:49:00', '2025-12-14 09:50:07', '2025-12-14 09:50:07', 0, 0),
(102, 'IY5720', '202210602', 'Assignment', '3', 'Assignment 3', 'asdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf', '', 100, '2025-12-19 03:00:00', '2025-12-18 17:15:18', '2025-12-18 17:15:18', 0, 0),
(103, 'ZM6922', '1035', 'Project', '1', 'API System Project', 'Create an API System base on the instruction (Instruction given to the attach link)', 'https://classroom.google.com/u/1/c/ODAxMDIwODI1NDU4', 200, '2026-01-12 23:59:00', '2025-12-28 07:23:52', '2025-12-28 07:23:52', 0, 0),
(104, 'JV6592', '1035', 'Laboratory', '1', 'Lab Activity 1-4', 'Laboratory Activity 1-4 (Instruction provided on the attached Link)', 'https://classroom.google.com/u/1/c/NzE1NTEwODQwMjY5/a/NzE2MjU1NzY5MDMx/details', 100, '2026-01-12 23:59:00', '2025-12-28 08:00:48', '2025-12-28 08:00:48', 0, 0);

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
(36, 89, '202210718', '1764823654_693112667633b_Screenshot_20251204-122700.png', 'Screenshot_20251204-122700.png', 'https://tracked.6minds.site/TrackEd_Uploads/To_Students/1764823654_693112667633b_Screenshot_20251204-122700.png', 235295, 'image/png', 'student', '2025-12-04 04:47:34'),
(40, 92, '202210870', '1765380358_693991067dac2_3.jpg', '3.jpg', 'https://tracked.6minds.site/TrackEd_Uploads/To_Students/1765380358_693991067dac2_3.jpg', 239441, 'image/jpeg', 'student', '2025-12-10 15:25:58'),
(42, 82, '202210870', '1765381375_693994ff47152_3.jpg', '3.jpg', 'https://tracked.6minds.site/TrackEd_Uploads/To_Students/1765381375_693994ff47152_3.jpg', 239441, 'image/jpeg', 'student', '2025-12-10 15:42:55'),
(43, 93, '202210870', '1765473653_693afd754494f_473448119_1334797151023218_8394792573383025115_n.jpg', '473448119_1334797151023218_8394792573383025115_n.jpg', 'https://tracked.6minds.site/TrackEd_Uploads/To_Students/1765473653_693afd754494f_473448119_1334797151023218_8394792573383025115_n.jpg', 222339, 'image/jpeg', 'student', '2025-12-11 17:20:53'),
(44, 96, '202210870', '1765623847_693d4827cf842_3.jpg', '3.jpg', 'https://tracked.6minds.site/TrackEd_Uploads/To_Students/1765623847_693d4827cf842_3.jpg', 239441, 'image/jpeg', 'professor', '2025-12-13 11:04:07'),
(45, 93, '202210718', '1765623931_693d487bdd21f_3.jpg', '3.jpg', 'https://tracked.6minds.site/TrackEd_Uploads/To_Students/1765623931_693d487bdd21f_3.jpg', 239441, 'image/jpeg', 'professor', '2025-12-13 11:05:31'),
(46, 93, '202210870', '1765624997_693d4ca5d9b20_3.jpg', '3.jpg', 'https://tracked.6minds.site/TrackEd_Uploads/To_Students/1765624997_693d4ca5d9b20_3.jpg', 239441, 'image/jpeg', 'professor', '2025-12-13 11:23:17'),
(48, 94, '202210870', '1765625781_693d4fb518dec_3.jpg', '3.jpg', 'https://tracked.6minds.site/TrackEd_Uploads/To_Students/1765625781_693d4fb518dec_3.jpg', 239441, 'image/jpeg', 'professor', '2025-12-13 11:36:21'),
(49, 94, '202210870', '1765625822_693d4fdeea33c_3.jpg', '3.jpg', 'https://tracked.6minds.site/TrackEd_Uploads/To_Students/1765625822_693d4fdeea33c_3.jpg', 239441, 'image/jpeg', 'student', '2025-12-13 11:37:02'),
(53, 100, '202210870', '1765631103_693d647f1645f_diagram_0_DFD_for_New_Century.png', 'diagram 0 DFD for New Century.png', 'https://tracked.6minds.site/TrackEd_Uploads/To_Students/1765631103_693d647f1645f_diagram_0_DFD_for_New_Century.png', 174929, 'image/png', 'professor', '2025-12-13 13:05:03'),
(54, 100, '202210870', '1765631485_693d65fd14a6c_07.png', '07.png', 'https://tracked.6minds.site/TrackEd_Uploads/To_Students/1765631485_693d65fd14a6c_07.png', 192724, 'image/png', 'student', '2025-12-13 13:11:25'),
(57, 101, '202210870', '1765708345_693e92399b23a_Capstone_TrackEDChapter-1-5_w_Appendices.docx', 'Capstone_TrackEDChapter-1-5 w Appendices.docx', 'https://tracked.6minds.site/TrackEd_Uploads/To_Students/1765708345_693e92399b23a_Capstone_TrackEDChapter-1-5_w_Appendices.docx', 1369308, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'professor', '2025-12-14 10:32:25'),
(58, 102, '202210870', '1766082277_694446e5ed9b6_newjeans-members-how-sweet-danielle-haerin-minji-hanni-hyein-4k-wallpaper-uhdpaper.com-562_0_j.jpg', 'newjeans-members-how-sweet-danielle-haerin-minji-hanni-hyein-4k-wallpaper-uhdpaper.com-562@0@j.jpg', 'https://tracked.6minds.site/TrackEd_Uploads/To_Students/1766082277_694446e5ed9b6_newjeans-members-how-sweet-danielle-haerin-minji-hanni-hyein-4k-wallpaper-uhdpaper.com-562_0_j.jpg', 2135090, 'image/jpeg', 'student', '2025-12-18 18:24:37'),
(59, 102, '202210870', '1766082355_69444733296ec_newjeans-members-how-sweet-danielle-haerin-minji-hanni-hyein-4k-wallpaper-uhdpaper.com-562_0_j.jpg', 'newjeans-members-how-sweet-danielle-haerin-minji-hanni-hyein-4k-wallpaper-uhdpaper.com-562@0@j.jpg', 'https://tracked.6minds.site/TrackEd_Uploads/To_Students/1766082355_69444733296ec_newjeans-members-how-sweet-danielle-haerin-minji-hanni-hyein-4k-wallpaper-uhdpaper.com-562_0_j.jpg', 2135090, 'image/jpeg', 'professor', '2025-12-18 18:25:55');

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
(410, 82, '202210870', 60.00, 1, '2025-12-10 15:42:55', 0, '2025-12-03 09:35:57', '2025-12-10 15:42:55', 'https://tracked.6minds.site/TrackEd_Uploads/To_Students/1765381375_693994ff47152_3.jpg', '3.jpg'),
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
(461, 92, '202210870', 49.00, 1, '2025-12-10 15:25:58', 0, '2025-12-04 08:25:02', '2025-12-10 15:25:58', 'https://tracked.6minds.site/TrackEd_Uploads/To_Students/1765380358_693991067dac2_3.jpg', '3.jpg'),
(463, 93, '202210870', NULL, 1, '2025-12-11 17:20:53', 0, '2025-12-11 16:34:27', '2025-12-13 11:05:37', 'https://tracked.6minds.site/TrackEd_Uploads/To_Students/1765473653_693afd754494f_473448119_1334797151023218_8394792573383025115_n.jpg', '473448119_1334797151023218_8394792573383025115_n.jpg'),
(464, 93, '202210838', NULL, 0, NULL, 0, '2025-12-11 16:34:27', '2025-12-13 11:05:37', NULL, NULL),
(465, 93, '202210718', NULL, 0, NULL, 0, '2025-12-11 16:34:27', '2025-12-13 11:05:37', NULL, NULL),
(466, 93, '202210625', NULL, 0, NULL, 0, '2025-12-11 16:34:27', '2025-12-13 11:05:37', NULL, NULL),
(467, 93, '202210784', NULL, 0, NULL, 0, '2025-12-11 16:34:27', '2025-12-13 11:05:37', NULL, NULL),
(468, 93, '202210781', NULL, 0, NULL, 0, '2025-12-11 16:34:27', '2025-12-13 11:05:37', NULL, NULL),
(469, 93, '202210808', NULL, 0, NULL, 0, '2025-12-11 16:34:27', '2025-12-13 11:05:37', NULL, NULL),
(470, 93, '202210834', NULL, 0, NULL, 0, '2025-12-11 16:34:27', '2025-12-13 11:05:37', NULL, NULL),
(471, 93, '202210836', NULL, 0, NULL, 0, '2025-12-11 16:34:27', '2025-12-13 11:05:37', NULL, NULL),
(472, 94, '202210870', NULL, 1, '2025-12-13 11:37:02', 0, '2025-12-11 17:23:38', '2025-12-13 12:21:12', 'https://tracked.6minds.site/TrackEd_Uploads/To_Students/1765625822_693d4fdeea33c_3.jpg', '3.jpg'),
(473, 94, '202210838', NULL, 0, NULL, 0, '2025-12-11 17:23:38', '2025-12-13 12:21:12', NULL, NULL),
(474, 94, '202210718', NULL, 0, NULL, 0, '2025-12-11 17:23:38', '2025-12-13 12:21:12', NULL, NULL),
(475, 94, '202210625', NULL, 0, NULL, 0, '2025-12-11 17:23:38', '2025-12-13 12:21:12', NULL, NULL),
(476, 94, '202210784', NULL, 0, NULL, 0, '2025-12-11 17:23:38', '2025-12-13 12:21:12', NULL, NULL),
(477, 94, '202210781', NULL, 0, NULL, 0, '2025-12-11 17:23:38', '2025-12-13 12:21:12', NULL, NULL),
(478, 94, '202210808', NULL, 0, NULL, 0, '2025-12-11 17:23:38', '2025-12-13 12:21:12', NULL, NULL),
(479, 94, '202210834', NULL, 0, NULL, 0, '2025-12-11 17:23:38', '2025-12-13 12:21:12', NULL, NULL),
(480, 94, '202210836', NULL, 0, NULL, 0, '2025-12-11 17:23:38', '2025-12-13 12:21:12', NULL, NULL),
(481, 95, '202210870', 50.00, 1, '2025-12-12 14:49:26', 0, '2025-12-12 14:42:30', '2025-12-13 12:00:37', NULL, NULL),
(482, 95, '202210838', 50.00, 1, '2025-12-12 14:49:26', 0, '2025-12-12 14:42:30', '2025-12-13 12:00:37', NULL, NULL),
(483, 95, '202210718', 50.00, 1, '2025-12-13 12:00:37', 0, '2025-12-12 14:42:30', '2025-12-13 12:00:37', NULL, NULL),
(484, 95, '202210625', 46.00, 1, '2025-12-12 14:49:26', 0, '2025-12-12 14:42:30', '2025-12-13 12:00:37', NULL, NULL),
(485, 95, '202210784', 50.00, 1, '2025-12-12 14:49:26', 0, '2025-12-12 14:42:30', '2025-12-13 12:00:37', NULL, NULL),
(486, 95, '202210781', 50.00, 1, '2025-12-12 14:49:26', 0, '2025-12-12 14:42:30', '2025-12-13 12:00:37', NULL, NULL),
(487, 95, '202210808', 50.00, 1, '2025-12-12 14:49:26', 0, '2025-12-12 14:42:30', '2025-12-13 12:00:37', NULL, NULL),
(488, 95, '202210834', 50.00, 1, '2025-12-12 14:49:26', 0, '2025-12-12 14:42:30', '2025-12-13 12:00:37', NULL, NULL),
(489, 95, '202210836', 50.00, 1, '2025-12-12 14:49:26', 0, '2025-12-12 14:42:30', '2025-12-13 12:00:37', NULL, NULL),
(490, 96, '202210870', 25.00, 1, '2025-12-12 14:48:01', 0, '2025-12-12 14:43:49', '2025-12-13 11:04:32', NULL, NULL),
(491, 96, '202210838', 25.00, 1, '2025-12-12 14:48:01', 0, '2025-12-12 14:43:49', '2025-12-13 11:04:32', NULL, NULL),
(492, 96, '202210718', 25.00, 1, '2025-12-12 14:48:01', 0, '2025-12-12 14:43:49', '2025-12-13 11:04:32', NULL, NULL),
(493, 96, '202210625', 25.00, 1, '2025-12-12 14:48:01', 0, '2025-12-12 14:43:49', '2025-12-13 11:04:32', NULL, NULL),
(494, 96, '202210784', 25.00, 1, '2025-12-12 14:48:01', 0, '2025-12-12 14:43:49', '2025-12-13 11:04:32', NULL, NULL),
(495, 96, '202210781', 25.00, 1, '2025-12-12 14:48:01', 0, '2025-12-12 14:43:49', '2025-12-13 11:04:32', NULL, NULL),
(496, 96, '202210808', 25.00, 1, '2025-12-12 14:48:01', 0, '2025-12-12 14:43:49', '2025-12-13 11:04:32', NULL, NULL),
(497, 96, '202210834', 25.00, 1, '2025-12-12 14:48:01', 0, '2025-12-12 14:43:49', '2025-12-13 11:04:32', NULL, NULL),
(498, 96, '202210836', 25.00, 1, '2025-12-12 14:48:01', 0, '2025-12-12 14:43:49', '2025-12-13 11:04:32', NULL, NULL),
(499, 97, '202210870', 1.00, 1, '2025-12-12 14:47:40', 0, '2025-12-12 14:45:03', '2025-12-12 14:47:41', NULL, NULL),
(500, 97, '202210838', 1.00, 1, '2025-12-12 14:47:40', 0, '2025-12-12 14:45:03', '2025-12-12 14:47:41', NULL, NULL),
(501, 97, '202210718', 1.00, 1, '2025-12-12 14:47:40', 0, '2025-12-12 14:45:03', '2025-12-12 14:47:41', NULL, NULL),
(502, 97, '202210625', 1.00, 1, '2025-12-12 14:47:40', 0, '2025-12-12 14:45:03', '2025-12-12 14:47:41', NULL, NULL),
(503, 97, '202210784', 2.00, 1, '2025-12-12 14:47:40', 0, '2025-12-12 14:45:03', '2025-12-12 14:47:41', NULL, NULL),
(504, 97, '202210781', 1.00, 1, '2025-12-12 14:47:40', 0, '2025-12-12 14:45:03', '2025-12-12 14:47:41', NULL, NULL),
(505, 97, '202210808', 1.00, 1, '2025-12-12 14:47:40', 0, '2025-12-12 14:45:03', '2025-12-12 14:47:41', NULL, NULL),
(506, 97, '202210834', 1.00, 1, '2025-12-12 14:47:40', 0, '2025-12-12 14:45:03', '2025-12-12 14:47:41', NULL, NULL),
(507, 97, '202210836', 1.00, 1, '2025-12-12 14:47:40', 0, '2025-12-12 14:45:03', '2025-12-12 14:47:41', NULL, NULL),
(520, 98, '202210870', 0.00, 1, '2025-12-13 04:56:41', 0, '2025-12-13 04:55:41', '2025-12-13 04:56:41', NULL, NULL),
(521, 99, '202210870', 0.00, 1, '2025-12-13 04:56:45', 0, '2025-12-13 04:56:13', '2025-12-13 04:56:46', NULL, NULL),
(523, 100, '202210870', NULL, 1, '2025-12-13 13:11:25', 0, '2025-12-13 09:26:48', '2025-12-13 13:11:25', 'https://tracked.6minds.site/TrackEd_Uploads/To_Students/1765631485_693d65fd14a6c_07.png', '07.png'),
(524, 100, '202210838', NULL, 0, NULL, 0, '2025-12-13 09:26:48', '2025-12-13 13:05:11', NULL, NULL),
(525, 100, '202210718', NULL, 0, NULL, 0, '2025-12-13 09:26:48', '2025-12-13 13:05:11', NULL, NULL),
(526, 100, '202210625', NULL, 0, NULL, 0, '2025-12-13 09:26:48', '2025-12-13 13:05:11', NULL, NULL),
(527, 100, '202210784', NULL, 0, NULL, 0, '2025-12-13 09:26:48', '2025-12-13 13:05:11', NULL, NULL),
(528, 100, '202210781', NULL, 0, NULL, 0, '2025-12-13 09:26:48', '2025-12-13 13:05:11', NULL, NULL),
(529, 100, '202210808', NULL, 0, NULL, 0, '2025-12-13 09:26:48', '2025-12-13 13:05:11', NULL, NULL),
(530, 100, '202210834', NULL, 0, NULL, 0, '2025-12-13 09:26:48', '2025-12-13 13:05:11', NULL, NULL),
(531, 100, '202210836', NULL, 0, NULL, 0, '2025-12-13 09:26:48', '2025-12-13 13:05:11', NULL, NULL),
(568, 101, '202210870', NULL, 0, NULL, 0, '2025-12-14 09:50:07', '2025-12-14 10:32:43', NULL, NULL),
(569, 101, '202210838', NULL, 0, NULL, 0, '2025-12-14 09:50:07', '2025-12-14 10:32:43', NULL, NULL),
(570, 101, '202210718', NULL, 0, NULL, 0, '2025-12-14 09:50:07', '2025-12-14 10:32:43', NULL, NULL),
(571, 101, '202210625', NULL, 0, NULL, 0, '2025-12-14 09:50:07', '2025-12-14 10:32:43', NULL, NULL),
(572, 101, '202210784', NULL, 0, NULL, 0, '2025-12-14 09:50:07', '2025-12-14 10:32:43', NULL, NULL),
(573, 101, '202210781', NULL, 0, NULL, 0, '2025-12-14 09:50:07', '2025-12-14 10:32:43', NULL, NULL),
(574, 101, '202210808', NULL, 0, NULL, 0, '2025-12-14 09:50:07', '2025-12-14 10:32:43', NULL, NULL),
(575, 101, '202210834', NULL, 0, NULL, 0, '2025-12-14 09:50:07', '2025-12-14 10:32:43', NULL, NULL),
(576, 101, '202210836', NULL, 0, NULL, 0, '2025-12-14 09:50:07', '2025-12-14 10:32:43', NULL, NULL),
(586, 102, '202210870', 90.00, 1, '2025-12-18 18:24:37', 0, '2025-12-18 17:15:18', '2025-12-18 18:26:13', 'https://tracked.6minds.site/TrackEd_Uploads/To_Students/1766082277_694446e5ed9b6_newjeans-members-how-sweet-danielle-haerin-minji-hanni-hyein-4k-wallpaper-uhdpaper.com-562_0_j.jpg', 'newjeans-members-how-sweet-danielle-haerin-minji-hanni-hyein-4k-wallpaper-uhdpaper.com-562@0@j.jpg'),
(588, 103, '202210870', NULL, 0, NULL, 0, '2025-12-28 07:23:52', '2025-12-28 07:23:52', NULL, NULL);

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
(19, '1035', 'ZM6922', 'Capstone Presentation', 'The defense will begin at 8 a.m. (call time is 7:30 a.m.), and each group will have 30–45 minutes to present. This means that being late is not allowed. Any group that arrives late will have their presentation time reduced. Please also ensure that the succeeding groups are already on standby one hour before their scheduled time.\n\nWhat the students will bring for the final defense:\n• Their system (with their own internet connection)\n• Hardware and move in/out forms (if applicable)\n• PPT presentation\n• 3 copies of printed documents\n• 5 copies of filled-out evaluation forms\n• Food/token for the panel\n• Their courage and commitment!\n\nRegarding the food or tokens for the panelists, the advisers will discuss it with their respective groups.\n\nThank you po and God bless.😊', NULL, '2025-12-04 12:00:00', '2025-12-04 02:13:26', '2025-12-04 02:13:26'),
(22, '202210602', 'IY5720', 'LONG TEXT', 'ASDFASDFSADFASDFGASDFASDFSADFASDFGASDFASDFSADFASDFGASDFASDFSADFASDFGASDFASDFSADFASDFGASDFASDFSADFASDFGASDFASDFSADFASDFGASDFASDFSADFASDFGASDFASDFSADFASDFGASDFASDFSADFASDFGASDFASDFSADFASDFGASDFASDFSADFASDFGASDFASDFSADFASDFGASDFASDFSADFASDFGASDFASDFSADFASDFGASDFASDFSADFASDFGASDFASDFSADFASDFGASDFASDFSADFASDFGASDFASDFSADFASDFGASDFASDFSADFASDFGASDFASDFSADFASDFGASDFASDFSADFASDFGASDFASDFSADFASDFGASDFASDFSADFASDFGASDFASDFSADFASDFGASDFASDFSADFASDFGASDFASDFSADFASDFG', NULL, '2025-12-19 05:00:00', '2025-12-18 19:11:47', '2025-12-18 19:11:47'),
(23, '202210602', 'IY5720', 'TEXT WITH TABS', 'THIS\nIS\nINSTRUCTION\nHAS\nTABS', NULL, '2025-12-20 05:00:00', '2025-12-19 17:29:51', '2025-12-19 17:29:51');

-- --------------------------------------------------------

--
-- Table structure for table `announcement_read_status`
--

CREATE TABLE `announcement_read_status` (
  `id` int(11) NOT NULL,
  `announcement_ID` int(11) NOT NULL,
  `student_ID` varchar(20) NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcement_read_status`
--

INSERT INTO `announcement_read_status` (`id`, `announcement_ID`, `student_ID`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES
(1, 23, '202210870', 1, '2025-12-19 18:19:45', '2025-12-19 18:19:23', '2025-12-19 18:19:45'),
(2, 22, '202210870', 1, '2025-12-19 18:24:12', '2025-12-19 18:22:39', '2025-12-19 18:24:12'),
(3, 19, '202210870', 0, NULL, '2025-12-28 08:12:49', '2025-12-28 18:20:12');

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
(119, 'LY0391', '202210602', '2025-12-13', '202210870', 'late', '2025-12-13 08:03:07', '2025-12-13 08:03:07'),
(120, 'DF1710', '202210602', '2025-12-13', '202210609', 'present', '2025-12-13 10:36:16', '2025-12-13 10:36:16'),
(121, 'DF1710', '202210602', '2025-12-13', '202210625', 'present', '2025-12-13 10:36:16', '2025-12-13 10:36:16'),
(122, 'DF1710', '202210602', '2025-12-13', '202210718', 'present', '2025-12-13 10:36:16', '2025-12-13 10:36:16'),
(123, 'DF1710', '202210602', '2025-12-13', '202210781', 'present', '2025-12-13 10:36:16', '2025-12-13 10:36:16'),
(124, 'DF1710', '202210602', '2025-12-13', '202210784', 'present', '2025-12-13 10:36:16', '2025-12-13 10:36:16'),
(125, 'DF1710', '202210602', '2025-12-13', '202210808', 'present', '2025-12-13 10:36:16', '2025-12-13 10:36:16'),
(126, 'DF1710', '202210602', '2025-12-13', '202210834', 'present', '2025-12-13 10:36:16', '2025-12-13 10:36:16'),
(127, 'DF1710', '202210602', '2025-12-13', '202210836', 'present', '2025-12-13 10:36:16', '2025-12-13 10:36:16'),
(128, 'DF1710', '202210602', '2025-12-13', '202210838', 'present', '2025-12-13 10:36:16', '2025-12-13 10:36:16'),
(129, 'DF1710', '202210602', '2025-12-13', '202210870', 'present', '2025-12-13 10:36:16', '2025-12-13 10:36:16'),
(130, 'LY0391', '202210602', '2025-12-14', '202210625', 'present', '2025-12-14 09:51:39', '2025-12-14 09:51:39'),
(131, 'LY0391', '202210602', '2025-12-14', '202210718', 'present', '2025-12-14 09:51:39', '2025-12-14 09:51:39'),
(132, 'LY0391', '202210602', '2025-12-14', '202210781', 'present', '2025-12-14 09:51:39', '2025-12-14 09:51:39'),
(133, 'LY0391', '202210602', '2025-12-14', '202210784', 'present', '2025-12-14 09:51:39', '2025-12-14 09:51:39'),
(134, 'LY0391', '202210602', '2025-12-14', '202210808', 'present', '2025-12-14 09:51:39', '2025-12-14 09:51:39'),
(135, 'LY0391', '202210602', '2025-12-14', '202210834', 'present', '2025-12-14 09:51:39', '2025-12-14 09:51:39'),
(136, 'LY0391', '202210602', '2025-12-14', '202210836', 'present', '2025-12-14 09:51:39', '2025-12-14 09:51:39'),
(137, 'LY0391', '202210602', '2025-12-14', '202210838', 'present', '2025-12-14 09:51:39', '2025-12-14 09:51:39'),
(138, 'LY0391', '202210602', '2025-12-14', '202210870', 'absent', '2025-12-14 09:51:39', '2025-12-14 09:51:39'),
(141, 'SJ1849', '202210602', '2025-12-16', '202210870', 'absent', '2025-12-16 18:22:16', '2025-12-28 08:25:25'),
(142, 'DF1710', '202210602', '2025-12-16', '202210609', 'present', '2025-12-16 18:39:04', '2025-12-16 18:39:04'),
(143, 'DF1710', '202210602', '2025-12-16', '202210625', 'present', '2025-12-16 18:39:04', '2025-12-16 18:39:04'),
(144, 'DF1710', '202210602', '2025-12-16', '202210718', 'present', '2025-12-16 18:39:04', '2025-12-16 18:39:04'),
(145, 'DF1710', '202210602', '2025-12-16', '202210781', 'present', '2025-12-16 18:39:04', '2025-12-16 18:39:04'),
(146, 'DF1710', '202210602', '2025-12-16', '202210784', 'present', '2025-12-16 18:39:04', '2025-12-16 18:39:04'),
(147, 'DF1710', '202210602', '2025-12-16', '202210808', 'present', '2025-12-16 18:39:04', '2025-12-16 18:39:04'),
(148, 'DF1710', '202210602', '2025-12-16', '202210834', 'present', '2025-12-16 18:39:04', '2025-12-16 18:39:04'),
(149, 'DF1710', '202210602', '2025-12-16', '202210836', 'present', '2025-12-16 18:39:04', '2025-12-16 18:39:04'),
(150, 'DF1710', '202210602', '2025-12-16', '202210838', 'present', '2025-12-16 18:39:04', '2025-12-16 18:39:04'),
(151, 'DF1710', '202210602', '2025-12-16', '202210870', 'present', '2025-12-16 18:39:04', '2025-12-16 18:39:04'),
(161, 'LY0391', '202210602', '2025-12-16', '202210625', 'present', '2025-12-16 18:51:12', '2025-12-16 18:51:12'),
(162, 'LY0391', '202210602', '2025-12-16', '202210718', 'present', '2025-12-16 18:51:12', '2025-12-16 18:51:12'),
(163, 'LY0391', '202210602', '2025-12-16', '202210781', 'present', '2025-12-16 18:51:12', '2025-12-16 18:51:12'),
(164, 'LY0391', '202210602', '2025-12-16', '202210784', 'present', '2025-12-16 18:51:12', '2025-12-16 18:51:12'),
(165, 'LY0391', '202210602', '2025-12-16', '202210808', 'present', '2025-12-16 18:51:12', '2025-12-16 18:51:12'),
(166, 'LY0391', '202210602', '2025-12-16', '202210834', 'present', '2025-12-16 18:51:12', '2025-12-16 18:51:12'),
(167, 'LY0391', '202210602', '2025-12-16', '202210836', 'present', '2025-12-16 18:51:12', '2025-12-16 18:51:12'),
(168, 'LY0391', '202210602', '2025-12-16', '202210838', 'present', '2025-12-16 18:51:12', '2025-12-16 18:51:12'),
(169, 'LY0391', '202210602', '2025-12-16', '202210870', 'present', '2025-12-16 18:51:12', '2025-12-16 18:51:12'),
(170, 'IY5720', '202210602', '2025-12-16', '202210870', 'present', '2025-12-16 18:57:43', '2025-12-16 18:57:43'),
(171, 'IY5720', '202210602', '2025-12-17', '202210870', 'late', '2025-12-17 08:23:44', '2025-12-17 08:23:44'),
(173, 'SJ1849', '202210602', '2025-12-18', '202210870', 'absent', '2025-12-18 18:52:52', '2025-12-28 08:22:24'),
(174, 'IY5720', '202210602', '2025-12-18', '202210870', 'present', '2025-12-18 19:09:03', '2025-12-18 19:09:03'),
(175, 'IY5720', '202210602', '2025-12-22', '202210870', 'late', '2025-12-22 18:02:21', '2025-12-22 18:02:21'),
(177, 'ZM6922', '1035', '2025-12-27', '202210870', 'present', '2025-12-27 15:30:44', '2025-12-27 15:30:44'),
(182, 'ZM6922', '1035', '2025-12-28', '202210718', 'present', '2025-12-28 07:35:48', '2025-12-28 07:35:48'),
(183, 'ZM6922', '1035', '2025-12-28', '202210781', 'present', '2025-12-28 07:35:48', '2025-12-28 07:35:48'),
(184, 'ZM6922', '1035', '2025-12-28', '202210870', 'present', '2025-12-28 07:35:48', '2025-12-28 07:35:48'),
(185, 'IY5720', '202210602', '2025-12-28', '202210870', 'absent', '2025-12-28 08:21:06', '2025-12-28 08:21:06');

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
('EG6774', '4th Year', 'DCIT 65A', 'FIRST SEMESTER', 'D', '1035', '2025-12-26 17:14:51', '2025-12-26 17:14:51', 'Active'),
('IY5720', '4th Year', 'MATH', 'FIRST SEMESTER', 'D', '202210602', '2025-12-13 04:53:52', '2025-12-13 04:53:52', 'Active'),
('JV6592', '3rd Year', 'INSY 55', 'FIRST SEMESTER', 'C', '1035', '2025-12-28 07:57:28', '2025-12-28 07:57:28', 'Active'),
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
(22, '202210718', 'LY0391', '2025-12-03 09:33:28', 1, '2025-12-28 07:32:48'),
(23, '202210870', 'DF1710', '2025-12-03 09:30:40', 1, '2025-12-27 06:32:32'),
(24, '202210838', 'DF1710', '2025-12-03 09:30:40', 0, '0000-00-00 00:00:00'),
(25, '202210718', 'DF1710', '2025-12-03 09:30:40', 1, '2025-12-28 07:32:50'),
(26, '202210609', 'DF1710', '2025-12-03 10:51:52', 0, NULL),
(27, '202210625', 'DF1710', '2025-12-03 10:53:20', 0, NULL),
(28, '202210625', 'LY0391', '2025-12-03 10:53:28', 0, NULL),
(29, '202210784', 'DF1710', '2025-12-03 10:54:08', 0, NULL),
(30, '202210784', 'LY0391', '2025-12-03 10:54:15', 0, NULL),
(31, '202210781', 'DF1710', '2025-12-03 10:54:57', 1, '2025-12-28 07:33:58'),
(32, '202210781', 'LY0391', '2025-12-03 10:55:05', 1, '2025-12-28 07:33:56'),
(33, '202210808', 'DF1710', '2025-12-03 10:55:57', 0, NULL),
(34, '202210808', 'LY0391', '2025-12-03 10:56:07', 0, NULL),
(35, '202210834', 'DF1710', '2025-12-03 11:11:02', 0, NULL),
(36, '202210834', 'LY0391', '2025-12-03 11:11:09', 0, NULL),
(37, '202210836', 'DF1710', '2025-12-03 11:11:44', 0, NULL),
(38, '202210836', 'LY0391', '2025-12-03 11:11:58', 0, NULL),
(39, '202210870', 'SJ1849', '2025-12-04 08:23:28', 0, NULL),
(40, '202210870', 'IY5720', '2025-12-13 04:54:44', 0, NULL),
(41, '202210870', 'ZM6922', '2025-12-27 06:31:36', 0, NULL),
(42, '202210718', 'ZM6922', '2025-12-28 07:33:21', 0, NULL),
(43, '202210781', 'ZM6922', '2025-12-28 07:34:07', 0, NULL);

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
('1035', 'Professor', 'sherilyn.fajutagana@cvsu.edu.ph', '$2y$10$3GCdahygiVWLSTeGkW90beyNogMqpHIznchBFBguWqILHz/6YtCb.', 'Sherilyn', 'Fajutagana', 'Fontelo', 'Information Technology', 'Not Applicable', 'Not Applicable', '1993-08-15', 'Female', '9933302365', 'Active', '1993-08-15Professor10350WJ', '2025-12-03 09:04:12', '2025-12-15 09:08:29'),
('202111683', 'Student', 'ic.noerjan.cleofe@cvsu.edu.ph', '123', 'Noerjan', 'Cleofe', 'Catayong', 'Information Technology', '4D', 'FIRST', '2002-10-17', 'Male', '91234567891', 'Active', '2002-10-17Student202111683S8P', '2025-12-03 09:04:16', '2025-12-28 08:10:22'),
('202210602', 'Professor', 'ic.dhenizekristafaith.lopez@cvsu.edu.ph', '$2y$10$t1qKXZGiO0a6bJchB5RrHO9F3O15.eA8he45uHkqqEkLLzmxDnhh2', 'Dhenize Krista Faith', 'Lopez', 'Cabardo', 'Information Technology', 'Not Applicable', 'Not Applicable', '2004-11-24', 'Male', '9988262316', 'Active', '11242004Professor2022106024EG', '2025-12-03 09:04:20', '2025-12-04 06:15:46'),
('202210609', 'Student', 'ic.matthewkeane.mariano@cvsu.edu.ph', '123', 'Matthew Keane', 'Mariano', 'Yap', 'Information Technology', '4D', 'FIRST', '2002-10-29', 'Male', '91234567891', 'Active', '2002-10-29Student202210609ZQB', '2025-12-03 09:04:23', '2025-12-28 08:09:13'),
('202210625', 'Student', 'ic.kenclarence.orosco@cvsu.edu.ph', '123', 'Ken Clarence', 'Orosco', 'Roque', 'Information Technology', '4D', 'FIRST', '2003-12-23', 'Male', '91234567891', 'Active', '2003-12-23Student202210625Q6F', '2025-12-03 09:04:26', '2025-12-28 08:09:17'),
('202210631', 'Student', 'ic.marcedlin.pasquin.cvsu.edu.ph', '123', 'Marc Edlin', 'Pasquin', 'Reyes', 'Information Technology', '4D', 'FIRST', '2003-12-02', 'Male', '91234567891', 'Active', '2003-12-02Student20221063131G', '2025-12-03 09:04:30', '2025-12-28 08:09:20'),
('202210669', 'Student', 'ic.geruel.alcaraz@cvsu.edu.ph', '123', 'Geruel', 'Alcaraz', 'Hilado', 'Information Technology', '4G', 'FIRST', '2002-12-09', 'Male', '91234567891', 'Active', '2002-12-09Student202210669QK1', '2025-12-03 09:04:30', '2025-12-28 08:09:23'),
('202210700', 'Student', 'ic.johncarmichael.delosreyes@cvsu.edu.ph', '123', 'John Car Michael', 'Delos Reyes', 'Delos Santos', 'Information Technology', '4G', 'FIRST', '2002-05-18', 'Male', '91234567891', 'Active', '2002-05-18Student202210700HLR', '2025-12-03 09:04:33', '2025-12-28 08:09:28'),
('202210718', 'Student', 'ic.michaelrhoi.gonzales@cvsu.edu.ph', '123', 'Michael Rhoi', 'Gonzales', 'Ladrica', 'Information Technology', '4D', 'FIRST', '2004-06-20', 'Female', '9085527790', 'Active', '06202004Student20221071868Q', '2025-12-03 09:04:36', '2025-12-28 08:09:31'),
('202210781', 'Student', 'ic.cherlyvic.bakilid@cvsu.edu.ph', '123', 'Cherly Vic', 'Bakilid', 'C', 'Information Technology', '4F', 'FIRST', '2002-11-17', 'Female', '9168773102', 'Active', '2002-11-17Student2022107819E3', '2025-12-03 09:04:40', '2025-12-28 08:09:35'),
('202210784', 'Student', 'ic.jeannen.basay@cvsu.edu.ph', '123', 'Jeannen', 'Basay', 'Kummer', 'Information Technology', '4F', 'FIRST', '2002-03-24', 'Female', '0', 'Active', '03242002Student202210784TFR', '2025-12-03 09:04:43', '2025-12-28 08:09:37'),
('202210808', 'Student', 'ic.walidbinsaid.dimao@cvsu.edu.ph', '123', 'Walid Binsaid', 'Dimao', 'Lucman', 'Information Technology', '4E', 'FIRST', '2003-05-18', 'Male', '91234567891', 'Active', '2003-05-18Student202210808BFW', '2025-12-03 09:04:46', '2025-12-28 08:09:40'),
('202210834', 'Student', 'ic.shaunrusselle.obsenares@cvsu.edu.ph', '123', 'Shaun Russelle', 'Obseñares', 'Merano', 'Information Technology', '4E', 'FIRST', '2002-07-31', 'Male', '91234567891', 'Active', '2002-07-31Student202210834EQ8', '2025-12-03 09:04:49', '2025-12-28 08:09:45'),
('202210836', 'Student', 'ic.ferdinand.olaira@cvsu.edu.ph', '123', 'Ferdinand', 'Olaira', 'Villamor', 'Information Technology', '4D', 'FIRST', '2004-12-04', 'Male', '91234567891', 'Active', '2004-12-04Student202210836C5Q', '2025-12-03 09:04:53', '2025-12-28 08:09:48'),
('202210838', 'Student', 'ic.katejustine.pades@cvsu.edu.ph', '123', 'Kate Justine', 'Pades', 'B', 'Information Technology', '4D', 'FIRST', '2003-05-13', 'Female', '9777429816', 'Active', '2003-05-13Student20221083829U', '2025-12-03 09:04:56', '2025-12-28 08:09:51'),
('202210844', 'Student', 'ic.reween.rambonanza@cvsu.edu.ph', '123', 'Reween', 'Rambonanza', 'Ocampo', 'Information Technology', '4C', 'FIRST', '2000-12-25', 'Male', '91234567891', 'Active', '2000-12-25Student202210844NO8', '2025-12-03 09:04:59', '2025-12-28 08:09:54'),
('202210867', 'Student', 'ic.erwin.vallez@cvsu.edu.ph', '123', 'Erwin', 'Vallez', 'Manalo', 'Information Technology', '4C', 'FIRST', '2003-11-24', 'Male', '91234567891', 'Active', '2003-11-24Student202210867TFM', '2025-12-03 09:05:03', '2025-12-28 08:09:56'),
('202210868', 'Student', 'ic.cristelnicole.vergara@cvsu.edu.ph', '123', 'Cristel Nicole', 'Vergara', 'S', 'Information Technology', '4B', 'First', '2003-06-21', 'Female', '9234400863', 'Active', '2003-06-21Student202210868AB1', '2025-12-03 09:05:06', '2025-12-28 08:10:01'),
('202210870', 'Student', 'ic.xyrilljohn.abreu@cvsu.edu.ph', '$2y$10$V72I5BNHg/R4mwSK2YForeRffjDDIsM9MNVcZIShgOcF00/uHn/iS', 'Xyrill John', 'Abreu', 'Fecundo', 'Information Technology', '4B', 'FIRST', '2003-08-03', 'Female', '9422169425', 'Active', '08032003Student202210870H0D', '2025-12-03 09:05:09', '2025-12-28 08:12:29'),
('202210881', 'Student', 'ic.gerandyernest.buensuceso@cvsu.edu.ph', '123', 'Gerandy Ernest', 'Buensuceso', 'Jamanila', 'Information Technology', '4A', 'FIRST', '2004-12-09', 'Male', '91234567891', 'Active', '2004-12-09Student202210881ZX0', '2025-12-03 09:05:12', '2025-12-28 08:10:07'),
('202211199', 'Student', 'ic.desalit.jeann@cvsu.edu.ph', '123', 'Jeann', 'Desalit', 'Boaw', 'Information Technology', '4A', 'FIRST', '2002-01-07', 'Female', '91234567891', 'Active', '2002-01-07Student2022111990R2', '2025-12-03 09:05:16', '2025-12-28 08:10:09'),
('20230003', 'Student', 'ic.juliaann.fajardo@cvsu.edu.ph', '123', 'Julia Ann', 'Fajardo', 'Sisno', 'Information Technology', '4A', 'FIRST', '2001-06-07', 'Female', '9679532083', 'Active', '06072001Student20230003NB3', '2025-12-03 09:05:19', '2025-12-28 08:10:15');

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
-- Indexes for table `announcement_read_status`
--
ALTER TABLE `announcement_read_status`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_announcement_student` (`announcement_ID`,`student_ID`),
  ADD KEY `announcement_ID` (`announcement_ID`),
  ADD KEY `student_ID` (`student_ID`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=105;

--
-- AUTO_INCREMENT for table `activity_files`
--
ALTER TABLE `activity_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `activity_grades`
--
ALTER TABLE `activity_grades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=589;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `announcement_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `announcement_read_status`
--
ALTER TABLE `announcement_read_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=186;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `student_classes`
--
ALTER TABLE `student_classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

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
-- Constraints for table `announcement_read_status`
--
ALTER TABLE `announcement_read_status`
  ADD CONSTRAINT `announcement_read_status_ibfk_1` FOREIGN KEY (`announcement_ID`) REFERENCES `announcements` (`announcement_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `announcement_read_status_ibfk_2` FOREIGN KEY (`student_ID`) REFERENCES `tracked_users` (`tracked_ID`) ON DELETE CASCADE;

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
