import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Cấu hình S3 Client (Lấy thông tin từ process.env)
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

export const s3UploadBuffer = async (fileBuffer, folderName, mimeType) => {
  // 1. Tạo Key (đường dẫn/tên file duy nhất trong S3)
  // Tên file: <folderName>/<timestamp>_<tên_file_ngẫu_nhiên>
  const originalFileName =
    Date.now().toString(36) + Math.random().toString(36).substring(2, 5) // Tạo tên file đơn giản
  const key = `${folderName}/${Date.now()}_${originalFileName}`

  const uploadParams = {
    Bucket: 'trello-web-images-nguyen1976',
    Key: key, // Đường dẫn file trong S3
    Body: fileBuffer, // Dữ liệu Buffer
    ContentType: mimeType, // Loại file
    ACL: 'public-read' // Đảm bảo file có thể đọc công khai
  }

  const command = new PutObjectCommand(uploadParams)

  try {
    // 2. Gửi lệnh Upload lên S3
    const response = await s3Client.send(command)

    // 3. Tạo URL công khai sau khi upload thành công
    const publicUrl = `https://trello-web-images-nguyen1976.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`

    // Trả về URL và Key để lưu vào database
    return {
      url: publicUrl,
      key: key
      // Thêm các thông tin khác từ S3 response nếu cần
    }
  } catch (err) {
    console.error('S3 Upload Error:', err)
    throw new Error('S3 Upload Failed: ' + err.message)
  }
}
