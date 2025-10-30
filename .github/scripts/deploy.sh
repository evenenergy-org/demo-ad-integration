#!/bin/bash
set -e

echo "=================================="
echo "🚀 开始部署"
echo "=================================="

cd /opt/demo-ad-integration

# 停止旧进程
echo "⏹️  停止旧进程..."
pm2 stop demo-ad-integration || true
pm2 delete demo-ad-integration || true

# 备份旧版本
if [ -d "current" ]; then
  echo "📦 备份旧版本..."
  mkdir -p backup
  mv current backup/backup-$(date +%Y%m%d-%H%M%S)
fi

# 创建部署目录
mkdir -p current logs backup

# 复制新版本
echo "📂 复制新版本..."
cp -r .output/* current/

# 创建 PM2 配置文件
echo "📝 创建 PM2 配置..."
cat > ecosystem.config.js << 'PM2_EOF'
module.exports = {
  apps: [{
    name: 'demo-ad-integration',
    script: 'current/server/index.mjs',
    cwd: '/opt/demo-ad-integration',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NITRO_PORT: 3000,
      HOST: '0.0.0.0'
    },
    error_file: '/opt/demo-ad-integration/logs/err.log',
    out_file: '/opt/demo-ad-integration/logs/out.log',
    log_file: '/opt/demo-ad-integration/logs/combined.log',
    time: true,
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    watch: false
  }]
}
PM2_EOF

# 启动应用
echo "🚀 启动应用..."
pm2 start ecosystem.config.js
pm2 save

# 显示状态
echo ""
echo "📊 应用状态："
pm2 status

echo ""
echo "📝 最近日志："
pm2 logs demo-ad-integration --lines 50 --nostream

echo ""
echo "=================================="
echo "✅ 部署完成！"
echo "=================================="

