<template>
  <div class="addresses-page">
    <!-- 搜索和操作栏 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="搜索关键词">
          <el-input 
            v-model="searchForm.search" 
            placeholder="请输入住址名称" 
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="地址类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
            <el-option label="小区" value="community" />
            <el-option label="栋" value="building" />
            <el-option label="单元" value="unit" />
            <el-option label="房间" value="room" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="启用状态">
          <el-select v-model="searchForm.isActive" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><ep-search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><ep-refresh /></el-icon>
            重置
          </el-button>
          <el-button type="success" @click="handleAdd">
            <el-icon><ep-plus /></el-icon>
            新增住址
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table 
        :data="tableData" 
        v-loading="loading"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="住址名称" min-width="150" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ getTypeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="编码" width="120" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="area" label="面积(㎡)" width="100" />
        <el-table-column prop="isActive" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              <el-icon><ep-edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              <el-icon><ep-delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 新增/编辑对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle" 
      width="600px"
      @close="handleDialogClose"
    >
      <el-form 
        ref="formRef" 
        :model="form" 
        :rules="formRules" 
        label-width="100px"
      >
        <el-form-item label="住址名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入住址名称" />
        </el-form-item>
        
        <el-form-item label="地址类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型">
            <el-option label="小区" value="community" />
            <el-option label="栋" value="building" />
            <el-option label="单元" value="unit" />
            <el-option label="房间" value="room" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入编码" />
        </el-form-item>
        
        <el-form-item label="描述">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入描述"
          />
        </el-form-item>
        
        <el-form-item label="面积(㎡)">
          <el-input-number 
            v-model="form.area" 
            :min="0" 
            :precision="2" 
            placeholder="请输入面积"
          />
        </el-form-item>
        
        <el-form-item label="启用状态">
          <el-switch v-model="form.isActive" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { addressAPI } from '@/api'

// 搜索表单
const searchForm = reactive({
  search: '',
  type: '',
  isActive: null
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const submitting = ref(false)

// 表单
const formRef = ref()
const form = reactive({
  id: null,
  name: '',
  type: '',
  code: '',
  description: '',
  area: null,
  isActive: true
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入住址名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择地址类型', trigger: 'change' }],
  code: [{ required: true, message: '请输入编码', trigger: 'blur' }]
}

// 获取类型标签类型
const getTypeTagType = (type) => {
  const typeMap = {
    community: 'primary',
    building: 'success',
    unit: 'warning',
    room: 'info'
  }
  return typeMap[type] || 'info'
}

// 获取类型标签
const getTypeLabel = (type) => {
  const typeMap = {
    community: '小区',
    building: '栋',
    unit: '单元',
    room: '房间'
  }
  return typeMap[type] || type
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      page: pagination.page,
      limit: pagination.limit
    }
    
    // 过滤空值
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    
    const response = await addressAPI.getList(params)
    
    if (response.code === 200) {
      tableData.value = response.data.items
      pagination.total = response.data.pagination.total
    } else {
      ElMessage.error(response.msg || '获取数据失败')
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadData()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    search: '',
    type: '',
    isActive: null
  })
  pagination.page = 1
  loadData()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增住址'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑住址'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除住址 "${row.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await addressAPI.delete(row.id)
    
    if (response.code === 200) {
      ElMessage.success('删除成功')
      loadData()
    } else {
      ElMessage.error(response.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    submitting.value = true
    
    const response = isEdit.value 
      ? await addressAPI.update(form.id, form)
      : await addressAPI.create(form)
    
    if (response.code === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
      loadData()
    } else {
      ElMessage.error(response.msg || '操作失败')
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    id: null,
    name: '',
    type: '',
    code: '',
    description: '',
    area: null,
    isActive: true
  })
  
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 对话框关闭
const handleDialogClose = () => {
  resetForm()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.limit = size
  pagination.page = 1
  loadData()
}

// 当前页改变
const handleCurrentChange = (page) => {
  pagination.page = page
  loadData()
}

// 页面加载时获取数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.addresses-page {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  text-align: right;
}
</style>