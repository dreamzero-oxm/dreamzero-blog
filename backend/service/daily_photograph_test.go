package service

import (
	"bytes"
	"mime/multipart"
	"os"
	"testing"
	"time"

	"blog-server/internal/models"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

// 测试数据准备
type TestData struct {
	User       *models.User
	Photo      *models.DailyPhotograph
	OtherUser  *models.User
	OtherPhoto *models.DailyPhotograph
}

// 准备测试数据
func setupTestData(t *testing.T) *TestData {
	// 创建测试用户
	user := &models.User{
		UserName: "testuser",
		Email:    "test@example.com",
		Password: "password123",
		Role:     "user",
		Status:   "active",
	}
	user.GenerateEncryptedPassword()
	if err := models.DB.Create(user).Error; err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}

	// 创建另一个测试用户
	otherUser := &models.User{
		UserName: "otheruser",
		Email:    "other@example.com",
		Password: "password123",
		Role:     "user",
		Status:   "active",
	}
	otherUser.GenerateEncryptedPassword()
	if err := models.DB.Create(otherUser).Error; err != nil {
		t.Fatalf("Failed to create other test user: %v", err)
	}

	// 创建测试照片
	photo := &models.DailyPhotograph{
		UserID:      user.ID,
		Title:       "Test Photo",
		Description: "A test photo",
		Tags:        "test,photo",
		TakenAt:     time.Now(),
		Location:    "Test Location",
		Camera:      "Test Camera",
		Lens:        "Test Lens",
		ISO:         100,
		Aperture:    2.8,
		ShutterSpeed: 0.008,
		FocalLength: 50,
		IsPublic:    true,
		Likes:       0,
		Views:       0,
	}
	if err := models.DB.Create(photo).Error; err != nil {
		t.Fatalf("Failed to create test photo: %v", err)
	}

	// 创建另一个测试照片
	otherPhoto := &models.DailyPhotograph{
		UserID:      otherUser.ID,
		Title:       "Other Test Photo",
		Description: "Another test photo",
		Tags:        "other,photo",
		TakenAt:     time.Now(),
		Location:    "Other Location",
		Camera:      "Other Camera",
		Lens:        "Other Lens",
		ISO:         200,
		Aperture:    4.0,
		ShutterSpeed: 0.004,
		FocalLength: 85,
		IsPublic:    true,
		Likes:       0,
		Views:       0,
	}
	if err := models.DB.Create(otherPhoto).Error; err != nil {
		t.Fatalf("Failed to create other test photo: %v", err)
	}

	return &TestData{
		User:       user,
		Photo:      photo,
		OtherUser:  otherUser,
		OtherPhoto: otherPhoto,
	}
}

// 清理测试数据
func cleanupTestData(t *testing.T, data *TestData) {
	// 删除测试照片
	if data.Photo != nil {
		if err := models.DB.Unscoped().Delete(data.Photo).Error; err != nil {
			t.Logf("Failed to delete test photo: %v", err)
		}
	}
	if data.OtherPhoto != nil {
		if err := models.DB.Unscoped().Delete(data.OtherPhoto).Error; err != nil {
			t.Logf("Failed to delete other test photo: %v", err)
		}
	}

	// 删除测试用户
	if data.User != nil {
		if err := models.DB.Unscoped().Delete(data.User).Error; err != nil {
			t.Logf("Failed to delete test user: %v", err)
		}
	}
	if data.OtherUser != nil {
		if err := models.DB.Unscoped().Delete(data.OtherUser).Error; err != nil {
			t.Logf("Failed to delete other test user: %v", err)
		}
	}
}

// 创建一个虚拟的multipart文件
func createMultipartFile(t *testing.T, filename string) (multipart.File, *multipart.FileHeader) {
	content := []byte("fake image content")
	buffer := bytes.NewBuffer(content)
	file := &testFile{bytes.NewReader(content), buffer.Len()}
	header := &multipart.FileHeader{
		Filename: filename,
		Size:     int64(len(content)),
	}
	return file, header
}

// 实现multipart.File接口的测试文件
type testFile struct {
	*bytes.Reader
	size int
}

func (f *testFile) Close() error {
	return nil
}

func (f *testFile) Readdir(count int) ([]os.FileInfo, error) {
	return nil, nil
}

func (f *testFile) Stat() (os.FileInfo, error) {
	return nil, nil
}

