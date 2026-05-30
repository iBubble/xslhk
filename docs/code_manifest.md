# 云南星势力航空科技有限公司官方系统
## 交付源码代码清单 (Source Code Inventory Manifest)

为了保障系统交付的完整性、透明性，并便于后期承接人员二次开发与审计，本清单对项目中**所有核心源文件、业务组件、接口路由、数据库模块及部署配置文件**进行了逐一盘点和功能标注。

---

## 一、 项目根目录核心脚本及配置文件 (Root Directory & Utilities)

| 文件路径 | 文件类型 | 主要用途与技术核心 |
| :--- | :--- | :--- |
| [package.json](file:///root/wwwroot/xslhk/package.json) | NPM 配置文件 | 定义项目名称、版本号，管理项目运行脚本（`dev`, `build`, `start`）及核心三方依赖库。 |
| [ecosystem.config.js](file:///root/wwwroot/xslhk/ecosystem.config.js) | PM2 配置文件 | 配置 PM2 生产级进程守护参数（进程名 `samplesite`，集群模式，环境变量，崩溃重启等）。 |
| [www.ynxslhk.com.conf](file:///root/wwwroot/xslhk/www.ynxslhk.com.conf) | Nginx 配置文件 | 生产环境 Nginx 反向代理配置，实现 80 端口 HTTP 流量自动重定向至 443 HTTPS，并转发流量至 Next.js (3000端口)。 |
| [generate.js](file:///root/wwwroot/xslhk/generate.js) | AI 模拟资源脚本 | 使用 Pollinations AI 序列化异步批量下载企业高清实拍及行业配图，保存至 `/public` 目录，杜绝破图。 |
| [import-wx-articles.js](file:///root/wwwroot/xslhk/import-wx-articles.js) | 微信导入脚本 | 批量抓取微信文章，绕过腾讯防盗链限制，使用 cURL 物理下载文章图片至服务器本地并镜像落库至 SQLite。 |
| [seed.js](file:///root/wwwroot/xslhk/seed.js) | 数据库种子脚本 | 一键初始化系统默认管理员账号 (`admin` / 自定义强密码) 并清除/重建演示用的公司动态及风采数据。 |
| [.env](file:///root/wwwroot/xslhk/.env) | 环境变量配置 | 存放数据库连接 URL (`DATABASE_URL=file:./dev.db`) 及 `NEXTAUTH_SECRET` 密钥等隐私字段。 |

---

## 二、 数据库与持久化层 (Prisma Database Layer)

| 文件路径 | 文件类型 | 主要用途与技术核心 |
| :--- | :--- | :--- |
| [prisma/schema.prisma](file:///root/wwwroot/xslhk/prisma/schema.prisma) | Prisma Schema | 系统数据库核心模型定义文件。声明使用 **SQLite** 驱动，并定义了 `User` (管理员), `HeroSlide` (轮播图), `News` (动态), `CourseItem` (课程), `ShowcaseItem` (风采), `CooperationProject` (合作项目), `AboutContent` (关于我们), `ContactRequest` (联系诉求) 和 `SystemConfig` (系统基本参数) 9张表。 |
| [prisma/add_seed_data.js](file:///root/wwwroot/xslhk/prisma/add_seed_data.js) | 数据注入脚本 | 预先编写的 40 篇极具说服力的图文并茂的演示种子数据注入代码。运行后自动批量装填。 |

---

## 三、 复用型 React 业务 UI 组件 (Reusable UI Components)

所有组件均存放于 `src/components/` 目录下，手写 Vanilla CSS 变量与玻璃磨砂拟态风格，追求高帧率无卡顿动画：

| 文件路径 | 组件名称 | 主要用途与技术核心 |
| :--- | :--- | :--- |
| [src/components/HomeHeroCarousel.js](file:///root/wwwroot/xslhk/src/components/HomeHeroCarousel.js) | `HomeHeroCarousel` | **首页核心大屏轮播组件**：支持多张高清大图无缝切换，内置 **Ken Burns 镜头三维渐进式缩放** 效果，配备小字、主大标题多级 Staggered 交错弹出动画，支持悬停暂停和手动箭头/高亮胶囊进度指示器。 |
| [src/components/AdminBatchTable.js](file:///root/wwwroot/xslhk/src/components/AdminBatchTable.js) | `AdminBatchTable` | **后台通用批量操作表格组件**：深度封装了多选框全选、单选反选逻辑。支持在客户端红底高警示弹窗二次确认，打通后台 `batch-delete` 批量删除通用 API。 |
| [src/components/ShowcaseGallery.js](file:///root/wwwroot/xslhk/src/components/ShowcaseGallery.js) | `ShowcaseGallery` | **风采画廊无刷新过滤面板**：客户端 React 过滤容器，支持分类零延迟秒速切换、客户端无刷新分页；自带磨砂玻璃 Lightbox 高品质灯箱，支持黑色阴影防护背景以及左右无级切图。 |
| [src/components/ContactForm.js](file:///root/wwwroot/xslhk/src/components/ContactForm.js) | `ContactForm` | **前台联系我们表单组件**：集成对姓名、电话、诉求类型的表单校验，使用 `fetch` 异步将诉求直接落库至后台管理库，避免传统跳转刷新的不良体验。 |
| [src/components/WeChatSyncButton.js](file:///root/wwwroot/xslhk/src/components/WeChatSyncButton.js) | `WeChatSyncButton` | **微信一键同步后台组件**：可放置于后台管理看板中，用于在 UI 层一键向服务器发起公众号同步拉取请求。 |
| [src/components/RichEditor.js](file:///root/wwwroot/xslhk/src/components/RichEditor.js) | `RichEditor` | **轻量级富文本编辑器**：为后台动态管理和课程描述提供可视化排版输入，避免排版破损。 |
| [src/components/Header.js](file:///root/wwwroot/xslhk/src/components/Header.js) | `Header` | **全站响应式顶部导航栏**：配备毛玻璃磨砂（Backdrop-Filter）悬浮视觉。右侧深度集成了全局即时搜索入口。 |
| [src/components/Footer.js](file:///root/wwwroot/xslhk/src/components/Footer.js) | `Footer` | **全站通用底部信息栏**：动态读取后台填写的网站基本信息（如备案号滇ICP备2026007307号）。 |

---

## 四、 后端 API 路由层 (Backend RESTful API Endpoints)

位于 `src/app/api/`，直接对接 Prisma 并暴露供前端/后台系统调用的 JSON 异步接口：

| 文件路径 | 接口路由 | 主要用途与技术核心 |
| :--- | :--- | :--- |
| [src/app/api/admin/batch-delete/route.js](file:///root/wwwroot/xslhk/src/app/api/admin/batch-delete/route.js) | `/api/admin/batch-delete` | **安全批量删除通用接口**：接收参数包含需要删除的数据库表名（Model Name）及 ID 数组，防越权删除，执行批量 Prisma 操作。 |
| [src/app/api/auth/[...nextauth]/route.js](file:///root/wwwroot/xslhk/src/app/api/auth/%5B...nextauth%5D/route.js) | `/api/auth/[...nextauth]` | **安全登录凭证认证接口**：NextAuth 身份认证接口。提供账户密码 Hash 校验及会话 JWT 分发。 |
| [src/app/api/contact/route.js](file:///root/wwwroot/xslhk/src/app/api/contact/route.js) | `/api/contact` | **用户诉求提交接收端口**：过滤并保存前台表单提交的留言和需求。 |
| [src/app/api/search/route.js](file:///root/wwwroot/xslhk/src/app/api/search/route.js) | `/api/search` | **全局即时模糊搜索接口**：在 SQLite 中使用 `Prisma.Promise.all` 并行模糊匹配查询课程、动态、合作项目、风采四张表，提供统一的分类气泡检索输出，性能卓越。 |
| [src/app/api/wechat/sync/route.js](file:///root/wwwroot/xslhk/src/app/api/wechat/sync/route.js) | `/api/wechat/sync` | **公众号文章自动导入主路由**：允许外部公众号推送以 POST 请求同步文章；同时可以抓取单篇文章，智能判断是否为微信链接，并自动执行图片下载及去重落库。 |
| [src/app/api/wechat/sync-articles/route.js](file:///root/wwwroot/xslhk/src/app/api/wechat/sync-articles/route.js) | `/api/wechat/sync-articles` | **微信接口认证与状态拉取接口**。 |
| [src/app/api/wechat/batch-import/route.js](file:///root/wwwroot/xslhk/src/app/api/wechat/batch-import/route.js) | `/api/wechat/batch-import` | **多文章批量异步队列导入端口**。 |

---

## 五、 前台展示页面路由层 (Frontend Website Routes)

采用 Next.js 16+ 的 App Router 文件物理路由架构，具备优秀的 SEO 特性：

| 文件路径 | 页面路由 | 主要用途与技术核心 |
| :--- | :--- | :--- |
| [src/app/layout.js](file:///root/wwwroot/xslhk/src/app/layout.js) | 全局 Layout 根组件 | 设置 HTML 顶层结构、多端视口自适应 Meta 标签，并注入全局 CSS 变量与 NextAuth SessionProvider 会话共享。 |
| [src/app/page.js](file:///root/wwwroot/xslhk/src/app/page.js) | `/` (首页) | 融合 `HomeHeroCarousel` 轮播，以 RSC 服务器端渲染并拉取高可用防崩溃首页图片，读取并呈现配置的首页黄金四大数据指标。 |
| [src/app/about/page.js](file:///root/wwwroot/xslhk/src/app/about/page.js) | `/about` (关于我们) | 呈现云南星势力官方历史简介、团队构成，动态载入后台「配置中心」修改的 4 大关于页数据条。 |
| [src/app/news/page.js](file:///root/wwwroot/xslhk/src/app/news/page.js) | `/news` (动态列表) | 服务端物理分页展示动态，引入高磨砂磨砂分页按扭，默认时间降序，完美迎合搜索引擎抓取。 |
| [src/app/news/[id]/page.js](file:///root/wwwroot/xslhk/src/app/news/%5Bid%5D/page.js) | `/news/[id]` (动态详情) | 微信公众号及站内原生文章的详情直达渲染，结构化展现富文本内容。 |
| [src/app/courses/page.js](file:///root/wwwroot/xslhk/src/app/courses/page.js) | `/courses` (维修课程) | 结构化列表呈现培训课程，支持课程大图、分类过滤展示及物理分页。 |
| [src/app/courses/[id]/page.js](file:///root/wwwroot/xslhk/src/app/courses/%5Bid%5D/page.js) | `/courses/[id]` (课程详情) | 单个无人机维修及考证课程的主题大纲介绍页。 |
| [src/app/showcase/page.js](file:///root/wwwroot/xslhk/src/app/showcase/page.js) | `/showcase` (风采展示) | 挂载 `ShowcaseGallery`，提供秒级客户端精美看图体验。 |
| [src/app/cooperation/page.js](file:///root/wwwroot/xslhk/src/app/cooperation/page.js) | `/cooperation` (项目合作) | 集中呈现历年经典政企民航测及植保项目。 |
| [src/app/contact/page.js](file:///root/wwwroot/xslhk/src/app/contact/page.js) | `/contact` (联系我们) | 表单式用户诉求提交页。 |

---

## 六、 可视化后台管理界面路由 (Admin Dashboard Pages)

均挂载于 `src/app/admin/` 物理目录下，内置权限核验守卫（未登录强制重定向至登录页 `/auth/signin`）：

| 文件路径 | 后台页面路由 | 主要用途与技术核心 |
| :--- | :--- | :--- |
| [src/app/admin/layout.js](file:///root/wwwroot/xslhk/src/app/admin/layout.js) | 后台全局 Layout | 左侧抽屉式折叠菜单架构（含轮播、文章、课程、风采、配置、诉求、密码等快捷入口），上方个人信息。 |
| [src/app/admin/page.js](file:///root/wwwroot/xslhk/src/app/admin/page.js) | `/admin` (主控制台) | 直观呈现系统全局数据统计看板：包括当前总动态数、总课程数、风采总图、未处理客户诉求留言数等仪表盘指标。 |
| [src/app/admin/hero/page.js](file:///root/wwwroot/xslhk/src/app/admin/hero/page.js) | `/admin/hero` | 可视化 CRUD 首页 Hero 轮播图广告，支持图片上传、按钮名称及重定向 URL 的表单录入。 |
| [src/app/admin/config/page.js](file:///root/wwwroot/xslhk/src/app/admin/config/page.js) | `/admin/config` | **全局基本配置与数据指标条中心**：提供全表单化操作，修改首页与关于页的 8 大数据指标标签与具体数值。 |
| [src/app/admin/wechat-import/page.js](file:///root/wwwroot/xslhk/src/app/admin/wechat-import/page.js) | `/admin/wechat-import` | 微信公众号参数设置看板，支持 AppID/AppSecret/Token 加密储存，并支持可视化一键测试接收端。 |
| [src/app/admin/contacts/page.js](file:///root/wwwroot/xslhk/src/app/admin/contacts/page.js) | `/admin/contacts` | 客户在线申请信箱列表，支持对特定客户咨询状态（如“待处理”、“处理中”、“已完成”）进行流转更改。 |
| [src/app/admin/news/page.js](file:///root/wwwroot/xslhk/src/app/admin/news/page.js) | `/admin/news` | 站内公司动态内容管理，支持带二次确认的通用批量删除与创建/修改。 |
| [src/app/admin/courses/page.js](file:///root/wwwroot/xslhk/src/app/admin/courses/page.js) | `/admin/courses` | 无人机培训及维修课程配置后台，可设置价格、课时和排序优先级。 |
| [src/app/admin/showcase/page.js](file:///root/wwwroot/xslhk/src/app/admin/showcase/page.js) | `/admin/showcase` | 现场实拍风采图册管理后台，支持录入图片并按“无人机维修”、“飞行训练”等分类检索管理。 |
| [src/app/admin/cooperation/page.js](file:///root/wwwroot/xslhk/src/app/admin/cooperation/page.js) | `/admin/cooperation` | 经典项目及大客户案例配置后台。 |
| [src/app/admin/password/page.js](file:///root/wwwroot/xslhk/src/app/admin/password/page.js) | `/admin/password` | 安全修改后台密码界面，防范账户泄密。 |

---

## 七、 共享类库与全局样式 (Library & Global Styling)

| 文件路径 | 类型 | 主要用途与技术核心 |
| :--- | :--- | :--- |
| [src/lib/prisma.js](file:///root/wwwroot/xslhk/src/lib/prisma.js) | Prisma 共享实例 | 单例模式初始化 PrismaClient，保障多核高并发访问下只维持一个 SQLite 数据库长连接，防止忙锁。 |
| [src/lib/config.js](file:///root/wwwroot/xslhk/src/lib/config.js) | 配置代理工具 | 辅助对系统配置表的存取封装。 |
| [src/proxy.js](file:///root/wwwroot/xslhk/src/proxy.js) | 代理请求脚本 | 用于处理特定需要转发或解绑微信阻断的底层网络层工具。 |
| [src/styles/globals.css](file:///root/wwwroot/xslhk/src/styles/globals.css) | CSS 变量样式库 | **全站核心设计规范（Design System）**。声明并控制了极奢暗金色调、玻璃磨砂高斯模糊滤镜（Glassmorphism）、微弱发光阴影等现代质感样式变量，无缝兼容各类移动端和超宽屏显示器。 |
