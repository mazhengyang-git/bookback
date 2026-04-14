import express from 'express'
import mysql from 'mysql2/promise' // 支持Promise的MySQL库
import cors from 'cors'
import bcrypt from 'bcryptjs' // 密码加密
import dotenv from 'dotenv'
// 新增：导入JWT（用于登录状态标识，需先安装依赖）
import jwt from 'jsonwebtoken'

// 加载环境变量
dotenv.config()
const app = express()
app.use(cors()) // 解决跨域
app.use(express.json()) // 解析JSON请求体

// 1. 连接MySQL数据库（复用已有配置）
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: 'user_db',
  port: Number(process.env.DB_PORT) || 3306,
}

// 2. 注册接口（原代码不变）
app.post('/api/register', async (req, res) => {
  try {
    const { username, confirmUsername, password, confirmPassword } = req.body

    // 后端验证
    if (!username || !password) {
      return res.status(400).json({ code: 400, msg: '账号或密码不能为空' })
    }
    if (username !== confirmUsername) {
      return res.status(400).json({ code: 400, msg: '两次账号输入不一致' })
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ code: 400, msg: '两次密码输入不一致' })
    }
    if (username.length < 6 && password.length < 6) {
      return res.status(400).json({ code: 400, msg: '账号和密码长度不能少于6位' })
    } else if (password.length < 6) {
      return res.status(400).json({ code: 400, msg: '密码长度不能少于6位' })
    } else if (username.length < 6) {
      return res.status(400).json({ code: 400, msg: '账号长度不能少于6位' })
    }

    // 连接数据库，检查账号是否已存在
    const connection = await mysql.createConnection(dbConfig)
    const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', [username])

    if ((rows as any[]).length > 0) {
      await connection.end()
      return res.status(400).json({ code: 400, msg: '该账号已被注册' })
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // 存入数据库
    await connection.execute('INSERT INTO users (username, password) VALUES (?, ?)', [
      username,
      hashedPassword,
    ])
    await connection.end()

    res.json({ code: 200, msg: '注册成功' })
  } catch (error) {
    console.error('注册失败:', error)
    res.status(500).json({ code: 500, msg: '服务器错误，请稍后再试' })
  }
})

// 3. 新增：登录接口（直接写在注册接口下方）
app.post('/api/login', async (req, res) => {
  try {
    // 登录只需用户名和密码（无需确认项，前端表单也只传这两个）
    const { username, password } = req.body

    // 1. 验证请求参数
    if (!username || !password) {
      return res.status(400).json({ code: 400, msg: '用户名和密码不能为空' })
    }

    // 2. 连接数据库查询用户
    const connection = await mysql.createConnection(dbConfig)
    const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', [username])
    const user = (rows as any[])[0] // TS类型断言，获取查询到的用户

    // 3. 验证用户是否存在
    if (!user) {
      await connection.end()
      return res.status(401).json({ code: 401, msg: '用户名或密码错误' }) // 统一提示，避免泄露账号存在性
    }

    // 4. 验证密码（与注册时的bcrypt加密规则一致）
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      await connection.end()
      return res.status(401).json({ code: 401, msg: '用户名或密码错误' })
    }

    // 5. 生成JWT令牌（登录状态标识，有效期24小时）
    const token = jwt.sign(
      { userId: user.id, username: user.username }, // 存储用户关键信息（不存密码）
      process.env.JWT_SECRET || 'your_secure_secret_key_123', // 密钥：生产环境务必放在.env文件中，且复杂
      { expiresIn: '24h' },
    )

    await connection.end()

    // 6. 返回登录结果（令牌+用户基本信息，隐藏密码）
    res.json({
      code: 200,
      msg: '登录成功',
      data: {
        token, // 前端存储token，后续请求需携带
        user: {
          id: user.id,
          username: user.username, // 只返回必要信息
        },
      },
    })
  } catch (error) {
    console.error('登录失败:', error)
    res.status(500).json({ code: 500, msg: '服务器错误，请稍后再试' })
  }
})

// 启动服务（原代码不变）
const PORT = 3000
app.listen(PORT, () => {
  console.log(`后端服务启动成功，地址：http://localhost:${PORT}`)
  console.log('支持的接口：')
  console.log('POST /api/register - 用户注册')
  console.log('POST /api/login - 用户登录')
})
