/**
 * PM2 进程管理配置
 *
 * 功能：
 * - 自动重启
 * - 日志管理
 * - 性能监控
 *
 * 使用方法：
 * - 启动：pm2 start ecosystem.config.cjs
 * - 停止：pm2 stop comment-system-api
 * - 重启：pm2 restart comment-system-api
 * - 查看日志：pm2 logs comment-system-api
 * - 查看状态：pm2 status
 */

module.exports = {
  apps: [{
    name: 'comment-system-api',
    script: './server.js',

    // 运行模式
    instances: 1,
    exec_mode: 'fork',

    // 自动重启配置
    watch: false,
    max_memory_restart: '500M',

    // 环境变量
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },

    // 日志配置
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,

    // 重启配置
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',

    // 其他配置
    kill_timeout: 5000,
    listen_timeout: 10000,

    // 时间配置
    time: true
  }]
}
