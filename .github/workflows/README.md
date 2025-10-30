# GitHub Actions 部署配置说明

本文档说明如何配置 GitHub Actions 自动部署到测试服务器。

## 📋 前置要求

### 服务器环境
- Node.js 20+
- pnpm 全局安装
- PM2 全局安装

### 安装命令
```bash
# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 pnpm
npm install -g pnpm

# 安装 PM2
npm install -g pm2

# PM2 开机自启
pm2 startup
```

## 🔐 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

### 方式一：复用后端服务的 Secrets

如果你的后端服务已经配置了相同的测试服务器，可以直接复用以下 Secrets：

| Secret 名称 | 说明 | 示例 |
|------------|------|------|
| `TEST_SERVER_HOST` | 服务器IP或域名 | `8.138.193.185` |
| `TEST_SERVER_PORT` | SSH端口 | `22` |
| `TEST_SERVER_USER` | SSH用户名 | `root` |
| `TEST_SERVER_SSH_KEY` | SSH私钥 | `-----BEGIN PRIVATE KEY-----...` |

### 方式二：配置新的服务器

如果需要部署到不同的服务器，创建新的 Secrets：

1. 进入仓库：`Settings` → `Secrets and variables` → `Actions`
2. 点击 `New repository secret`
3. 添加上述 4 个 Secrets

### SSH 密钥配置

SSH 私钥应该是完整的内容，包括头尾：

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAlwAAAAdzc2gtcn
...
-----END OPENSSH PRIVATE KEY-----
```

或

```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
...
-----END RSA PRIVATE KEY-----
```

## 🚀 部署流程

### 自动部署

每次推送到 `main` 分支会自动触发部署：

```bash
git push origin main
```

### 手动部署

也可以在 GitHub Actions 页面手动触发：

1. 进入仓库的 `Actions` 页面
2. 选择 `🚀 部署到测试服务器` 工作流
3. 点击 `Run workflow`
4. 选择分支（通常是 `main`）
5. 点击 `Run workflow` 按钮

## 📦 部署说明

### 部署路径

```
/opt/demo-ad-integration/
├── current/              # 当前运行版本
├── backup/               # 版本备份
├── logs/                 # 日志文件
│   ├── err.log
│   ├── out.log
│   └── combined.log
└── ecosystem.config.js   # PM2 配置
```

### 访问地址

部署成功后，应用将在以下地址访问：

```
http://服务器IP:3000
```

例如：`http://8.138.193.185:3000`

### PM2 管理命令

在服务器上可以使用 PM2 管理应用：

```bash
# 查看状态
pm2 status demo-ad-integration

# 查看日志
pm2 logs demo-ad-integration

# 重启应用
pm2 restart demo-ad-integration

# 停止应用
pm2 stop demo-ad-integration

# 查看详细信息
pm2 info demo-ad-integration

# 监控
pm2 monit
```

## 🔍 故障排查

### 检查部署日志

1. 在 GitHub Actions 页面查看运行日志
2. 在服务器上查看 PM2 日志：
   ```bash
   pm2 logs demo-ad-integration --lines 100
   ```

### 常见问题

#### 1. 端口被占用

```bash
# 检查端口占用
netstat -tln | grep 3000

# 杀死占用进程
sudo kill -9 $(lsof -t -i:3000)
```

#### 2. PM2 进程未运行

```bash
# 手动启动
cd /opt/demo-ad-integration
pm2 start ecosystem.config.js
pm2 save
```

#### 3. 构建失败

检查 Node.js 版本和 pnpm 版本是否满足要求。

#### 4. 权限问题

确保部署目录有正确的权限：

```bash
sudo chown -R $USER:$USER /opt/demo-ad-integration
```

## 📝 更新说明

### 版本更新

1. 修改 `package.json` 中的版本号
2. 提交并推送到 `main` 分支
3. 自动触发部署流程

### 回滚版本

如果需要回滚到之前的版本：

```bash
cd /opt/demo-ad-integration
pm2 stop demo-ad-integration

# 找到备份目录
ls -la backup/

# 恢复备份
cp -r backup/backup-YYYYMMDD-HHMMSS/* current/

# 重启
pm2 start ecosystem.config.js
```

## 🔔 通知

部署成功或失败后，会在 Actions 日志中显示通知信息。

---

**注意**：首次部署需要确保服务器已安装 Node.js、pnpm 和 PM2。

