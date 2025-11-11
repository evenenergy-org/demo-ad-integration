<template>
  <div class="container">
    <!-- 标题 -->
    <div class="card">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h1 class="card-title">📱 流量主演示 - 广告位集成</h1>
          <p style="color: #666;">模拟流量主应用调用广告平台API，获取广告、展示并处理点击</p>
        </div>
        <NuxtLink to="/" class="btn btn-secondary">返回首页</NuxtLink>
      </div>
    </div>

    <!-- 配置信息 -->
    <div class="card">
      <h3 style="margin-bottom: 16px;">⚙️ 当前配置</h3>
      <div class="grid-2">
        <div>
          <p><strong>API Key:</strong> {{ maskedApiKey }}</p>
          <p><strong>广告位ID:</strong> {{ config.public.sspSlotId }}</p>
        </div>
        <div>
          <p><strong>API地址:</strong> {{ config.public.apiBaseUrl }}</p>
          <p><strong>私钥:</strong> {{ config.public.sspPrivateKey ? '已配置 ✅' : '未配置 ❌' }}</p>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <!-- 左侧：操作区 -->
      <div>
        <!-- 步骤1：请求广告 -->
        <div class="card">
          <h3 class="card-title">步骤1️⃣: 请求广告</h3>
          <div class="form-group">
            <label class="form-label">广告位ID</label>
            <input 
              v-model="slotId" 
              type="text" 
              class="form-input" 
              placeholder="slot_demo_001"
            />
          </div>
          <div class="form-group">
            <label class="form-label">用户ID（可选）</label>
            <input 
              v-model="userId" 
              type="text" 
              class="form-input" 
              placeholder="user_12345"
            />
          </div>
          <button 
            class="btn btn-primary" 
            style="width: 100%;"
            :disabled="loading"
            @click="handleRequestAd"
          >
            <span v-if="loading" class="loading"></span>
            <span v-else>🚀 请求广告</span>
          </button>
        </div>

        <!-- 步骤2：上报曝光 -->
        <div class="card" :class="{ 'opacity-50': !adData }">
          <h3 class="card-title">步骤2️⃣: 上报曝光</h3>
          <p style="color: #666; font-size: 14px; margin-bottom: 16px;">
            广告展示后需要上报曝光事件（CPM计费时会自动扣费）
          </p>
          <button 
            class="btn btn-success" 
            style="width: 100%;"
            :disabled="!adData || impressionReported"
            @click="handleReportImpression"
          >
            {{ impressionReported ? '✅ 已上报曝光' : '📊 上报曝光' }}
          </button>
        </div>

        <!-- 步骤3：处理点击 -->
        <div class="card" :class="{ 'opacity-50': !adData }">
          <h3 class="card-title">步骤3️⃣: 处理点击</h3>
          <p style="color: #666; font-size: 14px; margin-bottom: 16px;">
            Web跳转自动记录，非Web跳转需要手动上报
          </p>
          <div v-if="adData?.jumpType === 'web'">
            <div class="alert alert-info" style="margin-bottom: 12px;">
              <strong>Web跳转模式</strong><br/>
              点击下方按钮会自动跳转到平台中转URL，平台会记录点击并跳转到广告主落地页。
            </div>
            <a 
              :href="adData.jumpPage" 
              target="_blank"
              class="btn btn-primary" 
              style="width: 100%;"
            >
              🔗 点击广告（自动跳转）
            </a>
          </div>
          <div v-else>
            <div class="alert alert-info" style="margin-bottom: 12px;">
              <strong>非Web跳转模式</strong><br/>
              需要手动调用点击上报接口（CPC计费时会自动扣费）
            </div>
            <button 
              class="btn btn-primary" 
              style="width: 100%;"
              :disabled="!adData || clickReported"
              @click="handleReportClick"
            >
              {{ clickReported ? '✅ 已上报点击' : '👆 上报点击' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧：广告预览和日志 -->
      <div>
        <!-- 广告预览 -->
        <div class="card">
          <h3 class="card-title">📺 广告预览</h3>
          <div class="ad-preview" :class="{ 'loaded': adData }">
            <div v-if="!adData" style="color: #999;">
              <div style="font-size: 48px; margin-bottom: 16px;">🎯</div>
              <p>请先请求广告</p>
            </div>
            <div v-else>
              <img 
                v-if="adData.imageUrl" 
                :src="adData.imageUrl" 
                :alt="adData.title"
                class="ad-image"
              />
              <div class="ad-title">{{ adData.title }}</div>
              <div class="ad-description">{{ adData.description }}</div>
              <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                <span class="badge badge-info">{{ adData.billingMethod }}</span>
                <span class="badge badge-success">¥{{ adData.price }}</span>
                <span class="badge badge-warning">{{ adData.jumpType }}</span>
              </div>
            </div>
          </div>

          <!-- 追踪ID信息 -->
          <div v-if="adData" style="margin-top: 16px; padding: 12px; background: #f5f5f5; border-radius: 6px; font-size: 12px;">
            <div><strong>广告ID:</strong> {{ adData.adId }}</div>
            <div><strong>请求ID:</strong> {{ adData.reqId }}</div>
            <div><strong>曝光ID:</strong> {{ adData.impId }}</div>
            <div><strong>点击ID:</strong> {{ adData.clickId }}</div>
            <div><strong>转化ID:</strong> {{ adData.convId }}</div>
          </div>
        </div>

        <!-- 操作日志 -->
        <div class="card">
          <h3 class="card-title">📋 操作日志</h3>
          <div class="code-block" style="max-height: 300px; overflow-y: auto;">
            <div v-if="logs.length === 0" style="color: #999;">暂无日志...</div>
            <div v-for="(log, index) in logs" :key="index" style="margin-bottom: 8px;">
              <span style="color: #999;">[{{ log.time }}]</span>
              <span :style="{ color: log.type === 'success' ? '#28a745' : log.type === 'error' ? '#dc3545' : '#666' }">
                {{ log.message }}
              </span>
            </div>
          </div>
          <button 
            v-if="logs.length > 0"
            class="btn btn-secondary" 
            style="width: 100%; margin-top: 12px;"
            @click="logs = []"
          >
            清空日志
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const { requestAd, reportImpression, reportClick } = useAdApi()
const { generateReqId } = useSignature()

// 状态
const loading = ref(false)
const slotId = ref(config.public.sspSlotId)
const userId = ref('user_' + Math.random().toString(36).substr(2, 9))

const adData = ref<any>(null)
const impressionReported = ref(false)
const clickReported = ref(false)

const logs = ref<Array<{ time: string; message: string; type: string }>>([])

// 计算属性
const maskedApiKey = computed(() => {
  const key = config.public.sspApiKey
  if (key.length <= 8) return key
  return key.substr(0, 4) + '****' + key.substr(-4)
})

// 添加日志
const addLog = (message: string, type: string = 'info') => {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift({ time, message, type })
  if (logs.value.length > 50) logs.value.pop()
}

const extractErrorReason = (payload: any, fallback: string) => {
  if (!payload || typeof payload !== 'object') return fallback
  const candidates = [
    payload.message,
    payload.msg,
    payload.detail,
    payload.data?.message,
    payload.data?.msg,
    payload.data?.detail,
    payload.data?.error,
    typeof payload.data === 'string' ? payload.data : null
  ]
    .map(item => (item == null ? null : String(item)))
    .filter(Boolean)

  if (candidates.length === 0) return fallback

  const [primary, ...rest] = Array.from(new Set(candidates))
  const extra = rest.length ? `（${rest.join(' / ')}）` : ''
  return `${primary}${extra}`
}

// 请求广告
const handleRequestAd = async () => {
  try {
    loading.value = true
    addLog('开始请求广告...', 'info')
    
    const reqId = generateReqId()
    const result: any = await requestAd({
      reqId,
      slotId: slotId.value,
      userId: userId.value,
      deviceIp: '192.168.1.1',
      deviceUa: navigator.userAgent.substring(0, 100),
      deviceCountry: 'CN'
    })

    if (result.code === 200 && result.data) {
      adData.value = result.data
      impressionReported.value = false
      clickReported.value = false
      addLog('✅ 广告请求成功！广告ID: ' + result.data.adId, 'success')
    } else {
      const reason = extractErrorReason(result, '未返回失败原因')
      const codeLabel = result?.code ? ` [${result.code}]` : ''
      addLog(`❌ 广告请求失败${codeLabel}: ${reason}`, 'error')
    }
  } catch (error: any) {
    const reason = extractErrorReason(error, error?.message || '未知错误')
    const codeLabel = error?.code && error.code !== 'UNKNOWN' ? ` [${error.code}]` : ''
    addLog(`❌ 广告请求异常${codeLabel}: ${reason}`, 'error')
  } finally {
    loading.value = false
  }
}

// 上报曝光
const handleReportImpression = async () => {
  if (!adData.value) return
  
  try {
    addLog('开始上报曝光...', 'info')
    
    const result: any = await reportImpression({
      reqId: adData.value.reqId,
      impId: adData.value.impId,
      slotId: slotId.value
    })

    if (result.code === 200) {
      impressionReported.value = true
      addLog('✅ 曝光上报成功！', 'success')
      if (adData.value.billingMethod === 'CPM') {
        addLog('💰 CPM计费已触发扣费', 'success')
      }
    } else {
      const reason = extractErrorReason(result, '未返回失败原因')
      const codeLabel = result?.code ? ` [${result.code}]` : ''
      addLog(`❌ 曝光上报失败${codeLabel}: ${reason}`, 'error')
    }
  } catch (error: any) {
    const reason = extractErrorReason(error, error?.message || '未知错误')
    const codeLabel = error?.code && error.code !== 'UNKNOWN' ? ` [${error.code}]` : ''
    addLog(`❌ 曝光上报异常${codeLabel}: ${reason}`, 'error')
  }
}

// 上报点击
const handleReportClick = async () => {
  if (!adData.value) return
  
  try {
    addLog('开始上报点击...', 'info')
    
    const result: any = await reportClick({
      reqId: adData.value.reqId,
      clickId: adData.value.clickId,
      slotId: slotId.value
    })

    if (result.code === 200) {
      clickReported.value = true
      addLog('✅ 点击上报成功！', 'success')
      if (adData.value.billingMethod === 'CPC') {
        addLog('💰 CPC计费已触发扣费', 'success')
      }
      // 模拟跳转
      addLog('🔗 跳转到广告主落地页: ' + adData.value.jumpPage, 'info')
    } else {
      const reason = extractErrorReason(result, '未返回失败原因')
      const codeLabel = result?.code ? ` [${result.code}]` : ''
      addLog(`❌ 点击上报失败${codeLabel}: ${reason}`, 'error')
    }
  } catch (error: any) {
    const reason = extractErrorReason(error, error?.message || '未知错误')
    const codeLabel = error?.code && error.code !== 'UNKNOWN' ? ` [${error.code}]` : ''
    addLog(`❌ 点击上报异常${codeLabel}: ${reason}`, 'error')
  }
}

useHead({
  title: '流量主演示 - EvenEnergy广告平台'
})
</script>

<style scoped>
.opacity-50 {
  opacity: 0.5;
  pointer-events: none;
}
</style>

