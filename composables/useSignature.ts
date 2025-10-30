import CryptoJS from 'crypto-js'
// @ts-ignore - jsrsasign library
import KJUR from 'jsrsasign'

/**
 * 签名工具 - RSA和MD5签名
 * 
 * 使用 jsrsasign 库实现RSA签名，完全兼容后端Java实现
 * 
 * 后端设计说明：
 * 1. 后端使用CommonCryptogramUtil.generateRsaKeyPair()生成2048位RSA密钥对
 * 2. 公钥存储到数据库（pub_api_key表或adv_api_key表）
 * 3. 私钥返回给用户，前端保存
 * 4. 签名算法：SHA256withRSA（对应后端的Signature.getInstance("SHA256withRSA")）
 * 5. 签名字符串格式：k1=v1&k2=v2&k3=v3（键值对按key升序排序，value序列化为字符串）
 * 6. 签名结果：Base64编码
 * 7. 后端验签：CommonCryptogramUtil.doRsaVerify(data, signBase64, publicKeyBase64)
 */
export const useSignature = () => {
  const config = useRuntimeConfig()

  /**
   * 序列化参数值（与后端ObjectMapper保持一致）
   * 后端使用Jackson的ObjectMapper，会将对象转为JSON字符串
   */
  const serializeValue = (value: any): string => {
    if (value === null || value === undefined) return ''
    // 后端使用 ObjectMapper.convertValue(...).toString()，统一按字符串拼接
    return String(value)
  }

  /**
   * 将Base64密钥转PEM格式（供jsrsasign库使用）
   */
  const base64ToPem = (base64Key: string, isPrivate: boolean = true): string => {
    const clean = base64Key.replace(/[\s\r\n]+/g, '')
    const lines: string[] = []
    for (let i = 0; i < clean.length; i += 64) {
      lines.push(clean.substring(i, i + 64))
    }
    
    const header = isPrivate ? '-----BEGIN PRIVATE KEY-----' : '-----BEGIN PUBLIC KEY-----'
    const footer = isPrivate ? '-----END PRIVATE KEY-----' : '-----END PUBLIC KEY-----'
    return `${header}\n${lines.join('\n')}\n${footer}`
  }

  /**
   * 生成RSA-SHA256签名（用于流量主和广告主API）
   * 
   * 后端签名逻辑（CommonCryptogramUtil.doRsaSign）：
   * 1. 按键名升序排序
   * 2. 拼接为 k1=v1&k2=v2 格式（value序列化为字符串）
   * 3. 使用 SHA256withRSA 签名
   * 4. Base64编码返回
   * 
   * @param params 请求参数（不包含sign字段）
   * @param privateKeyBase64 RSA私钥（Base64编码，PKCS#8格式）
   * @returns Base64编码的签名
   */
  const generateRsaSignature = async (params: Record<string, any>, privateKeyBase64: string): Promise<string> => {
    try {
      // 1. 移除sign字段
      const paramsCopy = { ...params }
      delete paramsCopy.sign

      // 2. 按key升序排序（对应后端：Object.keys().sort()）
      const sortedKeys = Object.keys(paramsCopy).sort()

      // 3. 拼接字符串 k1=v1&k2=v2&k3=v3
      const parts: string[] = []
      for (const key of sortedKeys) {
        const value = paramsCopy[key]
        if (value !== null && value !== undefined) {
          const serializedValue = serializeValue(value)
          parts.push(`${key}=${serializedValue}`)
        }
      }
      
      const signString = parts.join('&')

      console.log('[RSA签名] ========== 签名字符串 ==========')
      console.log(signString)
      console.log('[RSA签名] 排序后的参数keys:', sortedKeys)
      console.log('[RSA签名] 签名字符串长度:', signString.length)
      console.log('[RSA签名] ===================================')
      
      // 检查私钥
      console.log('[RSA签名] 私钥长度:', privateKeyBase64.length)
      console.log('[RSA签名] 私钥前50字符:', privateKeyBase64.substring(0, 50))
      
      // 使用 jsrsasign 库进行签名
      const pem = base64ToPem(privateKeyBase64, true)
      const prv = KJUR.KEYUTIL.getKey(pem)
      const sig = new KJUR.crypto.Signature({ alg: 'SHA256withRSA' })
      sig.init(prv)
      sig.updateString(signString)
      const hex = sig.sign()
      const b64 = KJUR.hextob64(hex)

      console.log('[RSA签名] 签名成功(jsrsasign)')
      console.log('[RSA签名] 签名长度:', b64.length)
      console.log('[RSA签名] 签名(Base64前50):', b64.substring(0, 50))

      return b64
    } catch (error) {
      console.error('[RSA签名] 签名生成失败:', error)
      throw new Error('签名生成失败: ' + error)
    }
  }

  /**
   * 验证RSA签名（对应后端的 CommonCryptogramUtil.doRsaVerify）
   * 
   * @param data 原始签名字符串
   * @param signBase64 签名（Base64编码）
   * @param publicKeyBase64 公钥（Base64编码，X.509格式）
   * @returns 验签是否通过
   */
  const verifyRsaSignature = async (
    data: string, 
    signBase64: string, 
    publicKeyBase64: string
  ): Promise<boolean> => {
    try {
      // 使用 jsrsasign 库进行验签
      const pubPem = base64ToPem(publicKeyBase64, false)
      const pubKey = KJUR.KEYUTIL.getKey(pubPem)
      const ver = new KJUR.crypto.Signature({ alg: 'SHA256withRSA' })
      ver.init(pubKey)
      ver.updateString(data)
      const ok = ver.verify(KJUR.b64tohex(signBase64))
      
      console.log('[RSA验签] 验签结果(jsrsasign):', ok)
      return ok
    } catch (error) {
      console.error('[RSA验签] 验签失败:', error)
      return false
    }
  }

  /**
   * 生成MD5签名（用于点击跳转URL）
   * @param params 请求参数
   * @param secretKey 密钥
   * @returns 大写MD5签名
   */
  const generateMd5Signature = (params: Record<string, any>, secretKey: string): string => {
    try {
      // 1. 按key升序排序
      const sortedKeys = Object.keys(params).sort()

      // 2. 拼接字符串 k1=v1&k2=v2&key=secretKey
      const signString = sortedKeys
        .map(key => `${key}=${params[key]}`)
        .join('&') + `&key=${secretKey}`

      console.log('MD5签名字符串:', signString)

      // 3. MD5加密并转大写
      const md5Hash = CryptoJS.MD5(signString).toString().toUpperCase()
      
      console.log('MD5签名结果:', md5Hash)
      return md5Hash
    } catch (error) {
      console.error('MD5签名生成失败:', error)
      throw new Error('MD5签名生成失败')
    }
  }

  /**
   * 生成UUID
   */
  const generateUuid = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  /**
   * 生成请求ID
   */
  const generateReqId = (): string => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成转化ID
   */
  const generateConvId = (): string => {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 从文本文件读取Base64私钥
   * 后端返回的私钥就是纯Base64字符串，无需PEM头尾
   */
  const readPrivateKeyFromFile = async (fileContent: string): Promise<string> => {
    try {
      // 移除所有空白字符（包括PEM头尾、换行符、空格等）
      const cleaned = fileContent
        .replace(/-----BEGIN PRIVATE KEY-----/g, '')
        .replace(/-----END PRIVATE KEY-----/g, '')
        .replace(/[\s\r\n]+/g, '')
        .trim()
      
      console.log('[RSA签名] 从文件读取私钥')
      console.log('[RSA签名] 原始长度:', fileContent.length)
      console.log('[RSA签名] 清理后长度:', cleaned.length)
      console.log('[RSA签名] 私钥前50字符:', cleaned.substring(0, 50))
      
      if (cleaned.length < 100) {
        throw new Error('私钥长度异常，请检查文件格式')
      }
      
      return cleaned
    } catch (error) {
      console.error('[RSA签名] 读取私钥文件失败:', error)
      throw new Error('读取私钥文件失败')
    }
  }

  return {
    generateRsaSignature,
    verifyRsaSignature,
    generateMd5Signature,
    generateUuid,
    generateReqId,
    generateConvId,
    readPrivateKeyFromFile
  }
}
