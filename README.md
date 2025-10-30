# EvenEnergy 广告平台集成演示项目

这是一个基于 Nuxt.js 3 的演示项目，展示如何集成 EvenEnergy 广告平台的开放 API，包括流量主（SSP）和广告主（DSP）两种角色的完整集成流程。

## 📋 项目简介

本项目提供两个独立的演示页面：

### 1. 流量主演示 (`/ssp`)
模拟流量主应用，展示如何：
- ✅ 请求广告（获取匹配的广告）
- ✅ 展示广告内容
- ✅ 上报曝光事件（CPM计费触发）
- ✅ 处理点击事件（Web跳转/非Web跳转）
- ✅ 实时查看API调用日志

### 2. 广告主演示 (`/dsp`)
模拟广告主应用，展示如何：
- ✅ 上报转化事件（注册、购买等）
- ✅ 支持CPA事件（signup、activation、lead等）
- ✅ 支持CPS事件（purchase、refund等）
- ✅ 提交商品明细和订单信息
- ✅ 实时查看API调用日志

## 🚀 快速开始

### 1. 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm
pnpm install

# 或使用 yarn
yarn install
```

### 2. 配置环境变量

复制 `env.example` 为 `.env` 文件：

```bash
cp env.example .env
```

编辑 `.env` 文件，填写你的配置信息：

```env
# 广告平台API地址
NUXT_PUBLIC_API_BASE_URL=http://localhost:8080

# 流量主配置
NUXT_PUBLIC_SSP_API_KEY=your_ssp_api_key
NUXT_PUBLIC_SSP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...你的RSA私钥...
-----END PRIVATE KEY-----"
NUXT_PUBLIC_SSP_SLOT_ID=slot_demo_001

# 广告主配置
NUXT_PUBLIC_DSP_API_KEY=your_dsp_api_key
NUXT_PUBLIC_DSP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...你的RSA私钥...
-----END PRIVATE KEY-----"

# MD5签名密钥
NUXT_PUBLIC_OPEN_API_SECRET=your_secret_key
```

### 3. 获取API密钥

#### 流量主密钥获取：
1. 登录 EvenEnergy 流量主后台
2. 进入 **设置** → **API密钥管理**
3. 创建新的API密钥
4. 复制 `api_key` 和 `private_key` 到 `.env` 文件

#### 广告主密钥获取：
1. 登录 EvenEnergy 广告主后台
2. 进入 **设置** → **API密钥管理**
3. 创建新的API密钥
4. 复制 `api_key` 和 `private_key` 到 `.env` 文件

### 4. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000` 即可看到演示页面。

## 📚 项目结构

```
demo-ad-integration/
├── assets/
│   └── css/
│       └── main.css              # 全局样式
├── composables/
│   ├── useSignature.ts           # 签名工具（RSA/MD5）
│   └── useAdApi.ts               # API调用封装
├── pages/
│   ├── index.vue                 # 首页
│   ├── ssp/
│   │   └── index.vue            # 流量主演示页面
│   └── dsp/
│       └── index.vue            # 广告主演示页面
├── nuxt.config.ts               # Nuxt配置
├── package.json                 # 依赖配置
├── env.example                  # 环境变量示例
└── README.md                    # 本文件
```

## 🔧 核心功能说明

### 签名算法实现

项目使用 `jsrsasign` 库实现 RSA-SHA256 签名，使用 `crypto-js` 实现 MD5 签名。

#### RSA签名流程（用于API调用）：
1. 移除 `sign` 字段
2. 按 key 升序排序
3. 拼接为 `k1=v1&k2=v2&k3=v3` 格式
4. 使用 RSA-SHA256 签名
5. Base64 编码

#### MD5签名流程（用于点击跳转）：
1. 按 key 升序排序
2. 拼接为 `k1=v1&k2=v2&key=secret` 格式
3. MD5 加密并转大写

### API调用流程

#### 流量主请求广告：
```typescript
const { requestAd } = useAdApi()

const result = await requestAd({
  reqId: 'req_123',
  slotId: 'slot_001',
  userId: 'user_123',
  deviceType: 'mobile'
})
```

#### 流量主上报曝光：
```typescript
const { reportImpression } = useAdApi()

const result = await reportImpression({
  reqId: 'req_123',
  impId: 'imp_abc',
  slotId: 'slot_001'
})
```

#### 广告主上报转化：
```typescript
const { reportConversion } = useAdApi()

const result = await reportConversion({
  id: 'conv_789',
  clickId: 'click_456',
  eventType: 'purchase',
  status: 'confirmed',
  revenue: 99.00,
  commissionRate: 10.5
})
```

## 📖 API文档

完整的API文档请参考：
- 项目根目录：`../evenenergy_manager/开放API接口文档.md`
- 或访问线上文档：[EvenEnergy开放API文档](https://docs.evenenergy.com)

### 主要接口：

| 角色 | 接口地址 | 方法 | 说明 |
|------|---------|------|------|
| 流量主 | `/rtb/api/get/ad` | POST | 请求广告 |
| 流量主 | `/rtb/api/submit/impression` | POST | 上报曝光 |
| 流量主 | `/rtb/api/submit/click` | POST | 上报点击 |
| 广告主 | `/rtb/api/submit/conversion` | POST | 上报转化 |
| 追踪 | `/rtb/track/ck` | GET | Web点击跳转 |

## 🎯 测试流程

### 完整测试流程：

1. **流量主请求广告** → 获取广告信息和追踪ID
2. **流量主上报曝光** → CPM计费触发扣费
3. **用户点击广告** → 
   - Web跳转：自动记录点击
   - 非Web跳转：手动上报点击（CPC计费触发）
4. **用户完成转化** → 广告主上报转化（CPA/CPS计费触发）

### 注意事项：

- ⚠️ 请求ID、曝光ID、点击ID必须一致
- ⚠️ 点击ID防重复上报
- ⚠️ 转化ID防重复上报
- ⚠️ 私钥格式必须是完整的PEM格式
- ⚠️ 时间戳使用毫秒级

## 🔐 安全提示

1. **不要**将 `.env` 文件提交到代码仓库
2. **不要**在客户端代码中硬编码私钥
3. **生产环境**应该将私钥存储在服务端
4. **定期轮换** API密钥和私钥
5. **启用** IP白名单限制

## 🛠️ 开发说明

### 添加新功能

1. 在 `composables/` 目录添加新的工具函数
2. 在 `pages/` 目录添加新的页面
3. 更新路由配置（Nuxt会自动识别）

### 调试技巧

1. 打开浏览器控制台查看详细日志
2. 每个API调用都有日志输出
3. 检查网络请求的Headers和Body
4. 验证签名生成是否正确

## 📦 依赖说明

主要依赖：
- **Nuxt.js 3**: Vue.js框架
- **jsrsasign**: RSA签名库
- **crypto-js**: MD5加密库
- **dayjs**: 日期处理库

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 📞 联系我们

- 技术支持：tech-support@evenenergy.com
- 官方文档：https://docs.evenenergy.com
- 问题反馈：https://github.com/evenenergy/ad-platform/issues

---

**最后更新**: 2025年1月30日  
**版本**: v1.0.0

