-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th9 27, 2023 lúc 10:29 AM
-- Phiên bản máy phục vụ: 10.4.28-MariaDB
-- Phiên bản PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `db_app`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `roles`
--

CREATE TABLE `roles` (
  `role_id` int(255) NOT NULL,
  `role_key` text NOT NULL,
  `role_name` text NOT NULL,
  `role_rights` text NOT NULL,
  `role_detail` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`role_id`, `role_key`, `role_name`, `role_rights`, `role_detail`) VALUES
(1, 'admin', 'Quản Trị Viên', 'super_permision', 'Quyền của quản trị viên cao cấp'),
(2, 'mod', 'Cộng tác viên', 'view_user;view_catalog;edit_catalog;add_catalog;add_item', 'Quyền của cộng tác viên bao gồm các quyền nhập kho'),
(3, 'user', 'Người dùng', '', 'Thành viên bình thường, chỉ xem được các mục cơ bản'),
(4, 'superuser', 'Người dùng cấp cao', 'view_all', 'Dành cho các sếp -  xem được tất cả thông tin nhưng không chỉnh sửa được'),
(5, 'usermod', 'Cộng tác viên (Kỹ thuật)', '', 'Dành cho các kỹ thuật viên - có quyền thêm sửa xoá tài liệu kỹ thuật của sản phẩm');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `user_id` int(255) NOT NULL,
  `user_name` text NOT NULL,
  `user_password` text NOT NULL,
  `user_fullname` text NOT NULL,
  `user_token` text NOT NULL,
  `user_avatar` text NOT NULL,
  `user_email` text NOT NULL,
  `user_role` text NOT NULL,
  `user_key` text NOT NULL,
  `user_logs` text NOT NULL,
  `user_loginid` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`user_id`, `user_name`, `user_password`, `user_fullname`, `user_token`, `user_avatar`, `user_email`, `user_role`, `user_key`, `user_logs`, `user_loginid`) VALUES
(1, 'admin', '$2b$10$iIR9FNDKGrf.B2556SkX4.fdu7JN7f2r4P0cjxwuPKyi0WpLmy1EO', 'Trần Minh Thức', 'HZbxAHn7WnE5JHcwVjEpfA63SQ5Rp039a05D62JwZ2Vo6uQSNGsIIkfsGygJxkIzkqyJJzjEvHoVZfURfSbLhyQAaQaaraQ0niBx', '', 'thuc@faha.io.vn', 'admin', '0fb2c987-dc79-488b-a7ff-9c6556d85f91', 'createNew:1693991328442@', '0a26f7e0-9edf-48c0-9074-321c0d2c66b2');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `wh_catalogs`
--

