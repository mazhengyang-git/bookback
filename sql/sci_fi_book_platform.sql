-- MySQL dump 10.13  Distrib 8.0.28, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: sci_fi_book_platform
-- ------------------------------------------------------
-- Server version	8.0.28

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
-- Table structure for table `announcement`
--

DROP TABLE IF EXISTS `announcement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcement` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '公告ID',
  `title` varchar(100) NOT NULL COMMENT '公告标题',
  `content` text NOT NULL COMMENT '公告内容',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `admin_id` int NOT NULL COMMENT '发布公告的管理员ID',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='系统公告表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `book`
--

DROP TABLE IF EXISTS `book`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `book` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '图书ID',
  `book_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '图书名称',
  `author` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '作者',
  `author_into` text COLLATE utf8mb4_unicode_ci COMMENT '作者简介',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '图书分类（硬科幻/软科幻）',
  `price` decimal(10,2) NOT NULL COMMENT '图书单价',
  `stock` int NOT NULL DEFAULT '0' COMMENT '库存',
  `sales_count` int NOT NULL DEFAULT '0' COMMENT '累计销量',
  `cover` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '图书封面URL',
  `desc` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '图书简介',
  `mulu` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '图书目录',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '上下架状态 1=上架 0=下架',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `avg_score` decimal(2,1) NOT NULL DEFAULT '0.0' COMMENT '图书综合平均分 0.0-5.0',
  `comment_count` int NOT NULL DEFAULT '0' COMMENT '总评价人数',
  `publisher` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '出版社',
  PRIMARY KEY (`id`),
  KEY `idx_book_category` (`category`),
  KEY `idx_book_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='图书表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `book_comment`
--