// 测试创建日常照片服务
func TestCreateDailyPhotographService(t *testing.T) {
	// 准备测试数据
	data := setupTestData(t)
	defer cleanupTestData(t, data)

	// 创建虚拟文件
	_, header := createMultipartFile(t, "test.jpg")

	// 测试创建日常照片服务
	// ctx := context.Background()
	service := CreateDailyPhotographService{
		UserID:       data.User.ID,
		Title:        "Test Upload Photo",
		Description:  "A test upload photo",
		Tags:         "test,upload",
		Location:     "Test Upload Location",
		Camera:       "Test Upload Camera",
		Lens:         "Test Upload Lens",
		ISO:          400,
		Aperture:     5.6,
		ShutterSpeed: 0.002,
		FocalLength:  100,
		IsPublic:     true,
		Photos:       []*multipart.FileHeader{header},
	}
	success, fail, err := service.CreateDailyPhotograph()

	// 验证结果
	assert.NoError(t, err)
	assert.NotNil(t, success)
	assert.Equal(t, 1, success)
	assert.Equal(t, 0, fail)

	// 验证数据库中的数据
	var uploadedPhoto models.DailyPhotograph
	if err := models.DB.Where("user_id = ? AND title = ?", data.User.ID.String(), "Test Upload Photo").First(&uploadedPhoto).Error; err != nil {
		t.Fatalf("Failed to get uploaded photo: %v", err)
	}

	assert.Equal(t, data.User.ID, uploadedPhoto.UserID)
	assert.Equal(t, "Test Upload Photo", uploadedPhoto.Title)
	assert.Equal(t, "A test upload photo", uploadedPhoto.Description)
	assert.Equal(t, "test,upload", uploadedPhoto.Tags)
	assert.Equal(t, "Test Upload Location", uploadedPhoto.Location)
	assert.Equal(t, "Test Upload Camera", uploadedPhoto.Camera)
	assert.Equal(t, "Test Upload Lens", uploadedPhoto.Lens)
	assert.Equal(t, 400, uploadedPhoto.ISO)
	assert.Equal(t, 5.6, uploadedPhoto.Aperture)
	assert.Equal(t, 0.002, uploadedPhoto.ShutterSpeed)
	assert.Equal(t, 100, uploadedPhoto.FocalLength)
	assert.Equal(t, true, uploadedPhoto.IsPublic)
	assert.Equal(t, 0, uploadedPhoto.Likes)
	assert.Equal(t, 0, uploadedPhoto.Views)

	// 清理上传的照片
	models.DB.Unscoped().Delete(&uploadedPhoto)
}

// 测试获取用户日常照片服务
func TestGetUserDailyPhotographsService(t *testing.T) {
	// 准备测试数据
	data := setupTestData(t)
	defer cleanupTestData(t, data)

	// 测试获取用户日常照片服务
	// ctx := context.Background()
	service := GetUserDailyPhotographsService{
		UserID: data.User.ID.String(),
		Page:   1,
		Size:   10,
	}
	photos, total, err := service.GetUserDailyPhotographs()

	// 验证结果
	assert.NoError(t, err)
	assert.Greater(t, total, int64(0))
	assert.Greater(t, len(photos), 0)

	// 验证返回的照片数据
	for _, photo := range photos {
		assert.Equal(t, data.User.ID, photo.UserID)
	}
}

// 测试按日期范围获取日常照片服务
func TestGetDailyPhotographsByDateRangeService(t *testing.T) {
	// 准备测试数据
	data := setupTestData(t)
	defer cleanupTestData(t, data)

	// 设置日期范围（包含测试照片的日期）
	startDate := data.Photo.TakenAt.Format("2006-01-02")
	endDate := data.Photo.TakenAt.AddDate(0, 0, 1).Format("2006-01-02")

	// 测试按日期范围获取日常照片服务
	// ctx := context.Background()
	service := GetDailyPhotographsByDateRangeService{
		UserID:    data.User.ID.String(),
		StartDate: startDate,
		EndDate:   endDate,
		Page:      1,
		Size:      10,
	}
	photos, total, err := service.GetDailyPhotographsByDateRange()

	// 验证结果
	assert.NoError(t, err)
	assert.Greater(t, total, int64(0))
	assert.Greater(t, len(photos), 0)

	// 验证返回的照片数据
	for _, photo := range photos {
		assert.Equal(t, data.User.ID, photo.UserID)
		assert.True(t, photo.TakenAt.After(data.Photo.TakenAt.AddDate(0, 0, -1)))
		assert.True(t, photo.TakenAt.Before(data.Photo.TakenAt.AddDate(0, 0, 2)))
	}
}

