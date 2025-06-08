<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon address">
            <el-icon size="32"><ep-office-building /></el-icon>
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
            <el-icon size="32"><ep-user /></el-icon>
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
            <el-icon size="32"><ep-money /></el-icon>
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
            <el-icon size="32"><ep-warning /></el-icon>
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
            @click="$router.push('/addresses/list')"
            class="action-btn"
          >
            <el-icon><ep-plus /></el-icon>
            新增住址
          </el-button>
          
          <el-button 
            type="success" 
            size="large" 
            @click="$router.push('/residents/list')"
            class="action-btn"
          >
            <el-icon><ep-user-filled /></el-icon>
            新增住户
          </el-button>
          
          <el-button 
            type="warning" 
            size="large" 
            @click="$router.push('/expenses/list')"
            class="action-btn"
          >
            <el-icon><ep-money /></el-icon>
            新增费用
          </el-button>
          
          <el-button 
            type="info" 
            size="large" 
            @click="$router.push('/expenses/stats')"
            class="action-btn"
          >
            <el-icon><ep-data-analysis /></el-icon>
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
              <el-icon><ep-refresh /></el-icon>
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
import { expenseAPI } from '@/api'

// 统计数据
const stats = ref({
  totalAddresses: 0,
  totalResidents: 0,
  totalExpenses: 0,
  pendingExpenses: 0
})

// 最近活动
const activities = ref([
  {
    id: 1,
    type: 'address',
    typeLabel: '住址',
    description: '新增住址：阳光小区1号楼101室',
    time: '2024-01-15 10:30'
  },
  {
    id: 2,
    type: 'resident',
    typeLabel: '住户',
    description: '新增住户：张三（业主）',
    time: '2024-01-15 09:15'
  },
  {
    id: 3,
    type: 'expense',
    typeLabel: '费用',
    description: '生成2024年1月物业费',
    time: '2024-01-15 08:00'
  },
  {
    id: 4,
    type: 'payment',
    typeLabel: '缴费',
    description: '李四缴纳水费 ¥120.00',
    time: '2024-01-14 16:45'
  }
])

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
    // 模拟数据，实际应该调用API
    stats.value = {
      totalAddresses: 156,
      totalResidents: 423,
      totalExpenses: 125680000, // 以分为单位
      pendingExpenses: 23
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 刷新活动
const refreshActivities = () => {
  // 实际应该调用API获取最新活动
  console.log('刷新活动列表')
}

// 页面加载时获取数据
onMounted(() => {
  loadStats()
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