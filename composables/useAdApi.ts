/**
 * 广告API调用工具
 */
export const useAdApi = () => {
  const config = useRuntimeConfig()
  const { generateRsaSignature } = useSignature()

  const normalizeResponse = (response: any) => {
    if (!response || typeof response !== 'object') return response
    const message =
      response.message ??
      response.msg ??
      response?.data?.message ??
      response?.data?.msg ??
      response?.error ??
      null
    const detail =
      response.detail ??
      response?.data?.detail ??
      response?.data?.error ??
      response?.data?.reason ??
      null

    return {
      ...response,
      message,
      detail
    }
  }

  /**
   * 统一的API请求处理
   */
  const apiRequest = async (url: string, data: any, apiKey: string) => {
    try {
      console.log(`[API请求] URL: ${url}`)
      console.log(`[API请求] API Key: ${apiKey.substring(0, 10)}...`)
      console.log(`[API请求] 请求数据:`, data)

      const response = await $fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': apiKey
        },
        body: data
      })

      const normalized = normalizeResponse(response)
      console.log(`[API响应] 成功:`, normalized)
      return normalized
    } catch (error: any) {
      console.error(`[API错误] 请求失败:`, error)
      
      // 提取错误信息
      const errorMessage =
        error.data?.message ||
        error.data?.msg ||
        error.message ||
        '未知错误'
      const errorDetail =
        error.data?.detail ||
        error.data?.error ||
        error.data?.reason ||
        error.data?.data?.detail ||
        null
      const errorCode = error.data?.code || error.statusCode || 'UNKNOWN'
      const combinedMessage =
        errorDetail && !errorMessage.includes(errorDetail)
          ? `${errorMessage}（${errorDetail}）`
          : errorMessage
      
      console.error(
        `[API错误] 错误码: ${errorCode}, 错误信息: ${combinedMessage}${
          errorDetail ? `，详情: ${errorDetail}` : ''
        }`
      )
      
      throw {
        code: errorCode,
        message: combinedMessage,
        detail: errorDetail,
        originalError: error
      }
    }
  }

  /**
   * 流量主：请求广告
   */
  const requestAd = async (params: {
    reqId: string
    slotId: string
    userId?: string
    deviceIp?: string
    deviceUa?: string
    deviceCountry?: string
  }) => {
    const timestamp = Date.now()
    const requestData: any = {
      reqId: params.reqId,
      slotId: params.slotId,
      timestamp
    }

    // 可选参数（只添加有值的参数，不添加undefined/null）
    if (params.userId) requestData.userId = params.userId
    if (params.deviceIp) requestData.deviceIp = params.deviceIp
    if (params.deviceUa) requestData.deviceUa = params.deviceUa
    if (params.deviceCountry) requestData.deviceCountry = params.deviceCountry

    // 生成签名（注意：签名前不包含sign字段）
    const sign = await generateRsaSignature(requestData, config.public.sspPrivateKey)
    requestData.sign = sign

    // 发送请求（只发送非undefined的值）
    const payloadToSend = JSON.parse(JSON.stringify(requestData))
    
    return await apiRequest(
      `${config.public.apiBaseUrl}/rtb/api/get/ad`,
      payloadToSend,
      config.public.sspApiKey
    )
  }

  /**
   * 流量主：上报曝光
   */
  const reportImpression = async (params: {
    reqId: string
    impId: string
    slotId: string
  }) => {
    const timestamp = Date.now()
    const requestData: any = {
      ...params,
      timestamp
    }

    // 生成签名
    const sign = await generateRsaSignature(requestData, config.public.sspPrivateKey)
    requestData.sign = sign

    // 发送请求
    return await apiRequest(
      `${config.public.apiBaseUrl}/rtb/api/submit/impression`,
      requestData,
      config.public.sspApiKey
    )
  }

  /**
   * 流量主：上报点击（非web跳转）
   */
  const reportClick = async (params: {
    reqId: string
    clickId: string
    slotId: string
  }) => {
    const timestamp = Date.now()
    const requestData: any = {
      ...params,
      timestamp
    }

    // 生成签名
    const sign = await generateRsaSignature(requestData, config.public.sspPrivateKey)
    requestData.sign = sign

    // 发送请求
    return await apiRequest(
      `${config.public.apiBaseUrl}/rtb/api/submit/click`,
      requestData,
      config.public.sspApiKey
    )
  }

  /**
   * 广告主：上报转化
   */
  const reportConversion = async (params: {
    id: string
    clickId: string
    eventType: string
    status: string
    eventTimestamp: number
    userId?: string
    deviceId?: string
    revenue?: number
    currency?: string
    commissionRate?: number
    payout?: number
    reportType?: number
    partnerAppId?: string
    attributed?: number
    invalid?: number
    invalidReason?: string
    meta?: string
    items?: Array<{
      sku: string
      qty: number
      price: number
    }>
  }) => {
    const timestamp = Date.now()
    const requestData: any = {
      ...params,
      timestamp
    }

    // 生成签名
    const sign = await generateRsaSignature(requestData, config.public.dspPrivateKey)
    requestData.sign = sign

    // 发送请求
    return await apiRequest(
      `${config.public.apiBaseUrl}/rtb/api/submit/conversion`,
      requestData,
      config.public.dspApiKey
    )
  }

  return {
    requestAd,
    reportImpression,
    reportClick,
    reportConversion
  }
}

