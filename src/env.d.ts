/// <reference types="vite/client" />

// 声明Vite环境变量类型
interface ImportMetaEnv {
  readonly VITE_APP_BASE_API: string
  // 添加其他环境变量声明
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
