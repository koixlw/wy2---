<template>
  <div class="expense-stats-page">
    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="统计维度">
          <el-select v-model="filterForm.dimension" placeholder="请选择统计维度">
            <el-option label="按月统计" value="month" />
            <el-option label="按季度统计" value="quarter" />
            <el-option label="按年统计" value="year" />
            <el-option label="按费用类型" value="type" />
            <el-option label="按住址" value="address" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="monthrange"
            range-separator="至"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
            format="YYYY-MM"
            value-format="YYYY-MM"
          />
        </el-form-item>
        
        <el-form-item label="费用类型">
          <el-select v-model="filterForm.type" placeholder="请选择费用类型" clearable>
            <el-option label="物业费" value="property" />
            <el-option label="水费" value="water" />
            <el-option label="电费" value="electricity" />
            <el-option label="燃气费" value="gas" />
            <el-option label="停车费" value="parking" />
            <el-option label="维修费" value="maintenance" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <el-icon><ep-search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><ep-refresh /></el-icon>
            重置
          </el-button>
          <el-button type="success" @click="handleExport">
            <el-icon><ep-download /></el-icon>
            导出
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 总体统计卡片 -->
    <el-row :gutter="20" class="overview-row">
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-content">
            <div class="overview-icon total">
              <el-icon><ep-money /></el-icon>
            </div>
            <div class="overview-info">
              <div class="overview-value">{{ formatMoney(overview.totalAmount) }}</div>
              <div class="overview-label">总费用金额</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-content">
            <div class="overview-icon paid">
              <el-icon><ep-check /></el-icon>
            </div>
            <div class="overview-info">
              <div class="overview-value">{{ formatMoney(overview.paidAmount) }}</div>
              <div class="overview-label">已缴费金额</div>
              <div class="overview-rate">{{ overview.paidRate }}%</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-content">
            <div class="overview-icon pending">
              <el-icon><ep-clock /></el-icon>
            </div>
            <div class="overview-info">
              <div class="overview-value">{{ formatMoney(overview.pendingAmount) }}</div>
              <div class="overview-label">待缴费金额</div>
              <div class="overview-rate">{{ overview.pendingRate }}%</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="overview-content">
            <div class="overview-icon overdue">
              <el-icon><ep-warning /></el-icon>
            </div>
            <div class="overview-info">
              <div class="overview-value">{{ formatMoney(overview.overdueAmount) }}</div>
              <div class="overview-label">逾期金额</div>
              <div class="overview-rate">{{ overview.overdueRate }}%</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <!-- 趋势图 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>费用趋势图</span>
              <el-radio-group v-model="trendChartType" size="small">
                <el-radio-button label="line">折线图</el-radio-button>
                <el-radio-button label="bar">柱状图</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      
      <!-- 分类饼图 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>费用类型分布</span>
            </div>
          </template>
          <div ref="pieChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 详细统计表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>详细统计数据</span>
          <el-button type="primary" size="small" @click="handleRefresh">
            <el-icon><ep-refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      
      <el-table 
        :data="tableData" 
        v-loading="loading"
        stripe
        border
        style="width: 100%"
        :summary-method="getSummaries"
        show-summary
      >
        <el-table-column 
          :prop="getDimensionProp()" 
          :label="getDimensionLabel()" 
          width="150" 
        />
        <el-table-column prop="totalAmount" label="总金额" width="120">
          <template #default="{ row }">
            <span class="amount-text">{{ formatMoney(row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="paidAmount" label="已缴费" width="120">
          <template #default="{ row }">
            <span class="amount-text paid">{{ formatMoney(row.paidAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="pendingAmount" label="待缴费" width="120">
          <template #default="{ row }">
            <span class="amount-text pending">{{ formatMoney(row.pendingAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="overdueAmount" label="逾期金额" width="120">
          <template #default="{ row }">
            <span class="amount-text overdue">{{ formatMoney(row.overdueAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="paidRate" label="缴费率" width="100">
          <template #default="{ row }">
            <el-progress 
              :percentage="row.paidRate" 
              :color="getProgressColor(row.paidRate)"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
        <el-table-column prop="count" label="费用条数" width="100" />
        <el-table-column prop="avgAmount" label="平均金额" width="120">
          <template #default="{ row }">
            <span class="amount-text">{{ formatMoney(row.avgAmount) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { expenseAPI } from '@/api'
import * as echarts from 'echarts'

// 筛选表单
const filterForm = reactive({
  dimension: 'month',
  dateRange: [],
  type: ''
})

// 总体统计
const overview = reactive({
  totalAmount: 0,
  paidAmount: 0,
  pendingAmount: 0,
  overdueAmount: 0,
  paidRate: 0,
  pendingRate: 0,
  overdueRate: 0
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 图表相关
const trendChartRef = ref()
const pieChartRef = ref()
const trendChartType = ref('line')
let trendChart = null
let pieChart = null

// 格式化金额
const formatMoney = (amount) => {
  if (amount === null || amount === undefined) return '¥0.00'
  return `¥${Number(amount).toFixed(2)}`
}

// 获取维度属性
const getDimensionProp = () => {
  const propMap = {
    month: 'period',
    quarter: 'period',
    year: 'period',
    type: 'type',
    address: 'addressName'
  }
  return propMap[filterForm.dimension] || 'period'
}

// 获取维度标签
const getDimensionLabel = () => {
  const labelMap = {
    month: '月份',
    quarter: '季度',
    year: '年份',
    type: '费用类型',
    address: '住址'
  }
  return labelMap[filterForm.dimension] || '维度'
}

// 获取进度条颜色
const getProgressColor = (percentage) => {
  if (percentage >= 80) return '#67c23a'
  if (percentage >= 60) return '#e6a23c'
  return '#f56c6c'
}

// 获取汇总数据
const getSummaries = (param) => {
  const { columns, data } = param
  const sums = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    
    const values = data.map(item => Number(item[column.property]))
    if (!values.every(value => isNaN(value))) {
      if (column.property === 'paidRate') {
        const totalAmount = data.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0)
        const paidAmount = data.reduce((sum, item) => sum + Number(item.paidAmount || 0), 0)
        sums[index] = totalAmount > 0 ? `${((paidAmount / totalAmount) * 100).toFixed(1)}%` : '0%'
      } else if (column.property.includes('Amount')) {
        sums[index] = formatMoney(values.reduce((prev, curr) => prev + curr, 0))
      } else {
        sums[index] = values.reduce((prev, curr) => prev + curr, 0)
      }
    } else {
      sums[index] = '-'
    }
  })
  
  return sums
}

// 初始化趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return
  
  trendChart = echarts.init(trendChartRef.value)
  
  const option = {
    title: {
      text: '费用趋势',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        let result = params[0].axisValue + '<br/>'
        params.forEach(param => {
          result += `${param.seriesName}: ${formatMoney(param.value)}<br/>`
        })
        return result
      }
    },
    legend: {
      data: ['总金额', '已缴费', '待缴费', '逾期金额'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: []
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: function(value) {
          return '¥' + (value / 1000).toFixed(0) + 'k'
        }
      }
    },
    series: [
      {
        name: '总金额',
        type: trendChartType.value,
        data: [],
        itemStyle: { color: '#409eff' }
      },
      {
        name: '已缴费',
        type: trendChartType.value,
        data: [],
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '待缴费',
        type: trendChartType.value,
        data: [],
        itemStyle: { color: '#e6a23c' }
      },
      {
        name: '逾期金额',
        type: trendChartType.value,
        data: [],
        itemStyle: { color: '#f56c6c' }
      }
    ]
  }
  
  trendChart.setOption(option)
}

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) return
  
  pieChart = echarts.init(pieChartRef.value)
  
  const option = {
    title: {
      text: '费用类型分布',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [
      {
        name: '费用金额',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: []
      }
    ]
  }
  
  pieChart.setOption(option)
}

// 更新趋势图数据
const updateTrendChart = (data) => {
  if (!trendChart) return
  
  const categories = data.map(item => {
    if (filterForm.dimension === 'type') {
      const typeMap = {
        property: '物业费',
        water: '水费',
        electricity: '电费',
        gas: '燃气费',
        parking: '停车费',
        maintenance: '维修费',
        other: '其他'
      }
      return typeMap[item.type] || item.type
    }
    return item.period || item.addressName || item.type
  })
  
  const totalAmounts = data.map(item => item.totalAmount || 0)
  const paidAmounts = data.map(item => item.paidAmount || 0)
  const pendingAmounts = data.map(item => item.pendingAmount || 0)
  const overdueAmounts = data.map(item => item.overdueAmount || 0)
  
  trendChart.setOption({
    xAxis: {
      data: categories
    },
    series: [
      {
        name: '总金额',
        type: trendChartType.value,
        data: totalAmounts
      },
      {
        name: '已缴费',
        type: trendChartType.value,
        data: paidAmounts
      },
      {
        name: '待缴费',
        type: trendChartType.value,
        data: pendingAmounts
      },
      {
        name: '逾期金额',
        type: trendChartType.value,
        data: overdueAmounts
      }
    ]
  })
}

// 更新饼图数据
const updatePieChart = (data) => {
  if (!pieChart) return
  
  const pieData = data.map(item => {
    let name = ''
    if (filterForm.dimension === 'type') {
      const typeMap = {
        property: '物业费',
        water: '水费',
        electricity: '电费',
        gas: '燃气费',
        parking: '停车费',
        maintenance: '维修费',
        other: '其他'
      }
      name = typeMap[item.type] || item.type
    } else {
      name = item.period || item.addressName || item.type
    }
    
    return {
      name,
      value: item.totalAmount || 0
    }
  })
  
  pieChart.setOption({
    series: [{
      data: pieData
    }]
  })
}

// 加载统计数据
const loadStatsData = async () => {
  loading.value = true
  try {
    const params = {
      dimension: filterForm.dimension,
      ...filterForm
    }
    
    // 处理日期范围
    if (filterForm.dateRange && filterForm.dateRange.length === 2) {
      params.startDate = filterForm.dateRange[0]
      params.endDate = filterForm.dateRange[1]
    }
    delete params.dateRange
    
    // 过滤空值
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    
    const response = await expenseAPI.getStats(params)
    
    if (response.code === 200) {
      const data = response.data
      
      // 更新总体统计
      Object.assign(overview, data.overview || {})
      
      // 更新表格数据
      tableData.value = data.details || []
      
      // 更新图表
      await nextTick()
      updateTrendChart(data.details || [])
      updatePieChart(data.details || [])
    } else {
      ElMessage.error(response.msg || '获取统计数据失败')
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  } finally {
    loading.value = false
  }
}

// 查询
const handleQuery = () => {
  loadStatsData()
}

// 重置
const handleReset = () => {
  Object.assign(filterForm, {
    dimension: 'month',
    dateRange: [],
    type: ''
  })
  loadStatsData()
}

// 刷新
const handleRefresh = () => {
  loadStatsData()
}

// 导出
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 监听图表类型变化
watch(trendChartType, () => {
  if (trendChart) {
    updateTrendChart(tableData.value)
  }
})

// 监听维度变化
watch(() => filterForm.dimension, () => {
  loadStatsData()
})

// 页面加载时初始化
onMounted(async () => {
  // 设置默认时间范围为最近6个月
  const now = new Date()
  const endMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const startMonth = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`
  filterForm.dateRange = [startMonth, endMonth]
  
  await nextTick()
  initTrendChart()
  initPieChart()
  loadStatsData()
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (trendChart) trendChart.resize()
    if (pieChart) pieChart.resize()
  })
})
</script>

<style scoped>
.expense-stats-page {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.overview-row {
  margin-bottom: 20px;
}

.overview-card {
  height: 120px;
}

.overview-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.overview-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 28px;
  color: white;
}

.overview-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.overview-icon.paid {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.overview-icon.pending {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.overview-icon.overdue {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.overview-info {
  flex: 1;
}

.overview-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.overview-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.overview-rate {
  font-size: 12px;
  color: #67c23a;
  font-weight: bold;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 320px;
  width: 100%;
}

.table-card {
  margin-bottom: 20px;
}

.amount-text {
  font-weight: bold;
}

.amount-text.paid {
  color: #67c23a;
}

.amount-text.pending {
  color: #e6a23c;
}

.amount-text.overdue {
  color: #f56c6c;
}

:deep(.el-progress-bar__outer) {
  border-radius: 4px;
}

:deep(.el-progress-bar__inner) {
  border-radius: 4px;
}
</style>