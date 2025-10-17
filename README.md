# 🚀 全球小包专线运费计算器 PWA版

一个支持离线使用的渐进式Web应用，可以在Android和iOS上像原生应用一样安装和使用。

## 📁 项目结构

```
shipping-calculator-pwa/
├── index.html                    # 主页面文件
├── sw.js                        # Service Worker文件
├── manifest.json                # PWA配置文件
├── offline-data-manager.js      # 离线数据管理器
├── icon-generator.html          # 图标生成工具
├── icons/                       # 应用图标目录
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
├── screenshots/                 # 应用截图目录
│   ├── mobile-screenshot.png
│   └── desktop-screenshot.png
└── README.md                    # 说明文档
```

## 🎯 功能特点

### ✨ 核心功能
- 🌍 **全球运费计算** - 支持25个主要国家
- 💰 **智能计算** - 自动计算运费、利润、总价
- 💱 **双币种显示** - 人民币和美元同时显示
- 📱 **响应式设计** - 完美适配手机、平板、电脑

### 🚀 PWA特性
- 📱 **可安装** - 添加到主屏幕，像原生应用
- 🔄 **离线使用** - 无网络时也能正常计算
- ⚡ **快速启动** - Service Worker缓存，秒开应用
- 🔔 **推送通知** - 支持消息推送（可选）
- 🔄 **自动更新** - 后台自动更新数据

### 💾 离线存储
- 📦 **本地数据** - 所有价格数据本地存储
- 🔄 **智能更新** - 在线时自动检查更新
- 💾 **数据持久化** - 关闭浏览器数据不丢失
- 📊 **存储管理** - 可查看存储使用情况

## 🛠️ 部署方法

### 方法一：GitHub Pages（推荐）

1. **创建GitHub仓库**
   ```bash
   # 在GitHub上创建新仓库
   # 仓库名：shipping-calculator-pwa
   # 选择Public（GitHub Pages需要公开仓库）
   ```

2. **上传文件**
   ```bash
   # 克隆仓库到本地
   git clone https://github.com/你的用户名/shipping-calculator-pwa.git
   cd shipping-calculator-pwa
   
   # 复制所有文件到仓库目录
   # 确保文件结构正确
   ```

3. **启用GitHub Pages**
   - 进入仓库Settings
   - 找到Pages部分
   - Source选择"Deploy from a branch"
   - Branch选择"main"
   - 点击Save

4. **访问应用**
   - 几分钟后访问：`https://你的用户名.github.io/shipping-calculator-pwa`
   - 现在可以安装为PWA应用了！

### 方法二：Netlify（最简单）

1. **访问Netlify**
   - 打开 https://netlify.com
   - 注册账号（可用GitHub账号登录）

2. **部署应用**
   - 点击"New site from Git"
   - 选择GitHub仓库
   - 或直接拖拽文件到上传区域

3. **获得网址**
   - 几秒钟后获得随机网址
   - 格式：`https://随机名字.netlify.app`

### 方法三：Vercel

1. **访问Vercel**
   - 打开 https://vercel.com
   - 注册账号

2. **导入项目**
   - 点击"New Project"
   - 导入GitHub仓库
   - 自动部署

3. **自定义域名**
   - 可以绑定自定义域名
   - 获得专业网址

## 📱 安装使用

### Android用户
1. 用Chrome浏览器访问应用网址
2. 等待安装提示出现
3. 点击"安装"或"添加到主屏幕"
4. 应用会出现在主屏幕上

### iOS用户
1. 用Safari浏览器访问应用网址
2. 点击底部分享按钮
3. 选择"添加到主屏幕"
4. 自定义应用名称
5. 点击"添加"

## 🔧 开发说明

### 本地开发
```bash
# 启动本地服务器
python -m http.server 8000
# 或
npx serve .

# 访问 http://localhost:8000
```

### 修改价格数据
1. 编辑 `index.html` 中的 `shippingData` 对象
2. 更新 `offline-data-manager.js` 中的默认数据
3. 重新部署应用

### 更新版本
1. 修改 `sw.js` 中的 `CACHE_NAME`
2. 修改 `manifest.json` 中的版本信息
3. 重新部署应用

## 🎨 自定义图标

1. **生成图标**
   - 打开 `icon-generator.html`
   - 点击"批量下载所有图标"
   - 保存到 `icons/` 目录

2. **自定义图标**
   - 替换 `icons/` 目录中的PNG文件
   - 确保文件名格式正确
   - 重新部署应用

## 📊 性能优化

### Service Worker策略
- **静态资源**：缓存优先
- **动态资源**：网络优先
- **离线回退**：返回缓存版本

### 数据存储策略
- **首次加载**：下载所有数据
- **后续使用**：完全离线
- **数据更新**：后台检查更新

### 缓存策略
- **HTML/CSS/JS**：永久缓存
- **图标资源**：永久缓存
- **API数据**：定期更新

## 🔍 故障排除

### 常见问题

1. **无法安装PWA**
   - 确保使用HTTPS访问
   - 检查manifest.json是否正确
   - 确认Service Worker已注册

2. **离线功能不工作**
   - 检查Service Worker是否正常
   - 确认数据已缓存
   - 查看浏览器控制台错误

3. **数据不更新**
   - 清除浏览器缓存
   - 检查网络连接
   - 重新安装应用

### 调试方法

1. **Chrome DevTools**
   - F12打开开发者工具
   - Application标签查看Service Worker
   - Storage标签查看缓存数据

2. **PWA测试**
   - 使用Lighthouse测试PWA评分
   - 检查manifest.json有效性
   - 测试离线功能

## 📈 监控分析

### 使用统计
- 可以通过Google Analytics跟踪使用情况
- 监控安装率和用户行为
- 分析离线使用频率

### 性能监控
- 监控加载时间
- 跟踪缓存命中率
- 分析用户留存率

## 🔄 更新维护

### 定期更新
- 每月检查价格数据
- 更新Service Worker版本
- 优化用户体验

### 版本管理
- 使用语义化版本号
- 记录更新日志
- 向后兼容性考虑

## 📞 技术支持

如有问题，请检查：
1. 浏览器控制台错误信息
2. Service Worker注册状态
3. 网络连接状态
4. 缓存数据完整性

## 📄 许可证

本项目仅供学习和个人使用，请勿用于商业用途。

---

**享受你的PWA运费计算器！** 🎉