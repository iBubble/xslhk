# 云南星势力航空科技有限公司官方系统
## 系统操作与维护手册 (Operation & Maintenance Manual)

本手册专为**云南星势力航空科技有限公司（Yunnan Xingshili Aviation Technology Co., Ltd）**官方网站及后台管理系统的运维人员和内容管理人员编写，旨在保障系统长期稳定运行并协助快速进行内容迭代与数据灾备。

---

## 一、 系统架构与技术栈概述

本网站采用现代化、全栈化的高性能 React 生态架构体系，具备极致的视觉响应速度、暗色玻璃拟态 UI 体验以及强大的后台管理逻辑。

*   **前端逻辑/渲染框架**：Next.js 16.2+ (基于 App Router、React Server Components 及 Server Actions 服务端动作机制)
*   **交互逻辑库**：React 19.2 (提供流畅的客户端无刷新渲染)
*   **数据库底层**：Prisma ORM 5.15 + SQLite 轻量高性能关系型文件数据库
*   **后端运行环境**：Node.js v20+
*   **用户会话认证**：NextAuth.js 4.24 (基于哈希加盐密码校验，防止未授权访问)
*   **运维守护程序**：PM2 进程管理器 (多核负载均衡、自动防崩溃重载)
*   **反向代理服务**：Nginx (多端口转发与 HTTPS 证书动态解析)
*   **网络安全协议**：TLS/SSL (由 Certbot 服务自动续签 Let's Encrypt 证书)

---

## 二、 运行环境配置与初始化

### 1. 软件环境要求
*   **操作系统**：Linux Ubuntu 20.04+ 或 CentOS 8+ (当前部署环境为腾讯云 CentOS/Ubuntu 主机)
*   **环境依赖**：Node.js >= 20.0.0，npm >= 10.0.0，cURL 工具 (用于微信图片防盗链抓取)

### 2. 初始化安装步骤
当系统迁移至新服务器或在本地开发时，请依次执行以下命令：

```bash
# 1. 克隆/上传项目代码到部署目录并进入目录
cd /root/wwwroot/xslhk

# 2. 安装项目全部 node_modules 依赖包
npm install

# 3. 初始化并同步 SQLite 数据库模型 (根据 schema.prisma)
npx prisma generate
npx prisma db push
```

### 3. 数据种子注入 (Bootstrap / Seeding)
系统预留了高规格的数据注入脚本，用于快速恢复默认演示文章或初始化管理员账号。

*   **管理员账号及默认业务数据初始化**：
    需要通过环境变量传入管理员密码：
    ```bash
    ADMIN_PASSWORD=您的新管理员密码 node seed.js
    ```
*   **高拟真行业演示数据批量注入**：
    该脚本为公司动态、维修课程、风采展示、项目合作四大板块各注入了10篇（共40篇）图文并茂的行业真实演示文章，极大方便演示：
    ```bash
    node prisma/add_seed_data.js
    ```

---

## 三、 本地开发与调试指南

在本地开发电脑进行修改或日常调试时，请执行以下命令：

```bash
# 启动 Next.js 极速热重载开发服务器
npm run dev
```
启动成功后，打开浏览器访问：`http://localhost:3000` 即可实时预览修改效果。

---

## 四、 生产环境部署与运维流程

项目在正式上线环境中采用 **Nginx 反向代理** 结合 **PM2 进程守护** 机制，日常代码热更新或打包发布，请严格遵循以下步骤：

### 1. 生产构建编译 (Build)
```bash
# 1. 进入生产部署目录
cd /root/wwwroot/xslhk

# 2. 生成最新 Prisma 客户端模型
npx prisma generate

# 3. 编译打包 Next.js 生产静态页面与服务端组件
npm run build
```

### 2. PM2 进程守护重启 (PM2 reload)
系统在 PM2 中的进程守护名称为 `samplesite`（或根据配置文件决定），构建成功后执行热重载或重启：

```bash
# 方式1：平滑热重载（零宕机时间，推荐）
pm2 reload samplesite

# 方式2：完全强制重启（适合涉及底层持久化重大修改）
pm2 restart samplesite

# 查看运行状态与资源占用率
pm2 status
```

### 3. Nginx 代理配置与 SSL 维护
*   **Nginx 配置文件**：
    项目内自带的 Nginx 配置文件为 `www.ynxslhk.com.conf`（对应线上 `/etc/nginx/sites-available/`）。它将 `https://www.ynxslhk.com` 的流量反向代理到本地 `3000` 端口。
*   **HTTPS 证书自动续签**：
    SSL 证书由 `certbot` 机制强力守护，部署了系统 `cron` 自动服务进行续期，无需人工介入。如需手动检验续期逻辑：
    ```bash
    certbot renew --dry-run
    ```

---

## 五、 后台管理系统操作指南 (Admin Guide)

后台控制面板为网站的管理者提供了全方位的可视化配置体验，免除了任何代码修改成本。

### 1. 登录后台系统
*   **登录入口**：[https://www.ynxslhk.com/auth/signin](https://www.ynxslhk.com/auth/signin)
*   **默认管理员账号**：`admin`
*   **默认管理员密码**：`Xslhk@2026` *(提示：登录后请第一时间到“修改密码”页面变更为企业高强度密码)*

### 2. 首页 Hero 轮播图管理 (Carousel)
*   **路径**：后台侧边栏 -> `Carousel 轮播图管理` (`/admin/hero`)
*   **说明**：支持添加、修改、物理删除轮播大图，可在此配置每张大图的：一二三级精美标语、跳转链接、背景图及排序优先级（优先级数字越大越靠前）。

### 3. 全局基本配置与动态数据指标 (Config)
*   **路径**：后台侧边栏 -> `基本信息管理` (`/admin/config`)
*   **说明**：
    *   支持动态表单直接修改企业全局备案号、网站名称等；
    *   **核心数据自定义**：支持可视化配置**首页 4 大黄金数据指标**（如“维修成功率 - 100%”）和**关于页 4 大核心数据条**。修改保存后，前台动态热更新同步刷新，完美对 SEO 友好。

### 4. 微信公众号文章同步操作 (WeChat Sync)
本项目深度定制了**微信公众号文章自动化抓取与防盗链落库功能**。主要操作有两种：

#### 🖥️ 方法一：后台可视化配置与一键同步（推荐）
1.  **参数配置**：
    进入后台「微信文章同步设置」板块，填入您微信公众号开发者平台的 `AppID`、`AppSecret`、`Token` 及加解密 `AESKey`，并将自动同步滑块开启。
2.  **提取接收**：
    系统后台提供了微信同步快捷接口 API 通道 `/api/wechat/sync`。每当有公众号同步推送，只需将包含文章信息的 POST JSON 请求发送至此路由，或者直接在后台点击“一键提取”，系统即可自动拉取最新动态。

#### 🐚 方法二：命令行极速批量抓取脚本（备用）
对于历史公众号存量文章，系统内置了高度防盗链的 `import-wx-articles.js` 物理下载镜像脚本。
1.  **填入链接**：
    打开 `/root/wwwroot/xslhk/import-wx-articles.js`，将需要抓取的微信公众号文章链接写入顶部的 `ARTICLE_URLS` 数组中。
2.  **执行抓取**：
    在服务器终端运行：
    ```bash
    node import-wx-articles.js
    ```
3.  **防盗链镜像原理**：
    由于微信图片存在防热链限制（直接引用会在外站显示 403 裂图）。该脚本在抓取微信富文本内容的同时，会通过底层 cURL 子进程自动将文章中引用的所有图片资源物理下载保存到本地 `/public/wx-images/` 中，并将文章正文中的图片地址自动替换为本地镜像路径，落库至 SQLite 的 `News` 表，保障图片 100% 永久正常显示。

### 5. 公司动态、维修课程、风采画廊、项目合作 CRUD 与批量删除
*   **统一组件**：全局配备了高度封装的 `AdminBatchTable` 批量操作组件。
*   **删除保护**：删除按钮具备高风险红色警示二次弹窗确认确认，防止误操作。
*   **降序排列**：后台对上述内容新录入的信息，前台展示列表默认按时间降序倒序呈现，确保新录入的优质内容秒级置顶。

### 6. 用户诉求与在线咨询处理 (Inbox)
*   **路径**：后台侧边栏 -> `在线咨询管理` (`/admin/contacts`)
*   **说明**：用户在前台“联系我们”提交的无人机维修申请或合作意愿，将实时记录在此收件箱中。管理员可直观查阅留言详情、记录对方电话，并将处理状态置为“处理中(PROCESSING)”或“已完成(COMPLETED)”进行业务归档。

---

## 六、 生产环境备份与灾备恢复指南 (Backup)

为了防范云服务器硬盘损坏或遭遇勒索病毒等极端险情，运维人员必须养成定期备份的习惯。

### 1. 系统完整冷备份机制
项目已在上一级目录中提供了一份纯净部署版本的物理备份包：
*   **物理备份包路径**：`/root/wwwroot/xslhk_backup_20260519_final_v2.tar.gz`
*   **备份包内已排除**：无用的大体积文件夹 `.next` 缓存、`node_modules` 依赖以及 `.git` 版本历史，从而将整个系统包体积完美压缩至极轻量的 **25 MB**。

### 2. 灾备恢复步骤 (秒级重建)
如果服务器需要迁移或完全重装，只需 4 步即可瞬间 100% 完美复刻当前巅峰运行状态：

```bash
# 1. 复制备份包至新服务器的 wwwroot 并解压
tar -zxvf xslhk_backup_20260519_final_v2.tar.gz -C /root/wwwroot/

# 2. 进入解压后的目录
cd /root/wwwroot/xslhk

# 3. 一键安装 Node 依赖
npm install

# 4. Prisma 客户端重塑并编译 Next.js
npx prisma generate
npm run build

# 5. 启动 PM2 守护进程
pm2 start ecosystem.config.js (或 pm2 start npm --name "samplesite" -- run start)
```
重建完毕，网站即刻上线！
