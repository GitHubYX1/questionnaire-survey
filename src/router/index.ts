import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/home',
      component: () => import('@/views/home/index.vue'),
      children: [
        {
          name: '首页',
          path: 'home',
          component: () => import('@/views/home/pages/home.vue')
        },
        {
          name: '我的项目',
          path: 'project',
          component: () => import('@/views/home/pages/project.vue')
        },
      ]
    },
    {
      path: '/investigation',
      name: '创建问卷',
      component: () => import('@/views/investigation/index.vue'),
    },
    {
      path: '/question',
      name: '问卷测评',
      component: () => import('@/views/question/index.vue'),
      meta: {
        title: '问卷测评',
      },
    },
    {
      path: '/question/success',
      name: '提交成功',
      component: () => import('@/views/question/success.vue'),
      meta: {
        title: '提交成功',
      },
    },
    {
      path: '/preview',
      name: '问卷预览',
      component: () => import('@/views/question/preview.vue'),
      meta: {
        title: '问卷测评',
      },
    },
  ]
})

export default router
