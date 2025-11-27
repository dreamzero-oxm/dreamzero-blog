package service

import (
	"blog-server/internal/code"
	"blog-server/internal/logger"
	"blog-server/internal/models"
	"blog-server/internal/oss"
	"mime/multipart"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CreateDailyPhotographService 创建日常照片服务结构体
// 用于处理创建日常照片的请求和业务逻辑
type CreateDailyPhotographService struct {
	UserID      uuid.UUID             									 					  // 用户ID，必填
	Photos      []*multipart.FileHeader `form:"photos" json:"photos"`   					  // 照片文件列表，必填
	Title       string                	`form:"title" json:"title"`                           // 照片标题
	Description string                	`form:"description" json:"description"`               // 照片描述
	Tags        string                	`form:"tags" json:"tags"`                             // 照片标签，多个标签用逗号分隔
	TakenAt     string                	`form:"taken_at" json:"taken_at"`                     // 拍摄时间
	Location    string                	`form:"location" json:"location"`                     // 拍摄地点
	Camera      string                	`form:"camera" json:"camera"`                         // 相机型号
	Lens        string                	`form:"lens" json:"lens"`                             // 镜头型号
	ISO         float64               	`form:"iso" json:"iso"`                               // ISO值
	Aperture    float64               	`form:"aperture" json:"aperture"`                     // 光圈值
	ShutterSpeed float64               	`form:"shutter_speed" json:"shutter_speed"`           // 快门速度
	FocalLength  float64               	`form:"focal_length" json:"focal_length"`             // 焦距
	IsPublic     bool                  	`form:"is_public" json:"is_public"`                   // 是否公开
}

// CreateDailyPhotograph 创建日常照片
// 将照片文件上传到对象存储服务，并在数据库中创建记录
// 返回成功数量、失败数量和可能的错误
func (service *CreateDailyPhotographService) CreateDailyPhotograph() (int, int, error) {
	bucketName := "moity-blog" // 对象存储桶名称

	// 初始化计数器
	success, fail := 0, 0
	finalError := error(nil)

	// 验证用户是否存在
	var user models.User
	if err := models.DB.First(&user, "id = ?", service.UserID).Error; err != nil {
		return 0, 0, code.ErrDailyPhotographUserNotFound
	}

	// 解析拍摄时间TakenAt是否是有效时间格式
	parsedTime, err := time.Parse("2006-01-02", service.TakenAt)
	if err != nil {
		return 0, 0, code.ErrDailyPhotographDateParse
	}
	

	// 遍历所有照片文件
	for _, file := range service.Photos {
		contentType := "application/octet-stream" // 默认内容类型
		// 生成唯一的对象名称，使用UUID和原始文件名
		objectName := uuid.New().String() + "-" + file.Filename
		
		// 使用数据库事务确保数据一致性
		if err := models.DB.Transaction(func(tx *gorm.DB) error {
			// 打开上传的文件
			src, err := file.Open()
			if err != nil {
				finalError = code.ErrDailyPhotographFileOpen
				fail++
				return code.ErrDailyPhotographFileOpen
			}
			defer func() {
				if closeErr := src.Close(); closeErr != nil {
					logger.Logger.Errorf("close file failed: %v", closeErr)
				}
			}()
			
			// 上传文件到对象存储服务
			if err := oss.UploadFileMinio(bucketName, objectName, src, contentType); err != nil {
				finalError = code.ErrDailyPhotographFileUpload
				fail++
				return code.ErrDailyPhotographFileUpload
			}
			
			// 创建照片记录并保存到数据库
			photo := models.DailyPhotograph{
				UserID:       service.UserID,
				ImageUrl:     oss.GeneratePublicURLMinio(bucketName, objectName), // 生成公开访问URL
				Title:        service.Title,
				Description:  service.Description,
				Tags:         service.Tags,
				TakenAt:      parsedTime,
				Location:     service.Location,
				Camera:       service.Camera,
				Lens:         service.Lens,
				ISO:          service.ISO,
				Aperture:     service.Aperture,
				ShutterSpeed: service.ShutterSpeed,
				FocalLength:  service.FocalLength,
				IsPublic:     service.IsPublic,
				Likes:        0,
				Views:        0,
			}
			
			// 如果没有提供标题，使用原始文件名作为标题
			if photo.Title == "" {
				photo.Title = file.Filename
			}
			
			if err := tx.Create(&photo).Error; err != nil {
				finalError = code.ErrDailyPhotographCreate
				fail++
				return code.ErrDailyPhotographCreate
			}
			
			success++
			return nil
		}); err != nil {
			finalError = err
			fail++
		}
	}
	return success, fail, finalError
}

// GetUserDailyPhotographsService 获取用户日常照片服务结构体
// 用于处理获取用户日常照片列表的请求和业务逻辑
type GetUserDailyPhotographsService struct {
	UserID string 	 `uri:"user_id" binding:"required"` 	 			 // 用户ID，必填
	Page   int       `query:"page" json:"page"`                           // 页码，默认为1
	Size   int       `query:"size" json:"size"`                           // 每页数量，默认为10
}

// GetUserDailyPhotographs 获取用户日常照片列表
// 从数据库中查询指定用户的日常照片
// 返回照片列表和可能的错误
func (service *GetUserDailyPhotographsService) GetUserDailyPhotographs() ([]*models.DailyPhotograph, int64, error) {
	// 验证用户是否存在
	var user models.User
	if err := models.DB.First(&user, "id = ?", service.UserID).Error; err != nil {
		return nil, 0, code.ErrDailyPhotographUserNotFound
	}

	// 设置默认分页参数
	if service.Page <= 0 {
		service.Page = 1
	}
	if service.Size <= 0 {
		service.Size = 10
	}

	// 计算偏移量
	offset := (service.Page - 1) * service.Size

	// 查询总数
	var total int64
	if err := models.DB.Model(&models.DailyPhotograph{}).Where("user_id = ?", service.UserID).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 查询照片列表
	var photos []*models.DailyPhotograph
	if err := models.DB.Where("user_id = ?", service.UserID).
		Order("created_at DESC").
		Offset(offset).Limit(service.Size).
		Find(&photos).Error; err != nil {
		return nil, 0, err
	}

	return photos, total, nil
}

// GetDailyPhotographsByDateRangeService 按日期范围获取日常照片服务结构体
// 用于处理按日期范围获取日常照片列表的请求和业务逻辑
type GetDailyPhotographsByDateRangeService struct {
	UserID string 		`uri:"user_id" binding:"required"` 			// 用户ID，必填
	StartDate string    `query:"start_date" json:"start_date" binding:"required"` 	// 开始日期，格式：2006-01-02
	EndDate string    	`query:"end_date" json:"end_date" binding:"required"`     		// 结束日期，格式：2006-01-02
	Page   int       	`query:"page" json:"page"`                          			// 页码，默认为1
	Size   int       	`query:"size" json:"size"`                          			// 每页数量，默认为10
}

// GetDailyPhotographsByDateRange 按日期范围获取日常照片列表
// 从数据库中查询指定用户在指定日期范围内的日常照片
// 返回照片列表和可能的错误
func (service *GetDailyPhotographsByDateRangeService) GetDailyPhotographsByDateRange() ([]*models.DailyPhotograph, int64, error) {
	// 验证用户是否存在
	var user models.User
	if err := models.DB.First(&user, "id = ?", service.UserID).Error; err != nil {
		return nil, 0, code.ErrDailyPhotographUserNotFound
	}

	// 解析日期
	startDate, err := time.Parse("2006-01-02", service.StartDate)
	if err != nil {
		return nil, 0, code.ErrDailyPhotographDateParse
	}

	endDate, err := time.Parse("2006-01-02", service.EndDate)
	if err != nil {
		return nil, 0, code.ErrDailyPhotographDateParse
	}

	// 设置默认分页参数
	if service.Page <= 0 {
		service.Page = 1
	}
	if service.Size <= 0 {
		service.Size = 10
	}

	// 计算偏移量
	offset := (service.Page - 1) * service.Size

	// 查询总数
	var total int64
	if err := models.DB.Model(&models.DailyPhotograph{}).
		Where("user_id = ? AND created_at >= ? AND created_at <= ?", 
			service.UserID, startDate, endDate).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 查询照片列表
	var photos []*models.DailyPhotograph
	if err := models.DB.Where("user_id = ? AND created_at >= ? AND created_at <= ?", 
		service.UserID, startDate, endDate).
		Order("created_at DESC").
		Offset(offset).Limit(service.Size).
		Find(&photos).Error; err != nil {
		return nil, 0, err
	}

	return photos, total, nil
}

// GetDailyPhotographService 获取单张日常照片服务结构体
// 用于处理获取单张日常照片详情的请求和业务逻辑
type GetDailyPhotographService struct {
	PhotoID string `uri:"photo_id" binding:"required"` // 照片ID，必填
}

// GetDailyPhotograph 获取单张日常照片详情
// 从数据库中查询指定ID的日常照片
// 返回照片详情和可能的错误
func (service *GetDailyPhotographService) GetDailyPhotograph() (*models.DailyPhotograph, error) {
	// 查询照片是否存在
	var photo models.DailyPhotograph
	if err := models.DB.First(&photo, "id = ?", service.PhotoID).Error; err != nil {
		return nil, code.ErrDailyPhotographNotFound
	}

	// 增加浏览次数
	if err := models.DB.Model(&photo).UpdateColumn("views", gorm.Expr("views + ?", 1)).Error; err != nil {
		logger.Logger.Errorf("增加浏览次数失败: %v", err)
	}

	return &photo, nil
}

// UpdateDailyPhotographService 更新日常照片服务结构体
// 用于处理更新日常照片的请求和业务逻辑
type UpdateDailyPhotographService struct {
	PhotoID     string			`form:"photo_id" json:"photo_id" binding:"required"`    // 照片ID，必填
	UserID      uuid.UUID 										                        // 用户ID，必填，用于权限验证
	Title       string    		`form:"title" json:"title"`                             // 照片标题
	Description string    		`form:"description" json:"description"`                 // 照片描述
	Tags        string    		`form:"tags" json:"tags"`                               // 照片标签，多个标签用逗号分隔
	TakenAt     string    		`form:"taken_at" json:"taken_at"`                       // 拍摄时间
	Location    string    		`form:"location" json:"location"`                       // 拍摄地点
	Camera      string    		`form:"camera" json:"camera"`                           // 相机型号
	Lens        string    		`form:"lens" json:"lens"`                               // 镜头型号
	ISO         float64       	`form:"iso" json:"iso"`                                 // ISO值
	Aperture    float64       	`form:"aperture" json:"aperture"`                       // 光圈值
	ShutterSpeed float64       	`form:"shutter_speed" json:"shutter_speed"`           	// 快门速度
	FocalLength float64       	`form:"focal_length" json:"focal_length"`               // 焦距
	IsPublic    bool       		`form:"is_public" json:"is_public"`                     // 是否公开
}

// UpdateDailyPhotograph 更新日常照片
// 更新指定ID的日常照片信息
// 返回可能的错误
func (service *UpdateDailyPhotographService) UpdateDailyPhotograph() error {
	// 查询照片是否存在
	var photo models.DailyPhotograph
	if err := models.DB.First(&photo, "id = ?", service.PhotoID).Error; err != nil {
		return code.ErrDailyPhotographNotFound
	}

	// 检查用户是否有权限修改这张照片
	if photo.UserID != service.UserID {
		return code.ErrDailyPhotographPermission
	}

	// 解析拍摄时间
	var takenAt time.Time
	if service.TakenAt != "" {
		if parsedTime, err := time.Parse("2006-01-02", service.TakenAt); err == nil {
			takenAt = parsedTime
		}
	}

	// 更新照片信息
	updates := make(map[string]interface{})
	if service.Title != "" {
		updates["title"] = service.Title
	}
	if service.Description != "" {
		updates["description"] = service.Description
	}
	if service.Tags != "" {
		updates["tags"] = service.Tags
	}
	if !takenAt.IsZero() {
		updates["taken_at"] = takenAt
	}
	if service.Location != "" {
		updates["location"] = service.Location
	}
	if service.Camera != "" {
		updates["camera"] = service.Camera
	}
	if service.Lens != "" {
		updates["lens"] = service.Lens
	}
	if service.ISO != 0 {
		updates["iso"] = service.ISO
	}
	if service.Aperture != 0 {
		updates["aperture"] = service.Aperture
	}
	if service.ShutterSpeed != 0 {
		updates["shutter_speed"] = service.ShutterSpeed
	}
	if service.FocalLength != 0 {
		updates["focal_length"] = service.FocalLength
	}

	// 更新公开状态
	updates["is_public"] = service.IsPublic

	// 更新照片信息
	if err := models.DB.Model(&photo).Updates(updates).Error; err != nil {
		return code.ErrDailyPhotographUpdate
	}

	return nil
}

// DeleteDailyPhotographService 删除日常照片服务结构体
// 用于处理删除日常照片的请求和业务逻辑
type DeleteDailyPhotographService struct {
	PhotoID string `uri:"photo_id" binding:"required"` 						  // 照片ID，必填
	UserID  uuid.UUID                         								  // 用户ID，必填，用于权限验证
}

// DeleteDailyPhotograph 删除日常照片
// 删除指定ID的日常照片
// 返回可能的错误
func (service *DeleteDailyPhotographService) DeleteDailyPhotograph() error {
	// 查询照片是否存在
	var photo models.DailyPhotograph
	if err := models.DB.First(&photo, "id = ?", service.PhotoID).Error; err != nil {
		return code.ErrDailyPhotographNotFound
	}

	// 检查用户是否有权限删除这张照片
	if photo.UserID != service.UserID {
		return code.ErrDailyPhotographPermission
	}

	// 删除照片
	if err := models.DB.Delete(&photo).Error; err != nil {
		return code.ErrDailyPhotographDelete
	}

	return nil
}

// LikeDailyPhotographService 点赞日常照片服务结构体
// 用于处理点赞日常照片的请求和业务逻辑
type LikeDailyPhotographService struct {
	PhotoID string `uri:"photo_id" binding:"required"` // 照片ID，必填
}

// LikeDailyPhotograph 点赞日常照片
// 为指定ID的日常照片点赞
// 返回可能的错误
func (service *LikeDailyPhotographService) LikeDailyPhotograph() error {
	// 查询照片是否存在
	var photo models.DailyPhotograph
	if err := models.DB.First(&photo, "id = ?", service.PhotoID).Error; err != nil {
		return code.ErrDailyPhotographNotFound
	}

	// 增加点赞数
	if err := models.DB.Model(&photo).UpdateColumn("likes", gorm.Expr("likes + ?", 1)).Error; err != nil {
		return code.ErrDailyPhotographLike
	}

	return nil
}