// 测试获取单张日常照片服务
func TestGetDailyPhotographService(t *testing.T) {
	// 准备测试数据
	data := setupTestData(t)
	defer cleanupTestData(t, data)

	// 测试获取单张日常照片服务
	// ctx := context.Background()
	service := GetDailyPhotographService{
		PhotoID: data.Photo.ID.String(),
	}
	photo, err := service.GetDailyPhotograph()

	// 验证结果
	assert.NoError(t, err)
	assert.NotNil(t, photo)
	assert.Equal(t, data.Photo.ID, photo.ID)
	assert.Equal(t, data.User.ID, photo.UserID)
	assert.Equal(t, data.Photo.Title, photo.Title)
	assert.Equal(t, data.Photo.Description, photo.Description)
	assert.Equal(t, data.Photo.Tags, photo.Tags)
	assert.Equal(t, data.Photo.Location, photo.Location)
	assert.Equal(t, data.Photo.Camera, photo.Camera)
	assert.Equal(t, data.Photo.Lens, photo.Lens)
	assert.Equal(t, data.Photo.ISO, photo.ISO)
	assert.Equal(t, data.Photo.Aperture, photo.Aperture)
	assert.Equal(t, data.Photo.ShutterSpeed, photo.ShutterSpeed)
	assert.Equal(t, data.Photo.FocalLength, photo.FocalLength)
	assert.Equal(t, data.Photo.IsPublic, photo.IsPublic)
	assert.Equal(t, data.Photo.Likes, photo.Likes)
	// Views应该增加1
	assert.Equal(t, data.Photo.Views+1, photo.Views)

	// 验证数据库中的浏览次数已增加
	var updatedPhoto models.DailyPhotograph
	if err := models.DB.First(&updatedPhoto, "id = ?", data.Photo.ID.String()).Error; err != nil {
		t.Fatalf("Failed to get updated photo: %v", err)
	}
	assert.Equal(t, data.Photo.Views+1, updatedPhoto.Views)
}

// 测试更新日常照片服务
func TestUpdateDailyPhotographService(t *testing.T) {
	// 准备测试数据
	data := setupTestData(t)
	defer cleanupTestData(t, data)

	// 测试更新日常照片服务
	// ctx := context.Background()
	service := UpdateDailyPhotographService{
		PhotoID:      data.Photo.ID.String(),
		UserID:       data.User.ID,
		Title:        "Updated Title",
		Description:  "Updated Description",
		Tags:         "updated,photo",
		Location:     "Updated Location",
		Camera:       "Updated Camera",
		Lens:         "Updated Lens",
		ISO:          200,
		Aperture:     4.0,
		ShutterSpeed: 0.004,
		FocalLength:  85,
		IsPublic:     false,
	}
	err := service.UpdateDailyPhotograph()

	// 验证结果
	assert.NoError(t, err)

	// 验证数据库中的数据已更新
	var updatedPhoto models.DailyPhotograph
	if err := models.DB.First(&updatedPhoto, "id = ?", data.Photo.ID.String()).Error; err != nil {
		t.Fatalf("Failed to get updated photo: %v", err)
	}

	assert.Equal(t, "Updated Title", updatedPhoto.Title)
	assert.Equal(t, "Updated Description", updatedPhoto.Description)
	assert.Equal(t, "updated,photo", updatedPhoto.Tags)
	assert.Equal(t, "Updated Location", updatedPhoto.Location)
	assert.Equal(t, "Updated Camera", updatedPhoto.Camera)
	assert.Equal(t, "Updated Lens", updatedPhoto.Lens)
	assert.Equal(t, 200, updatedPhoto.ISO)
	assert.Equal(t, 4.0, updatedPhoto.Aperture)
	assert.Equal(t, 0.004, updatedPhoto.ShutterSpeed)
	assert.Equal(t, 85, updatedPhoto.FocalLength)
	assert.Equal(t, false, updatedPhoto.IsPublic)
}

// 测试更新日常照片服务 - 权限验证
func TestUpdateDailyPhotographServicePermission(t *testing.T) {
	// 准备测试数据
	data := setupTestData(t)
	defer cleanupTestData(t, data)

	// 测试使用其他用户ID更新照片（应该失败）
	// ctx := context.Background()
	service := UpdateDailyPhotographService{
		PhotoID:      data.Photo.ID.String(),
		UserID:       data.OtherUser.ID,
		Title:        "Updated Title",
		Description:  "Updated Description",
		Tags:         "updated,photo",
		Location:     "Updated Location",
		Camera:       "Updated Camera",
		Lens:         "Updated Lens",
		ISO:          200,
		Aperture:     4.0,
		ShutterSpeed: 0.004,
		FocalLength:  85,
		IsPublic:     false,
	}
	err := service.UpdateDailyPhotograph()

	// 验证结果
	assert.Error(t, err)

	// 验证数据库中的数据未更新
	var unchangedPhoto models.DailyPhotograph
	if err := models.DB.First(&unchangedPhoto, "id = ?", data.Photo.ID.String()).Error; err != nil {
		t.Fatalf("Failed to get unchanged photo: %v", err)
	}

	assert.Equal(t, data.Photo.Title, unchangedPhoto.Title)
}

