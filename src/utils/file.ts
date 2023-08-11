import fs from 'fs'
import path from 'path'

export const initFolders = () => {
  const uploadsFolderPath = path.resolve('uploads/images')
  if (!fs.existsSync(uploadsFolderPath)) {
    fs.mkdirSync(uploadsFolderPath, {
      recursive: true // Tạo folder nested
    })
  }
}