CREATE TABLE `wh_catalogs` (
  `cat_id` int(255) NOT NULL,
  `cat_key` text NOT NULL,
  `cat_name` text NOT NULL,
  `cat_detail` text NOT NULL,
  `cat_uuid` text NOT NULL,
  `cat_enable` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `wh_catalogs`
--

INSERT INTO `wh_catalogs` (`cat_id`, `cat_key`, `cat_name`, `cat_detail`, `cat_uuid`, `cat_enable`) VALUES
(1, '01', 'Nhóm 1', 'mã nhóm 1', '9652af7b-862d-4a06-ac8a-ecd034b532bf', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `wh_customers`
--

CREATE TABLE `wh_customers` (
  `id` int(255) NOT NULL,
  `cus_key` text NOT NULL,
  `cus_name` text NOT NULL,
  `cus_detail` text NOT NULL,
  `cus_uuid` text NOT NULL,
  `cus_enable` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `wh_itemdata`
--

CREATE TABLE `wh_itemdata` (
  `id` int(255) NOT NULL,
  `it_key` text NOT NULL,
  `it_uuid` text NOT NULL,
  `item_uuid` text NOT NULL,
  `it_price` text NOT NULL,
  `it_amount` text NOT NULL,
  `whs_uuid` text NOT NULL,
  `it_serial` text NOT NULL,
  `it_note` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `wh_items`
--

CREATE TABLE `wh_items` (
  `id` int(255) NOT NULL,
  `item_uuid` text NOT NULL,
  `item_key` text NOT NULL,
  `item_name` text NOT NULL,
  `item_namesub` text NOT NULL,
  `item_part` text NOT NULL,
  `item_serial` text NOT NULL,
  `item_detail` text NOT NULL,
  `cat_uuid` text NOT NULL,
  `whs_uuid` text NOT NULL,
  `item_amount` text NOT NULL,
  `item_price` text NOT NULL,
  `item_note` text NOT NULL,
  `item_status` text NOT NULL,
  `item_image` text NOT NULL,
  `item_createdate` text NOT NULL,
  `item_changedate` text NOT NULL,
  `man_uuid` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `wh_items`
--

INSERT INTO `wh_items` (`id`, `item_uuid`, `item_key`, `item_name`, `item_namesub`, `item_part`, `item_serial`, `item_detail`, `cat_uuid`, `whs_uuid`, `item_amount`, `item_price`, `item_note`, `item_status`, `item_image`, `item_createdate`, `item_changedate`, `man_uuid`) VALUES
(1, '3cd66d0b-f2a3-48fb-b74c-42f009b85bfc', 'DM04DM', 'Sản phẩm số 01', 'tên trên hoá đơn', 'PARTM', 'DEMO', 'thông tin sản phẩm', '9652af7b-862d-4a06-ac8a-ecd034b532bf', 'NULLWHS', '-1', '10000', 'không có ghi chú', 'DEMO', ' ảnh sp', '', '', '4e4dd653-c6e8-4fca-b430-63d436ead8b7'),
(2, '6b36e132-1f4d-439f-89c3-f90a9f808c5e', 'DM01DM', 'Sản phẩm số 2', 'tên trên hoá đơn 2', 'PARTMM', 'DEMO', 'thông tin sản phẩmd', '9652af7b-862d-4a06-ac8a-ecd034b532bf', 'NULLWHS', '-1', '10000', 'không có ghi chú', 'DEMO', ' ảnh sp', '', '', '4e4dd653-c6e8-4fca-b430-63d436ead8b7');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `wh_manufactors`
--

CREATE TABLE `wh_manufactors` (
  `id` int(255) NOT NULL,
  `man_name` text NOT NULL,
  `man_detail` text NOT NULL,
  `man_uuid` text NOT NULL,
  `man_key` text NOT NULL,
  `man_enable` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `wh_manufactors`
--

INSERT INTO `wh_manufactors` (`id`, `man_name`, `man_detail`, `man_uuid`, `man_key`, `man_enable`) VALUES
(1, 'OMRON', 'OMRON', '4e4dd653-c6e8-4fca-b430-63d436ead8b7', 'OMRON', '1');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `wh_warehouses`
--

CREATE TABLE `wh_warehouses` (
  `id` int(255) NOT NULL,
  `whs_name` text NOT NULL,
  `whs_key` text NOT NULL,
  `whs_detail` text NOT NULL,
  `whs_uuid` text NOT NULL,
  `whs_enable` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `wh_warehouses`
--

INSERT INTO `wh_warehouses` (`id`, `whs_name`, `whs_key`, `whs_detail`, `whs_uuid`, `whs_enable`) VALUES
(2, 'Kho máy móc', 'MM', 'mô tả', '6ff779f3-acea-4637-9c86-ba6f3aa0eb50', 1);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `user_name` (`user_name`) USING HASH,
  ADD UNIQUE KEY `token` (`user_token`) USING HASH,
  ADD UNIQUE KEY `uuid` (`user_key`) USING HASH;

--
-- Chỉ mục cho bảng `wh_catalogs`
--
ALTER TABLE `wh_catalogs`
  ADD PRIMARY KEY (`cat_id`);

--
-- Chỉ mục cho bảng `wh_customers`
--
ALTER TABLE `wh_customers`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `wh_itemdata`
--
ALTER TABLE `wh_itemdata`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `wh_items`
--
ALTER TABLE `wh_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `item_uuid` (`item_uuid`) USING HASH;

--
-- Chỉ mục cho bảng `wh_manufactors`
--
ALTER TABLE `wh_manufactors`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `wh_warehouses`
--
ALTER TABLE `wh_warehouses`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `wh_catalogs`
--
ALTER TABLE `wh_catalogs`
  MODIFY `cat_id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `wh_customers`
--
ALTER TABLE `wh_customers`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `wh_itemdata`
--
ALTER TABLE `wh_itemdata`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `wh_items`
--
ALTER TABLE `wh_items`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `wh_manufactors`
--
ALTER TABLE `wh_manufactors`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `wh_warehouses`
--
ALTER TABLE `wh_warehouses`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