// 测试删除日常照片服务
func TestDeleteDailyPhotographService(t *testing.T) {
	// 准备测试数据
	data := setupTestData(t)
	defer cleanupTestData(t, data)

	// 测试删除日常照片服务
	// ctx := context.Background()
	service := DeleteDailyPhotographService{
		PhotoID: data.Photo.ID.String(),
		UserID:  data.User.ID,
	}
	err := service.DeleteDailyPhotograph()

	// 验证结果
	assert.NoError(t, err)

	// 验证数据库中的数据已删除
	var deletedPhoto models.DailyPhotograph
	err = models.DB.First(&deletedPhoto, "id = ?", data.Photo.ID.String()).Error
	assert.Error(t, err)
	assert.Equal(t, gorm.ErrRecordNotFound, err)
}

// 测试删除日常照片服务 - 权限验证
func TestDeleteDailyPhotographServicePermission(t *testing.T) {
	// 准备测试数据
	data := setupTestData(t)
	defer cleanupTestData(t, data)

	// 测试使用其他用户ID删除照片（应该失败）
	// ctx := context.Background()
	service := DeleteDailyPhotographService{
		PhotoID: data.Photo.ID.String(),
		UserID:  data.OtherUser.ID,
	}
	err := service.DeleteDailyPhotograph()

	// 验证结果
	assert.Error(t, err)

	// 验证数据库中的数据未删除
	var unchangedPhoto models.DailyPhotograph
	err = models.DB.First(&unchangedPhoto, "id = ?", data.Photo.ID.String()).Error
	assert.NoError(t, err)
	assert.Equal(t, data.Photo.ID, unchangedPhoto.ID)
}

// 测试点赞日常照片服务
func TestLikeDailyPhotographService(t *testing.T) {
	// 准备测试数据
	data := setupTestData(t)
	defer cleanupTestData(t, data)

	// 测试点赞日常照片服务
	// ctx := context.Background()
	service := LikeDailyPhotographService{
		PhotoID: data.Photo.ID.String(),
	}
	err := service.LikeDailyPhotograph()

	// 验证结果
	assert.NoError(t, err)

	// 验证数据库中的点赞数已增加
	var likedPhoto models.DailyPhotograph
	if err := models.DB.First(&likedPhoto, "id = ?", data.Photo.ID.String()).Error; err != nil {
		t.Fatalf("Failed to get liked photo: %v", err)
	}

	assert.Equal(t, data.Photo.Likes+1, likedPhoto.Likes)
}

// 测试用户删除时关联照片的级联删除
func TestUserDeletionCascade(t *testing.T) {
	// 准备测试数据
	data := setupTestData(t)
	defer cleanupTestData(t, data)

	// 记录照片数量
	var photoCount int64
	models.DB.Model(&models.DailyPhotograph{}).Where("user_id = ?", data.User.ID.String()).Count(&photoCount)
	assert.Greater(t, photoCount, int64(0))

	// 删除用户
	if err := models.DB.Unscoped().Delete(data.User).Error; err != nil {
		t.Fatalf("Failed to delete user: %v", err)
	}

	// 验证关联的照片已被级联删除
	var remainingPhotoCount int64
	models.DB.Model(&models.DailyPhotograph{}).Where("user_id = ?", data.User.ID.String()).Count(&remainingPhotoCount)
	assert.Equal(t, int64(0), remainingPhotoCount)
}

// 测试关联关系的正确性
func TestUserPhotoRelationship(t *testing.T) {
	// 准备测试数据
	data := setupTestData(t)
	defer cleanupTestData(t, data)

	// 查询用户及其关联的照片
	var user models.User
	if err := models.DB.Preload("DailyPhotographs").First(&user, "id = ?", data.User.ID.String()).Error; err != nil {
		t.Fatalf("Failed to get user with photos: %v", err)
	}

	// 验证关联关系
	assert.Equal(t, 1, len(user.DailyPhotographs))
	assert.Equal(t, data.Photo.ID, user.DailyPhotographs[0].ID)
	assert.Equal(t, data.Photo.Title, user.DailyPhotographs[0].Title)

	// 查询照片及其关联的用户
	var photo models.DailyPhotograph
	if err := models.DB.First(&photo, "id = ?", data.Photo.ID.String()).Error; err != nil {
		t.Fatalf("Failed to get photo: %v", err)
	}

	// 验证关联关系
	assert.Equal(t, data.User.ID, photo.UserID)
}