package service

import (
	"blog-server/internal/models"
	"blog-server/internal/oss"
	"fmt"
	"mime/multipart"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UploadPhotoService 上传照片服务结构体
// 用于处理照片上传的请求和业务逻辑
type UploadPhotoService struct {
	Photos []*multipart.FileHeader `form:"photos" json:"photos" binding:"required"` // 照片文件列表，必填
}

// UploadPhoto 上传照片
// 将照片文件上传到对象存储服务，并在数据库中创建记录
// 返回成功数量、失败数量和可能的错误
func (service *UploadPhotoService) UploadPhoto() (int, int, error) {
	bucketName := "moity-blog" // 对象存储桶名称

	// 初始化计数器
	success, fail := 0, 0
	finalError := error(nil)

	// 遍历所有照片文件
	for _, file := range service.Photos {
		contentType := "application/octet-stream" // 默认内容类型
		// 生成唯一的对象名称，使用UUID和原始文件名
		objectName := fmt.Sprintf("%s-%s", uuid.New().String(), file.Filename)
		
		// 使用数据库事务确保数据一致性
		models.DB.Transaction(func(tx *gorm.DB) error {
			// 打开上传的文件
			src, err := file.Open()
			if err != nil {
				finalError = err
				fail++
				return err
			}
			defer src.Close()
			
			// 上传文件到对象存储服务
			if err := oss.UploadFileMinio(bucketName, objectName, src, contentType); err != nil {
				finalError = err
				fail++
				return err
			}
			
			// 创建照片记录并保存到数据库
			photo := models.DailyPhotograph{
				ImageUrl: oss.GeneratePublicURLMinio(bucketName, objectName), // 生成公开访问URL
				Title:    file.Filename, // 使用原始文件名作为标题
			}
			if err := tx.Create(&photo).Error; err != nil {
				finalError = err
				fail++
				return err
			}
			
			success++
			return nil
		})
	}
	return success, fail, finalError
}

// ListPhotoService 照片列表服务结构体
// 用于处理获取照片列表的请求和业务逻辑
type ListPhotoService struct {
}

// ListPhoto 获取照片列表
// 从数据库中查询所有照片的URL和标题
// 返回照片列表和可能的错误
func (service *ListPhotoService) ListPhoto() ([]*models.DailyPhotograph, error) {
	var photos []*models.DailyPhotograph
	// 只查询image_url和title字段，提高查询效率
	if err := models.DB.Select("image_url", "title").Find(&photos).Error; err != nil {
		return nil, err
	}
	return photos, nil
}
