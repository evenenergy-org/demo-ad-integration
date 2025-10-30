<template>
  <div class="container">
    <!-- 标题 -->
    <div class="card">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h1 class="card-title">💼 广告主演示 - 转化上报</h1>
          <p style="color: #666;">模拟广告主应用在用户完成转化后上报事件（注册、购买等）</p>
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
          <p><strong>API地址:</strong> {{ config.public.apiBaseUrl }}</p>
        </div>
        <div>
          <p><strong>私钥:</strong> {{ config.public.dspPrivateKey ? '已配置 ✅' : '未配置 ❌' }}</p>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <!-- 左侧：转化上报表单 -->
      <div>
        <div class="card">
          <h3 class="card-title">📝 转化上报表单</h3>

          <!-- 基础信息 -->
          <div class="form-group">
            <label class="form-label">点击ID（必填）*</label>
            <input 
              v-model="formData.clickId" 
              type="text" 
              class="form-input" 
              placeholder="click_def456"
            />
            <small style="color: #999;">从流量主获取的点击ID</small>
          </div>

          <div class="form-group">
            <label class="form-label">事件类型（必填）*</label>
            <select v-model="formData.eventType" class="form-select">
              <optgroup label="CPA事件">
                <option value="signup">signup - 注册</option>
                <option value="activation">activation - 激活</option>
                <option value="lead">lead - 线索</option>
                <option value="trial_start">trial_start - 试用开始</option>
              </optgroup>
              <optgroup label="CPS事件">
                <option value="purchase">purchase - 购买</option>
                <option value="pay_pending">pay_pending - 待支付</option>
                <option value="refund">refund - 退款中</option>
                <option value="refunded">refunded - 已退款</option>
                <option value="cancelled">cancelled - 已取消</option>
              </optgroup>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">转化状态（必填）*</label>
            <select v-model="formData.status" class="form-select">
              <option value="pending">pending - 待确认</option>
              <option value="confirmed">confirmed - 已确认</option>
              <option value="cancelled">cancelled - 已取消</option>
              <option value="refunded">refunded - 已退款</option>
            </select>
          </div>

          <!-- 用户信息 -->
          <div class="form-group">
            <label class="form-label">用户ID（可选）</label>
            <input 
              v-model="formData.userId" 
              type="text" 
              class="form-input" 
              placeholder="user_12345"
            />
          </div>

          <div class="form-group">
            <label class="form-label">设备ID（可选）</label>
            <input 
              v-model="formData.deviceId" 
              type="text" 
              class="form-input" 
              placeholder="device_abc"
            />
          </div>

          <!-- CPS相关 -->
          <div v-if="isCpsEvent" style="padding: 16px; background: #f8f9ff; border-radius: 8px; margin-bottom: 16px;">
            <h4 style="margin-bottom: 12px; color: #667eea;">💰 CPS订单信息</h4>
            
            <div class="form-group">
              <label class="form-label">订单金额（元）*</label>
              <input 
                v-model.number="formData.revenue" 
                type="number" 
                step="0.01"
                class="form-input" 
                placeholder="99.00"
              />
            </div>

            <div class="form-group">
              <label class="form-label">佣金比例（%）*</label>
              <input 
                v-model.number="formData.commissionRate" 
                type="number" 
                step="0.1"
                class="form-input" 
                placeholder="10.5"
              />
            </div>

            <div class="form-group">
              <label class="form-label">实际支付金额（元）</label>
              <input 
                type="number" 
                step="0.01"
                class="form-input" 
                placeholder="10.40"
                :disabled="true"
                :value="calculatedPayout"
                readonly
              />
              <small style="color: #999;">自动计算：订单金额 × 佣金比例 / 100</small>
            </div>

            <!-- 商品明细 -->
            <div style="margin-top: 16px;">
              <label class="form-label">商品明细（可选）</label>
              <div v-for="(item, index) in formData.items" :key="index" style="display: flex; gap: 8px; margin-bottom: 8px;">
                <input 
                  v-model="item.sku" 
                  type="text" 
                  class="form-input" 
                  placeholder="SKU"
                  style="flex: 2;"
                />
                <input 
                  v-model.number="item.qty" 
                  type="number" 
                  class="form-input" 
                  placeholder="数量"
                  style="flex: 1;"
                />
                <input 
                  v-model.number="item.price" 
                  type="number" 
                  step="0.01"
                  class="form-input" 
                  placeholder="单价"
                  style="flex: 1;"
                />
                <button class="btn btn-secondary" @click="removeItem(index)">删除</button>
              </div>
              <button class="btn btn-secondary" style="width: 100%;" @click="addItem">
                ➕ 添加商品
              </button>
            </div>
          </div>

          <!-- 元数据 -->
          <div class="form-group">
            <label class="form-label">元数据（JSON格式，可选）</label>
            <textarea 
              v-model="formData.meta" 
              class="form-textarea" 
              placeholder='{"key": "value"}'
            ></textarea>
          </div>

          <!-- 提交按钮 -->
          <button 
            class="btn btn-success" 
            style="width: 100%;"
            :disabled="!isFormValid || submitting"
            @click="handleSubmitConversion"
          >
            <span v-if="submitting" class="loading"></span>
            <span v-else>🚀 上报转化</span>
          </button>
        </div>
      </div>

      <!-- 右侧：日志和说明 -->
      <div>
        <!-- 事件类型说明 -->
        <div class="card">
          <h3 class="card-title">📖 事件类型说明</h3>
          
          <div style="margin-bottom: 16px;">
            <h4 style="color: #667eea; margin-bottom: 8px;">CPA事件（按行动计费）</h4>
            <ul style="font-size: 14px; line-height: 2; color: #666;">
              <li><strong>signup</strong> - 用户完成注册</li>
              <li><strong>activation</strong> - 用户激活账户</li>
              <li><strong>lead</strong> - 获得销售线索</li>
              <li><strong>trial_start</strong> - 用户开始试用</li>
            </ul>
          </div>

          <div>
            <h4 style="color: #11998e; margin-bottom: 8px;">CPS事件（按销售分成）</h4>
            <ul style="font-size: 14px; line-height: 2; color: #666;">
              <li><strong>purchase</strong> - 用户完成购买</li>
              <li><strong>pay_pending</strong> - 订单待支付</li>
              <li><strong>refund</strong> - 订单退款中</li>
              <li><strong>refunded</strong> - 订单已退款</li>
              <li><strong>cancelled</strong> - 订单已取消</li>
            </ul>
          </div>
        </div>

        <!-- 操作日志 -->
        <div class="card">
          <h3 class="card-title">📋 操作日志</h3>
          <div class="code-block" style="max-height: 400px; overflow-y: auto;">
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

        <!-- 成功提示 -->
        <div v-if="lastSuccess" class="alert alert-success">
          <strong>✅ 转化上报成功！</strong><br/>
          转化ID: {{ lastSuccess.convId }}<br/>
          事件类型: {{ lastSuccess.eventType }}<br/>
          <span v-if="lastSuccess.revenue">
            订单金额: ¥{{ lastSuccess.revenue }}<br/>
            佣金: ¥{{ lastSuccess.payout }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const { reportConversion } = useAdApi()
const { generateConvId } = useSignature()

// 表单数据
const formData = ref({
  clickId: 'click_' + Math.random().toString(36).substr(2, 9),
  eventType: 'purchase',
  status: 'confirmed',
  userId: 'user_' + Math.random().toString(36).substr(2, 9),
  deviceId: 'device_' + Math.random().toString(36).substr(2, 9),
  revenue: 99.00,
  currency: 'CNY',
  commissionRate: 10.5,
  payout: 0,
  meta: '',
  items: [] as Array<{ sku: string; qty: number; price: number }>
})

const submitting = ref(false)
const logs = ref<Array<{ time: string; message: string; type: string }>>([])
const lastSuccess = ref<any>(null)

// 计算属性
const maskedApiKey = computed(() => {
  const key = config.public.dspApiKey
  if (key.length <= 8) return key
  return key.substr(0, 4) + '****' + key.substr(-4)
})

const isCpsEvent = computed(() => {
  return ['purchase', 'pay_pending', 'refund', 'refunded', 'cancelled'].includes(formData.value.eventType)
})

const calculatedPayout = computed(() => {
  if (!isCpsEvent.value) return 0
  return (formData.value.revenue * formData.value.commissionRate / 100).toFixed(2)
})

const isFormValid = computed(() => {
  if (!formData.value.clickId) return false
  if (!formData.value.eventType) return false
  if (!formData.value.status) return false
  if (isCpsEvent.value && !formData.value.revenue) return false
  if (isCpsEvent.value && !formData.value.commissionRate) return false
  return true
})

// 添加日志
const addLog = (message: string, type: string = 'info') => {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift({ time, message, type })
  if (logs.value.length > 50) logs.value.pop()
}

// 添加商品
const addItem = () => {
  formData.value.items.push({
    sku: 'SKU' + Math.random().toString(36).substr(2, 6).toUpperCase(),
    qty: 1,
    price: 0
  })
}

// 删除商品
const removeItem = (index: number) => {
  formData.value.items.splice(index, 1)
}

// 上报转化
const handleSubmitConversion = async () => {
  try {
    submitting.value = true
    lastSuccess.value = null
    addLog('开始上报转化...', 'info')
    
    const convId = generateConvId()
    const eventTimestamp = Date.now()
    
    const requestData: any = {
      id: convId,
      clickId: formData.value.clickId,
      eventType: formData.value.eventType,
      status: formData.value.status,
      eventTimestamp,
      userId: formData.value.userId || undefined,
      deviceId: formData.value.deviceId || undefined,
      currency: formData.value.currency,
      reportType: 1,
      attributed: 1,
      invalid: 0
    }

    // CPS相关字段
    if (isCpsEvent.value) {
      requestData.revenue = formData.value.revenue
      requestData.commissionRate = formData.value.commissionRate
      requestData.payout = parseFloat(calculatedPayout.value)
      
      if (formData.value.items.length > 0) {
        requestData.items = formData.value.items
      }
    }

    // 元数据
    if (formData.value.meta) {
      try {
        JSON.parse(formData.value.meta) // 验证JSON格式
        requestData.meta = formData.value.meta
      } catch (e) {
        addLog('⚠️ 元数据JSON格式错误，已忽略', 'error')
      }
    }

    addLog('转化ID: ' + convId, 'info')
    addLog('事件类型: ' + formData.value.eventType, 'info')
    
    const result: any = await reportConversion(requestData)

    if (result.code === 200) {
      addLog('✅ 转化上报成功！', 'success')
      
      if (['CPA', 'CPS'].includes(result.data?.billingMethod)) {
        addLog('💰 ' + result.data.billingMethod + '计费已触发扣费', 'success')
      }

      lastSuccess.value = {
        convId,
        eventType: formData.value.eventType,
        revenue: formData.value.revenue,
        payout: calculatedPayout.value
      }

      // 重置部分表单
      formData.value.clickId = 'click_' + Math.random().toString(36).substr(2, 9)
    } else {
      addLog('❌ 转化上报失败: ' + (result.message || '未知错误'), 'error')
    }
  } catch (error: any) {
    addLog('❌ 转化上报异常: ' + (error.data?.message || error.message || error), 'error')
  } finally {
    submitting.value = false
  }
}

useHead({
  title: '广告主演示 - EvenEnergy广告平台'
})
</script>

