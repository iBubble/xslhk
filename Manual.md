# 星势力航空科技系统使用与维护手册 (Manual)

本文档旨在为开发人员及运维人员提供云南星势力航空科技有限公司官网前端及后台管理系统的详细操作指南。

## 目录
1. [本地开发指南](#1-本地开发指南)
2. [演示种子数据注入](#2-演示种子数据注入)
3. [后台安全账户信息](#3-后台安全账户信息)
4. [生产环境部署与维护](#4-生产环境部署与维护)
5. [生产环境备份机制](#5-生产环境备份机制)

---

## 1. 本地开发指南 (Local Development)

首先，安装项目依赖：
```bash
npm install
```

初始化或同步 SQLite 数据库模型，请执行：
```bash
npx prisma generate
npx prisma db push
```

启动本地开发服务器：
```bash
npm run dev
```
启动后，打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可预览。

---

## 2. 演示种子数据注入

为便于交付和演示，项目内置了极高规格的真实种子数据脚本：
* **数据脚本路径**：`prisma/add_seed_data.js`
* **种子数据内容**：为公司动态、维修课程、风采展示和项目合作四大核心板块，各注入了 **10 篇共计 40 篇**具有极强西南低空行业说服力、图文并茂的真实硬核演示文章。
* **执行数据注入**：
  ```bash
  node prisma/add_seed_data.js
  ```

---

## 3. 后台安全账户信息

- **后台登录入口**: [https://www.ynxslhk.com/auth/signin](https://www.ynxslhk.com/auth/signin)
- **默认管理员账户**: `admin`
- **默认管理员密码**: `Xslhk@2026`
*(注：密码已加盐哈希存储在数据库中，确保企业信息安全)*

---

## 4. 生产环境部署与维护

由于项目在腾讯云服务器采用了 PM2 进程守护以及 Nginx 代理，日常迭代更新请遵循以下流程：

### 4.1 编译构建
当有代码更新或数据库 Schema 调整后，请进入部署目录执行构建：
```bash
# 1. 切换到部署目录
cd /root/wwwroot/xslhk

# 2. 生成 Prisma Client
npx prisma generate

# 3. 生产环境构建
npm run build
```

### 4.2 平滑重启
通过 PM2 执行零宕机热重载（Zero-downtime Reload）或进程重启：
```bash
# 平滑热重载
pm2 reload samplesite

# 强制完全重启 (推荐用于严重更新)
pm2 restart samplesite
```

### 4.3 Nginx 与 SSL 维护
- Nginx 反向代理配置路径位于 `/etc/nginx/sites-available/tencent.conf` 或项目内的 `hk.ynxslhk.com.conf`。
- SSL 证书由 `certbot` 守护，内部注册有 `systemd` 定时任务，全自动续签，无需人工干预。如遇紧急情况需要测试续签逻辑，可执行：
  ```bash
  certbot renew --dry-run
  ```

---

## 5. 生产环境备份机制

在核心功能全部调试就绪后，我们已为整个项目进行了一次**纯净的生产级压缩包打包**：
* **备份文件位置**：`/root/wwwroot/xslhk_backup_20260518_full.tar.gz` (位于项目部署的上一级目录中)
* **备份包体积**：**23 MB**
* **安全剔除项**：为了极速迁移和体积控制，备份已排除了 `.next`、`node_modules` 以及 `.git` 缓存。
* **快速移植指南**：在新的服务器解压此包后，只需依次运行 `npm install` -> `npm run build` -> `pm2 start`，即可在 1 分钟内 100% 完美复刻当前巅峰运行状态！
