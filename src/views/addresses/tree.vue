<template>
  <div class="address-tree-page">
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
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
           <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
           <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-button type="success" @click="handleExpandAll">
          <el-icon><Money /></el-icon>
            展开全部
          </el-button>
          <el-button @click="handleCollapseAll">
           <el-icon><Minus /></el-icon>
            收起全部
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 树形结构 -->
    <el-card class="tree-card">
      <div class="tree-container">
        <el-tree
          ref="treeRef"
          :data="treeData"
          :props="treeProps"
          :filter-node-method="filterNode"
          :expand-on-click-node="false"
          :default-expand-all="false"
          node-key="id"
          v-loading="loading"
        >
          <template #default="{ node, data }">
            <div class="tree-node">
              <div class="node-content">
                <el-icon class="node-icon" :class="getNodeIconClass(data.type)">
                  <component :is="getNodeIcon(data.type)" />
                </el-icon>
                <span class="node-label">{{ data.name }}</span>
                <el-tag 
                  :type="getTypeTagType(data.type)" 
                  size="small" 
                  class="node-type"
                >
                  {{ getTypeLabel(data.type) }}
                </el-tag>
                <el-tag 
                  v-if="!data.isActive" 
                  type="danger" 
                  size="small" 
                  class="node-status"
                >
                  已禁用
                </el-tag>
              </div>
              
              <div class="node-actions">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="handleAddChild(data)"
                  v-if="data.type !== 'room'"
                >
                <el-icon><Money /></el-icon>
                  添加子级
                </el-button>
                <el-button 
                  type="success" 
                  size="small" 
                  @click="handleEdit(data)"
                >
                <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button 
                  type="info" 
                  size="small" 
                  @click="handleViewResidents(data)"
                >
                 <el-icon><User /></el-icon>
                  住户
                </el-button>
                <el-button 
                  type="warning" 
                  size="small" 
                  @click="handleViewExpenses(data)"
                >
                <el-icon><Money /></el-icon>
                  费用
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="handleDelete(data)"
                >
                <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </template>
        </el-tree>
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
          <el-select v-model="form.type" placeholder="请选择类型" :disabled="isEdit">
            <el-option 
              v-for="option in getTypeOptions()"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
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
        
        <el-form-item label="面积(㎡)" v-if="form.type === 'room'">
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
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { addressAPI } from '@/api'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  search: ''
})

// 树形数据
const treeData = ref([])
const loading = ref(false)
const treeRef = ref()

// 树形配置
const treeProps = {
  children: 'children',
  label: 'name'
}

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const submitting = ref(false)
const parentData = ref(null)

// 表单
const formRef = ref()
const form = reactive({
  id: null,
  name: '',
  type: '',
  code: '',
  description: '',
  area: null,
  isActive: true,
  parentId: null
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入住址名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择地址类型', trigger: 'change' }],
  code: [{ required: true, message: '请输入编码', trigger: 'blur' }]
}

// 获取节点图标
const getNodeIcon = (type) => {
  const iconMap = {
    community: 'OfficeBuilding',
    building: 'ep-building',
    unit: 'ep-home-filled',
    room: 'ep-house'
  }
  return iconMap[type] || 'ep-folder'
}

// 获取节点图标样式
const getNodeIconClass = (type) => {
  return `icon-${type}`
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

// 获取类型选项
const getTypeOptions = () => {
  if (!parentData.value) {
    return [{ label: '小区', value: 'community' }]
  }
  
  const typeMap = {
    community: [{ label: '栋', value: 'building' }],
    building: [{ label: '单元', value: 'unit' }],
    unit: [{ label: '房间', value: 'room' }]
  }
  
  return typeMap[parentData.value.type] || []
}

// 过滤节点
const filterNode = (value, data) => {
  if (!value) return true
  return data.name.includes(value)
}

// 加载树形数据
const loadTreeData = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm
    }
    
    // 过滤空值
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    
    const response = await addressAPI.getTree(params)
    
    if (response.code === 200) {
      treeData.value = response.data
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
  if (searchForm.search) {
    treeRef.value.filter(searchForm.search)
  } else {
    loadTreeData()
  }
}

// 重置
const handleReset = () => {
  searchForm.search = ''
  treeRef.value.filter('')
  loadTreeData()
}

// 展开全部
const handleExpandAll = () => {
  const nodes = treeRef.value.store.nodesMap
  for (let node in nodes) {
    nodes[node].expanded = true
  }
}

// 收起全部
const handleCollapseAll = () => {
  const nodes = treeRef.value.store.nodesMap
  for (let node in nodes) {
    nodes[node].expanded = false
  }
}

// 添加子级
const handleAddChild = (data) => {
  isEdit.value = false
  parentData.value = data
  dialogTitle.value = `为 "${data.name}" 添加子级`
  resetForm()
  form.parentId = data.id
  
  // 根据父级类型设置子级类型
  const typeMap = {
    community: 'building',
    building: 'unit',
    unit: 'room'
  }
  form.type = typeMap[data.type] || ''
  
  dialogVisible.value = true
}

// 编辑
const handleEdit = (data) => {
  isEdit.value = true
  parentData.value = null
  dialogTitle.value = '编辑住址'
  Object.assign(form, data)
  dialogVisible.value = true
}

// 查看住户
const handleViewResidents = (data) => {
  router.push({
    path: '/residents/list',
    query: { addressId: data.id }
  })
}

// 查看费用
const handleViewExpenses = (data) => {
  router.push({
    path: '/expenses/list',
    query: { addressId: data.id }
  })
}

// 删除
const handleDelete = async (data) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除住址 "${data.name}" 吗？删除后其子级住址也将被删除。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await addressAPI.delete(data.id)
    
    if (response.code === 200) {
      ElMessage.success('删除成功')
      loadTreeData()
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
      loadTreeData()
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
    isActive: true,
    parentId: null
  })
  
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 对话框关闭
const handleDialogClose = () => {
  resetForm()
  parentData.value = null
}

// 页面加载时获取数据
onMounted(() => {
  loadTreeData()
})
</script>

<style scoped>
.address-tree-page {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.tree-card {
  margin-bottom: 20px;
}

.tree-container {
  min-height: 400px;
}

.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 0;
}

.node-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.node-icon {
  margin-right: 8px;
  font-size: 16px;
}

.node-icon.icon-community {
  color: #409eff;
}

.node-icon.icon-building {
  color: #67c23a;
}

.node-icon.icon-unit {
  color: #e6a23c;
}

.node-icon.icon-room {
  color: #f56c6c;
}

.node-label {
  font-size: 14px;
  margin-right: 8px;
}

.node-type {
  margin-right: 8px;
}

.node-status {
  margin-right: 8px;
}

.node-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s;
}

.tree-node:hover .node-actions {
  opacity: 1;
}

.dialog-footer {
  text-align: right;
}

:deep(.el-tree-node__content) {
  height: auto;
  padding: 4px 0;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}
</style>