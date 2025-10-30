<template>
  <div class="container">
    <div class="card">
      <h1 style="text-align: center; margin-bottom: 30px; color: #667eea;">
        🎯 EvenEnergy 广告平台集成演示
      </h1>
      
      <div class="alert alert-info" style="margin-bottom: 30px;">
        <strong>说明：</strong>本项目演示如何集成EvenEnergy广告平台的开放API，包括流量主和广告主两种角色的完整流程。
      </div>

      <div class="grid-2">
        <!-- 流量主Demo -->
        <div class="card">
          <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">📱</div>
            <h2 class="card-title" style="text-align: center;">流量主演示</h2>
            <p style="color: #666; margin-bottom: 20px;">
              模拟流量主应用，请求广告、展示广告并处理点击
            </p>
            <NuxtLink to="/ssp" class="btn btn-primary" style="width: 100%;">
              进入流量主Demo
            </NuxtLink>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
            <h4 style="margin-bottom: 12px; font-size: 14px; color: #666;">功能演示：</h4>
            <ul style="font-size: 14px; color: #888; line-height: 2;">
              <li>✅ 请求广告接口</li>
              <li>✅ 广告展示</li>
              <li>✅ 曝光上报</li>
              <li>✅ 点击上报（Web/非Web）</li>
              <li>✅ 实时日志展示</li>
            </ul>
          </div>
        </div>

        <!-- 广告主Demo -->
        <div class="card">
          <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">💼</div>
            <h2 class="card-title" style="text-align: center;">广告主演示</h2>
            <p style="color: #666; margin-bottom: 20px;">
              模拟广告主应用，手动触发转化上报
            </p>
            <NuxtLink to="/dsp" class="btn btn-success" style="width: 100%;">
              进入广告主Demo
            </NuxtLink>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
            <h4 style="margin-bottom: 12px; font-size: 14px; color: #666;">功能演示：</h4>
            <ul style="font-size: 14px; color: #888; line-height: 2;">
              <li>✅ 转化事件上报</li>
              <li>✅ CPA事件（注册/激活等）</li>
              <li>✅ CPS事件（购买/支付等）</li>
              <li>✅ 商品明细上报</li>
              <li>✅ 实时日志展示</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 配置说明 -->
      <div class="card" style="margin-top: 20px; background: #f8f9ff;">
        <h3 style="margin-bottom: 16px; color: #667eea;">⚙️ 配置说明</h3>
        <div class="code-block">
# 修改 .env 文件配置你的API密钥

# 广告平台API基础URL
NUXT_PUBLIC_API_BASE_URL=http://localhost:8080

# 流量主配置
NUXT_PUBLIC_SSP_API_KEY=your_ssp_api_key
NUXT_PUBLIC_SSP_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----
NUXT_PUBLIC_SSP_SLOT_ID=slot_demo_001

# 广告主配置
NUXT_PUBLIC_DSP_API_KEY=your_dsp_api_key
NUXT_PUBLIC_DSP_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----

# MD5签名密钥
NUXT_PUBLIC_OPEN_API_SECRET=your_secret_key
        </div>
      </div>

      <!-- 文档链接 -->
      <div style="text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 14px;">
          📖 详细API文档请查看：
          <a href="/docs" style="color: #667eea; text-decoration: none;">开放API接口文档</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'EvenEnergy 广告平台集成演示'
})
</script>

