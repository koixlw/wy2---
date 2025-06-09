<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon address">
            <el-icon size="32"><office-building /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.totalAddresses }}</div>
            <div class="stat-label">总住址数</div>
          </div>
        </div>    
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon resident">
            <el-icon size="32"><user /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.totalResidents }}</div>
            <div class="stat-label">总住户数</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon expense">
            <el-icon size="32"><money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">¥{{ formatMoney(stats.totalExpenses) }}</div>
            <div class="stat-label">总费用金额</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon pending">
            <el-icon size="32"><warning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.pendingExpenses }}</div>
            <div class="stat-label">待缴费用</div>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 快捷操作 -->
    <div class="quick-actions">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>快捷操作</span>
          </div>
        </template>
        
        <div class="action-grid">
          <el-button 
            type="primary" 
            size="large" 
            @click="$router.push('/addresses')"
            class="action-btn"
          >
          <el-icon><office-building /></el-icon>
            住址管理
          </el-button>
          
          <el-button 
            type="success" 
            size="large" 
            @click="$router.push('/residents')"
            class="action-btn"
          >
            <el-icon><user-filled /></el-icon>
            住户管理
          </el-button>
          
          <el-button 
            type="warning" 
            size="large" 
            @click="$router.push('/expenses')"
            class="action-btn"
          >
          <el-icon><Money /></el-icon>
            费用管理
          </el-button>
          
          <el-button 
            type="info" 
            size="large" 
            @click="$router.push('/expenses/stats')"
            class="action-btn"
          >
            <el-icon><data-analysis /></el-icon>
            费用统计
          </el-button>
        </div>
      </el-card>
    </div>
    
    <!-- 最近活动 -->
    <div class="recent-activities">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>最近活动</span>
            <el-button link @click="refreshActivities">
             <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </template>
        
        <el-timeline>
          <el-timeline-item 
            v-for="activity in activities" 
            :key="activity.id"
            :timestamp="activity.time"
            placement="top"
          >
            <el-card>
              <div class="activity-content">
                <div class="activity-type" :class="activity.type">
                  {{ activity.typeLabel }}
                </div>
                <div class="activity-desc">{{ activity.description }}</div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { expenseAPI, addressAPI, residentAPI } from '@/api'

// 统计数据
const stats = ref({
  totalAddresses: 0,
  totalResidents: 0,
  totalExpenses: 0,
  pendingExpenses: 0
})

// 最近活动
const activities = ref([])

// 格式化金额
const formatMoney = (amount) => {
  return (amount / 100).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 加载统计数据
const loadStats = async () => {
  try {
    // 并行获取各种统计数据
    const [addressResponse, residentResponse, expenseStatsResponse] = await Promise.all([
      addressAPI.getList({ page: 1, limit: 1 }), // 只获取第一页来获取总数
      residentAPI.getList({ page: 1, limit: 1 }), // 只获取第一页来获取总数
      expenseAPI.getStats() // 获取费用统计
    ])

    // 更新统计数据
    stats.value = {
      totalAddresses: addressResponse.data.total || 0,
      totalResidents: residentResponse.data.total || 0,
      totalExpenses: expenseStatsResponse.data.totalAmount || 0,
      pendingExpenses: expenseStatsResponse.data.unpaidCount || expenseStatsResponse.data.pendingCount || 0
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    // 如果API调用失败，使用默认值
    stats.value = {
      totalAddresses: 0,
      totalResidents: 0,
      totalExpenses: 0,
      pendingExpenses: 0
    }
  }
}

// 加载最近活动数据
const loadActivities = async () => {
  try {
    // 获取最近的住址、住户、费用数据来构建活动列表
    const [addressResponse, residentResponse, expenseResponse] = await Promise.all([
      addressAPI.getList({ page: 1, limit: 5, orderBy: 'createdAt', order: 'desc' }),
      residentAPI.getList({ page: 1, limit: 5, orderBy: 'createdAt', order: 'desc' }),
      expenseAPI.getList({ page: 1, limit: 5, orderBy: 'createdAt', order: 'desc' })
    ])

    const newActivities = []
    
    // 添加住址活动
    if (addressResponse.data.items) {
      addressResponse.data.items.forEach(address => {
        newActivities.push({
          id: `address_${address.id}`,
          type: 'address',
          typeLabel: '住址',
          description: `新增住址：${address.name}`,
          time: address.createdAt
        })
      })
    }
    
    // 添加住户活动
    if (residentResponse.data.items) {
      residentResponse.data.items.forEach(resident => {
        newActivities.push({
          id: `resident_${resident.id}`,
          type: 'resident',
          typeLabel: '住户',
          description: `新增住户：${resident.name}（${resident.isOwner ? '业主' : '租户'}）`,
          time: resident.createdAt
        })
      })
    }
    
    // 添加费用活动
    if (expenseResponse.data.items) {
      expenseResponse.data.items.forEach(expense => {
        newActivities.push({
          id: `expense_${expense.id}`,
          type: expense.status === 'paid' ? 'payment' : 'expense',
          typeLabel: expense.status === 'paid' ? '缴费' : '费用',
          description: expense.status === 'paid' 
            ? `缴纳${expense.type}费用 ¥${formatMoney(expense.amount)}`
            : `生成${expense.type}费用 ¥${formatMoney(expense.amount)}`,
          time: expense.status === 'paid' ? expense.paidAt : expense.createdAt
        })
      })
    }
    
    // 按时间排序，取最新的10条
    activities.value = newActivities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10)
      
  } catch (error) {
    console.error('加载活动数据失败:', error)
    // 如果API调用失败，使用默认的示例数据
    activities.value = [
      {
        id: 1,
        type: 'address',
        typeLabel: '住址',
        description: '暂无最近活动数据',
        time: new Date().toISOString()
      }
    ]
  }
}

// 刷新活动
const refreshActivities = () => {
  loadActivities()
}

// 页面加载时获取数据
onMounted(() => {
  loadStats()
  loadActivities()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 10px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: white;
}

.stat-icon.address {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.resident {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.expense {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.pending {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
}

.quick-actions {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-btn {
  height: 60px;
  font-size: 16px;
  border-radius: 8px;
}

.recent-activities {
  margin-bottom: 30px;
}

.activity-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.activity-type {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.activity-type.address {
  background-color: #409eff;
}

.activity-type.resident {
  background-color: #67c23a;
}

.activity-type.expense {
  background-color: #e6a23c;
}

.activity-type.payment {
  background-color: #f56c6c;
}

.activity-desc {
  flex: 1;
  color: #606266;
}
</style>