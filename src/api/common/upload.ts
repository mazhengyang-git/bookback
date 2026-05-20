import request from '@/utils/request'

interface UploadResponse {
  code: number
  msg: string
  data: { url: string }
}

export function uploadImageApi(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<UploadResponse>('/api/user/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
