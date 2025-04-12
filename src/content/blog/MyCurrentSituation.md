---
title: 我的研一现状：学术受挫与技术深耕
date: 2025-04-12T20:10:00+08:00
updated: 2025-04-12T20:10:00+08:00
keywords: ["研一", "现状"]
featured: true
summary: "我的研一现状：学术受挫与技术深耕"
---

# 我的研一现状：学术受挫与技术深耕

## 学术之路：两战两败的迷茫期
### 论文投稿的血泪史
- 📑 **AAAI 2025投稿**：BFP-FGMS: A Fine-Grained Mantissa Sharing Approach for Block Floating Point，被拒
- 📊 **DAC 2025尝试**：DAC-BMS:Block Mantissa Sharing，硬件加速器设计方向，被拒
- 😵 连续被拒的困境：
  - 平均每天投入5小时在论文写作
  - 累计修改32个版本
  - 却换来"novelty is limited"的扎心评语


## 技术栈的进化之路
### 编程语言版图
```python
# 当前技能雷达图
languages = {
    "Java": {"experience": "3年", "项目": "分布式日志系统"},
    "Python": {"框架": "PyTorch/Flask", "应用": "机器学习/Web开发"},
    "Golang": {
        "重点领域": "并发编程/微服务",
        "项目经验": ["高并发API网关", "分布式任务调度系统"]
    },
    "前端": ["React", "Ant Design"]
}
```

### Golang深度实践
正在开发的**云原生监控系统**技术栈：
1. Gin框架构建REST API
2. GORM对接PostgreSQL
3. NSQ消息队列处理日志
4. Docker + Kubernetes部署

```go
package main

import "github.com/gin-gonic/gin"

func main() {
    r := gin.Default()
    r.GET("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{"status": "OK"})
    })
    r.Run() // 监听 0.0.0.0:8080
}
```

## 转型期的深度思考
### 学术与工程的平衡术
- ✅ 发现更适合工程实践
- ❌ 理论突破需要更多积累
- 💡 新思路：将工程实践反哺论文
  - 计划将云原生监控系统抽象成通用框架

### 技术成长路线图
1. **短期目标**（2024）：
   - 考取CKA认证
   - 参与CNCF开源项目
   - 完善个人技术博客(每月4篇更新)

2. **长期规划**：
   - 成为云原生领域专家
   - 创建Golang工具库
   - 实现技术闭环：从开发到部署的完整经验

## 致未来的自己
虽然学术道路暂时受阻，但代码不会辜负每一个深夜的坚持。或许，通向罗马的路不止论文这一条，保持对技术的热爱，终将在自己擅长的领域绽放光芒。🌟

> **后记**：最近在参与开源项目时发现，很多优秀的工程实践最终都转化为了顶会论文。或许只需转变思路，把代码写成诗，让论文生长在真实的土壤里。共勉！