DROP TABLE IF EXISTS `book_comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `book_comment` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '评价ID 主键',
  `book_id` int NOT NULL COMMENT '关联图书ID 对应book表主键id',
  `user_id` int NOT NULL COMMENT '评价用户ID 对应用户表主键id',
  `order_id` int DEFAULT NULL COMMENT '关联本次评价对应的订单ID 对应order表主键id',
  `score` decimal(2,1) NOT NULL COMMENT '图书评分 0.0~5.0',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '用户文字评价内容',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '评价提交时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `book_type` enum('book','newbook') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'book' COMMENT '图书类型：book/newbook',
  `source` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal' COMMENT '图书来源：normal-普通图书 new-新书',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_book_source` (`user_id`,`book_id`,`source`),
  KEY `idx_book_id` (`book_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_order_id` (`order_id`),
  CONSTRAINT `fk_comment_order` FOREIGN KEY (`order_id`) REFERENCES `order` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_comment_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='图书用户评价表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `book_comment_reply`
--

DROP TABLE IF EXISTS `book_comment_reply`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `book_comment_reply` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '追评ID',
  `comment_id` int NOT NULL COMMENT '主评论ID',
  `user_id` int NOT NULL COMMENT '追评用户ID',
  `content` text NOT NULL COMMENT '追评内容',
  `source` varchar(20) NOT NULL COMMENT '数据来源：normal/new/seller',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_comment_id` (`comment_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `book_comment_reply_ibfk_1` FOREIGN KEY (`comment_id`) REFERENCES `book_comment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='图书评价追评表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `book_discount`
--

DROP TABLE IF EXISTS `book_discount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `book_discount` (
  `id` int NOT NULL AUTO_INCREMENT,
  `book_id` int NOT NULL,
  `discount_price` decimal(10,2) DEFAULT NULL,
  `discount_rate` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `book_type` tinyint DEFAULT '0' COMMENT '0-普通图书 1-新书',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_book_type_id` (`book_id`,`book_type`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '购物车项ID',
  `user_id` int NOT NULL COMMENT '关联user表的id（数字）',
  `goods_id` int NOT NULL COMMENT '关联book表的id（数字）',
  `quantity` int NOT NULL DEFAULT '1' COMMENT '商品数量',
  `spec` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '商品规格（平装/精装）',
  `book_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '图书名称（冗余存储）',
  `book_price` decimal(10,2) NOT NULL COMMENT '图书价格（冗余存储）',
  `book_cover` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '图书封面（冗余存储）',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `source` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'normal' COMMENT '图书来源：normal-普通书 new-新书',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_goods_spec` (`user_id`,`goods_id`,`spec`),
  KEY `goods_id` (`goods_id`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`goods_id`) REFERENCES `book` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=244 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物车表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gonggao`
--

DROP TABLE IF EXISTS `gonggao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gonggao` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '公告ID',
  `title` varchar(100) NOT NULL COMMENT '公告标题',
  `content` text NOT NULL COMMENT '公告内容',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `admin_id` int NOT NULL COMMENT '发布公告的管理员ID',
  `user_id` bigint DEFAULT NULL COMMENT '接收用户ID NULL=全局公告',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='系统公告表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `goods`
--

DROP TABLE IF EXISTS `goods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `goods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `huodong`
--

DROP TABLE IF EXISTS `huodong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `huodong` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '活动ID',
  `name` varchar(255) DEFAULT '' COMMENT '活动名称',
  `desc` varchar(500) DEFAULT '' COMMENT '活动描述',
  `image` varchar(500) DEFAULT '' COMMENT '活动图片',
  `url` varchar(500) DEFAULT '' COMMENT '跳转链接',
  `title` varchar(255) DEFAULT '' COMMENT '活动标题',
  `status` int DEFAULT '0' COMMENT '状态 0=未开始 1=进行中 2=快结束 3=已结束 4=已取消',
  `time` varchar(100) DEFAULT '' COMMENT '活动时间',
  `content` text COMMENT '活动内容详情',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `page_type` varchar(32) DEFAULT 'default' COMMENT '页面类型：default=默认,article=文章,sign=报名,vote=投票',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='活动表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `huodong_detail`
--

DROP TABLE IF EXISTS `huodong_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `huodong_detail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activity_id` int NOT NULL COMMENT '活动ID',
  `activity_title` varchar(255) NOT NULL COMMENT '活动标题（防重建）',
  `desc` text COMMENT '简介',
  `content` longtext COMMENT '富文本详情',
  `extra_fields` json DEFAULT NULL COMMENT '扩展字段',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_id_title` (`activity_id`,`activity_title`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `newbook`
--

DROP TABLE IF EXISTS `newbook`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newbook` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '图书ID',
  `book_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '图书名称',
  `author` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '作者',
  `author_into` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '作者简介',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '图书分类（硬科幻/软科幻）',
  `price` decimal(10,2) NOT NULL COMMENT '图书单价',
  `stock` int NOT NULL DEFAULT '0' COMMENT '库存',
  `sales_count` int NOT NULL DEFAULT '0' COMMENT '累计销量',
  `cover` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '图书封面URL',
  `desc` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '图书简介',
  `mulu` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '图书目录',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '上下架状态 1=上架 0=下架',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `avg_score` decimal(2,1) NOT NULL DEFAULT '0.0' COMMENT '图书综合平均分 0.0-5.0',
  `comment_count` int NOT NULL DEFAULT '0' COMMENT '总评价人数',
  `publisher` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '出版社',
  PRIMARY KEY (`id`),
  KEY `idx_book_category` (`category`),
  KEY `idx_book_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新图书表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '订单编号（唯一）',
  `user_id` int NOT NULL COMMENT '关联用户ID',
  `book_id` int NOT NULL COMMENT '关联图书ID',
  `count` int NOT NULL DEFAULT '1' COMMENT '购买数量',
  `total_price` decimal(10,2) NOT NULL COMMENT '订单总价',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '待付款' COMMENT '订单状态：待付款/已付款/已完成/已取消',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `source` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'normal' COMMENT '商品来源：normal=普通书 new=新书',
  `sales_recorded` tinyint NOT NULL DEFAULT '0' COMMENT '1=本单销量已计入图书sales_count',
  `province` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '省',
  `city` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '市',
  `district` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '区',
  `detail_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '详细地址',
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_no` (`order_no`),
  KEY `user_id` (`user_id`),
  KEY `book_id` (`book_id`),
  CONSTRAINT `order_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `book` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=157 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `seller`
--

DROP TABLE IF EXISTS `seller`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '卖家店铺ID',
  `user_id` int NOT NULL COMMENT '关联用户表 user.id',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '店铺头像URL',
  `shop_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '店铺名称',
  `intro` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '店铺简介',
  `contact` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '联系方式',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_seller_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='卖家店铺表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `seller_book`
--

DROP TABLE IF EXISTS `seller_book`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller_book` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '卖家图书ID',
  `seller_id` int NOT NULL COMMENT '卖家店铺ID',
  `book_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '图书名称',
  `author` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '作者',
  `author_into` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '作者简介',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '图书分类',
  `price` decimal(10,2) NOT NULL COMMENT '图书单价',
  `stock` int NOT NULL DEFAULT '0' COMMENT '库存',
  `sales_count` int NOT NULL DEFAULT '0' COMMENT '累计销量',
  `cover` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '封面URL',
  `desc` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '图书简介',
  `mulu` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '图书目录',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '上下架 1上架 0下架',
  `publisher` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '出版社',
  `avg_score` decimal(2,1) NOT NULL DEFAULT '0.0' COMMENT '平均分',
  `comment_count` int NOT NULL DEFAULT '0' COMMENT '评价数',
  `audit_status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '审核状态 1已通过',
  `audit_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '审核备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上架时间',
  PRIMARY KEY (`id`),
  KEY `idx_seller_book_seller` (`seller_id`),
  KEY `idx_seller_book_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='卖家正式图书表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `seller_bookapply`
--

DROP TABLE IF EXISTS `seller_bookapply`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller_bookapply` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '申请ID',
  `seller_id` int NOT NULL COMMENT '卖家店铺ID seller.id',
  `book_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '图书名称',
  `author` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '作者',
  `author_into` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '作者简介',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '图书分类',
  `price` decimal(10,2) NOT NULL COMMENT '图书单价',
  `stock` int NOT NULL DEFAULT '0' COMMENT '库存',
  `sales_count` int NOT NULL DEFAULT '0' COMMENT '累计销量',
  `cover` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '封面URL',
  `desc` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '图书简介',
  `mulu` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '图书目录',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '上下架 1上架 0下架',
  `publisher` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '出版社',
  `avg_score` decimal(2,1) NOT NULL DEFAULT '0.0' COMMENT '平均分',
  `comment_count` int NOT NULL DEFAULT '0' COMMENT '评价数',
  `audit_status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '审核状态 0待审核 1通过 2驳回',
  `audit_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '驳回原因',
  `source_book_id` int DEFAULT NULL COMMENT '关联已上架图书ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  PRIMARY KEY (`id`),
  KEY `idx_apply_seller` (`seller_id`),
  KEY `idx_apply_audit` (`audit_status`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='卖家图书上架申请表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `shoucang`
--

DROP TABLE IF EXISTS `shoucang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shoucang` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '收藏夹项ID',
  `user_id` int NOT NULL COMMENT '关联user表的id（数字）',
  `goods_id` int NOT NULL COMMENT '关联book表的id（数字）',
  `quantity` int NOT NULL DEFAULT '1' COMMENT '商品数量',
  `spec` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '商品规格（平装/精装）',
  `book_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '图书名称（冗余存储）',
  `book_price` decimal(10,2) NOT NULL COMMENT '图书价格（冗余存储）',
  `book_cover` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '图书封面（冗余存储）',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `source` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'normal' COMMENT '图书来源：normal-普通书 new-新书',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_goods_spec_source` (`user_id`,`goods_id`,`spec`,`source`),
  KEY `goods_id` (`goods_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `shoucang_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=235 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏夹表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sys_notice`
--

DROP TABLE IF EXISTS `sys_notice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_notice` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '公告ID',
  `notice_title` varchar(50) NOT NULL COMMENT '公告标题',
  `notice_content` text NOT NULL COMMENT '公告内容',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态 1=显示 0=隐藏',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建人',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新人',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `user_id` bigint DEFAULT NULL COMMENT '接收用户ID NULL=全局公告',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='系统公告表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `system_config`
--

DROP TABLE IF EXISTS `system_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_config` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `config_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '配置键（唯一）',
  `config_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '配置值（支持JSON）',
  `config_desc` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '配置说明',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名（唯一）',
  `password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码（加密存储）',
  `role` enum('buyer','seller','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'buyer' COMMENT '角色',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `phone` varchar(11) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '用户绑定手机号',
  `sign` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '个人签名',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_cart`
--

DROP TABLE IF EXISTS `user_cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `book_id` int NOT NULL,
  `count` int DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_book` (`user_id`,`book_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `zixun`
--

DROP TABLE IF EXISTS `zixun`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `zixun` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '资讯ID',
  `name` varchar(255) DEFAULT '' COMMENT '资讯名称',
  `desc` varchar(500) DEFAULT '' COMMENT '资讯简介',
  `image` varchar(500) DEFAULT '' COMMENT '封面图片',
  `url` varchar(500) DEFAULT '' COMMENT '跳转链接',
  `title` varchar(255) DEFAULT '' COMMENT '资讯标题',
  `status` int DEFAULT '0' COMMENT '状态 0=禁用 1=正常',
  `time` varchar(100) DEFAULT '' COMMENT '发布时间',
  `content` text COMMENT '资讯内容',
  `create_time` varchar(100) DEFAULT '' COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='图书资讯表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'sci_fi_book_platform'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-20 14:28:36
