// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: ['@pinia/nuxt'],
  
  css: ['~/assets/css/main.css'],
  
  runtimeConfig: {
    // 服务端环境变量（不会暴露给客户端）
    public: {
      // 广告平台API基础URL
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
      
      // 流量主配置（SSP）
      sspApiKey: process.env.NUXT_PUBLIC_SSP_API_KEY || 'pk_live_VrnaAtnbjKZu1TdQtgBqxia2E8DwY42j',
      sspPrivateKey: process.env.NUXT_PUBLIC_SSP_PRIVATE_KEY || '',
      sspSlotId: process.env.NUXT_PUBLIC_SSP_SLOT_ID || 'slot_demo_001',
      
      // 广告主配置（DSP）
      dspApiKey: process.env.NUXT_PUBLIC_DSP_API_KEY || 'your_dsp_api_key',
      dspPrivateKey: process.env.NUXT_PUBLIC_DSP_PRIVATE_KEY || '',
      
      // MD5签名密钥（用于点击跳转）
      openApiSecret: process.env.NUXT_PUBLIC_OPEN_API_SECRET || 'your_secret_key'
    }
  },
  
  app: {
    head: {
      title: 'EvenEnergy广告平台集成演示',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '流量主和广告主API集成演示项目' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  }
})

