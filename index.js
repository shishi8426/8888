const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// 允许跨域请求
app.use(cors());
app.use(express.json());

// 初始化 SQLite 数据库
const db = new sqlite3.Database(path.join(__dirname, 'users.db'));

// 创建表（如果不存在）
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    password TEXT,
    coins INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1
  )
`);

// 注册接口
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (row) return res.status(400).json({ message: '用户已存在' });
    db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, password], err => {
      if (err) return res.status(500).json({ message: '注册失败' });
      res.json({ message: '注册成功' });
    });
  });
});

// 登录接口
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
    if (!row) return res.status(400).json({ message: '登录失败' });
    res.json({ message: '登录成功', user: row });
  });
});

// 保存用户数据（挖矿）
app.post('/save', (req, res) => {
  const { email, coins, level } = req.body;
  db.run('UPDATE users SET coins = ?, level = ? WHERE email = ?', [coins, level, email], err => {
  if (err) {
    console.error('保存失败：', err.message);
    return res.status(500).json({ message: '保存失败' });
  }
  console.log(`✅ 已保存用户 ${email}：coins=${coins}, level=${level}`);
  res.json({ message: '保存成功' });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
