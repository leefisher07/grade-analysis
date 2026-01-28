/**
 * 智能评语系统 - 服务器端 API
 *
 * 功能：
 * - 激活码验证
 * - 额度管理
 * - DeepSeek API 中转
 *
 * 启动方式：
 * - 开发环境：npm run dev
 * - 生产环境：npm start
 * - PM2管理：npm run pm2:start
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import activationRoutes from './routes/activation.js'
import quotaRoutes from './routes/quota.js'
import commentRoutes from './routes/comment.js'
import { testAPIConnection } from './utils/deepseek.js'
import { getStatistics } from './utils/storage.js'

// 加载环境变量
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// ========== 中间件配置 ==========

// CORS 跨域配置
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// 解析 JSON 请求体
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 请求日志
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.path}`)
  next()
})

// ========== 路由配置 ==========

// 健康检查
app.get('/health', async (req, res) => {
  try {
    const stats = await getStatistics()
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      statistics: stats
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})

// API 路由
app.use('/api/activation', activationRoutes)
app.use('/api/quota', quotaRoutes)
app.use('/api/comment', commentRoutes)

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: '智能评语系统 API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /health',
      activation: 'POST /api/activation/verify',
      quota: 'GET /api/quota/check?code=xxx',
      comment: 'POST /api/comment/generate'
    }
  })
})

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    error: '接口不存在',
    path: req.path
  })
})

// 错误处理
app.use((err, req, res, next) => {
  console.error('[ERROR]', err)
  res.status(500).json({
    error: '服务器内部错误',
    message: err.message
  })
})

// ========== 启动服务器 ==========

async function startServer() {
  try {
    // 测试 DeepSeek API 连接
    console.log('\n🔍 正在测试 DeepSeek API 连接...')
    const apiConnected = await testAPIConnection()

    if (!apiConnected) {
      console.error('⚠️  警告：DeepSeek API 连接失败，但服务器将继续启动')
    }

    // 启动服务器
    app.listen(PORT, '0.0.0.0', () => {
      console.log('\n' + '='.repeat(50))
      console.log('🚀 智能评语系统 API 服务已启动')
      console.log('='.repeat(50))
      console.log(`📡 监听端口: ${PORT}`)
      console.log(`🌐 本地访问: http://localhost:${PORT}`)
      console.log(`🌐 外网访问: http://8.134.89.239:${PORT}`)
      console.log(`🔧 环境模式: ${process.env.NODE_ENV || 'development'}`)
      console.log(`🔑 API Key: ${process.env.DEEPSEEK_API_KEY ? '已配置' : '❌ 未配置'}`)
      console.log('='.repeat(50))
      console.log('\n📋 可用接口:')
      console.log(`  GET  /health                    - 健康检查`)
      console.log(`  POST /api/activation/verify    - 验证激活码`)
      console.log(`  GET  /api/quota/check          - 查询额度`)
      console.log(`  POST /api/comment/generate     - 生成评语`)
      console.log('\n✨ 服务器运行中，按 Ctrl+C 停止\n')
    })

  } catch (error) {
    console.error('❌ 服务器启动失败:', error)
    process.exit(1)
  }
}

// 优雅退出
process.on('SIGTERM', () => {
  console.log('\n📴 收到 SIGTERM 信号，正在关闭服务器...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('\n📴 收到 SIGINT 信号，正在关闭服务器...')
  process.exit(0)
})

// 启动
startServer()
