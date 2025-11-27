package v1

import (
	"bytes"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"blog-server/internal"
	"blog-server/internal/models"
	"blog-server/internal/rsa"
	"blog-server/internal/utils"
	IError "blog-server/internal/code"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

// 测试数据准备
type TestData struct {
	User         *models.User
	Token        string
	Photo        *models.DailyPhotograph
	OtherUser    *models.User
	OtherToken   string
	OtherPhoto   *models.DailyPhotograph
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

	// 生成JWT token
	claims := jwt.MapClaims{
		"sub":      user.ID.String(),
		"username": user.UserName,
		"role":     user.Role,
		"iss":      "moity",
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
		"nbf":      time.Now().Unix(),
		"type":     "access",
	}
	token, err := utils.GenerateJWT(claims, rsa.PrivateKey)
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
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

	// 生成另一个JWT token
	otherClaims := jwt.MapClaims{
		"sub":      otherUser.ID.String(),
		"username": otherUser.UserName,
		"role":     otherUser.Role,
		"iss":      "moity",
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
		"nbf":      time.Now().Unix(),
		"type":     "access",
	}
	otherToken, err := utils.GenerateJWT(otherClaims, rsa.PrivateKey)
	if err != nil {
		t.Fatalf("Failed to generate other token: %v", err)
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
		Token:      token,
		Photo:      photo,
		OtherUser:  otherUser,
		OtherToken: otherToken,
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

// 创建测试用的Gin引擎
func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()

	// 初始化路由
	controller := &DailyPhotographController{}
	controller.InitRouter(r.Group("/api/v1"))

	return r
}

// 测试获取用户日常照片列表
func TestGetUserDailyPhotographs(t *testing.T) {
	// 准备测试数据
	data := setupTestData(t)
	defer cleanupTestData(t, data)

	// 设置测试路由
	router := setupTestRouter()

	// 测试获取用户日常照片列表
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/v1/daily_photograph/user?user_id="+data.User.ID.String()+"&page=1&size=10", nil)
	router.ServeHTTP(w, req)

	// 验证响应
	assert.Equal(t, http.StatusOK, w.Code)

	var response internal.Response
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, IError.OK, response.Code)

	// 验证返回的数据
	responseData, ok := response.Data.(map[string]interface{})
	assert.True(t, ok)
	assert.NotNil(t, responseData["photos"])
	assert.NotNil(t, responseData["total"])

	// 验证照片数据
	photos := responseData["photos"].([]interface{})
	assert.Greater(t, len(photos), 0)

	// 验证关联关系
	for _, photoInterface := range photos {
		photo := photoInterface.(map[string]interface{})
		assert.Equal(t, data.User.ID.String(), photo["user_id"])
	}
}

// 测试按日期范围获取日常照片
func TestGetDailyPhotographsByDateRange(t *testing.T) {
	// 准备测试数据
	data := setupTestData(t)
	defer cleanupTestData(t, data)

	// 设置测试路由
	router := setupTestRouter()

	// 设置日期范围（包含测试照片的日期）
	startDate := data.Photo.TakenAt.Format("2006-01-02")
	endDate := data.Photo.TakenAt.AddDate(0, 0, 1).Format("2006-01-02")

	// 测试按日期范围获取日常照片
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", fmt.Sprintf("/api/v1/daily_photograph/date_range?user_id=%s&start_date=%s&end_date=%s&page=1&size=10", data.User.ID.String(), startDate, endDate), nil)
	router.ServeHTTP(w, req)

	// 验证响应
	assert.Equal(t, http.StatusOK, w.Code)

	var response internal.Response
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, IError.OK, response.Code)

	// 验证返回的数据
	responseData, ok := response.Data.(map[string]interface{})
	assert.True(t, ok)
	assert.NotNil(t, responseData["photos"])
	assert.NotNil(t, responseData["total"])

	// 验证照片数据
	photos := responseData["photos"].([]interface{})
	assert.Greater(t, len(photos), 0)

	// 验证关联关系
	for _, photoInterface := range photos {
		photo := photoInterface.(map[string]interface{})
		assert.Equal(t, data.User.ID.String(), photo["user_id"])
	}
}

// 测试获取单张日常照片详情
func TestGetDailyPhotograph(t *testing.T) {
	// 准备测试数据
	data := setupTestData(t)
	defer cleanupTestData(t, data)

	// 设置测试路由
	router := setupTestRouter()

	// 测试获取单张日常照片详情
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/v1/daily_photograph/detail?photo_id="+data.Photo.ID.String(), nil)
	router.ServeHTTP(w, req)

	// 验证响应
	assert.Equal(t, http.StatusOK, w.Code)

	var response internal.Response
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, IError.OK, response.Code)

	// 验证返回的照片数据
	photo := response.Data.(map[string]interface{})
	assert.Equal(t, data.Photo.ID.String(), photo["id"])
	assert.Equal(t, data.User.ID.String(), photo["user_id"])
	assert.Equal(t, data.Photo.Title, photo["title"])
	assert.Equal(t, data.Photo.Description, photo["description"])
	assert.Equal(t, data.Photo.Tags, photo["tags"])
	assert.Equal(t, data.Photo.Location, photo["location"])
	assert.Equal(t, data.Photo.Camera, photo["camera"])
	assert.Equal(t, data.Photo.Lens, photo["lens"])
	assert.Equal(t, data.Photo.ISO, photo["iso"])
	assert.Equal(t, data.Photo.Aperture, photo["aperture"])
	assert.Equal(t, data.Photo.ShutterSpeed, photo["shutter_speed"])
	assert.Equal(t, data.Photo.FocalLength, photo["focal_length"])
	assert.Equal(t, data.Photo.IsPublic, photo["is_public"])
	assert.Equal(t, data.Photo.Likes, photo["likes"])
	// Views应该增加1
	assert.Equal(t, data.Photo.Views+1, photo["views"])
}

// 测试更新日常照片
func TestUpdateDailyPhotograph(t *testing.T) {
	// 准备测试数据
	data := setupTestData(t)
	defer cleanupTestData(t, data)

	// 设置测试路由
	router := setupTestRouter()

	// 准备更新数据
	updateData := map[string]interface{}{
		"photo_id":    data.Photo.ID.String(),
		"user_id":     data.User.ID.String(),
		"title":       "Updated Title",
		"description": "Updated Description",
		"tags":        "updated,photo",
		"location":    "Updated Location",
		"camera":      "Updated Camera",
		"lens":        "Updated Lens",
		"iso":         200,
		"aperture":    4.0,
		"shutter_speed": 0.004,
		"focal_length": 85,
		"is_public":   false,
	}
	jsonData, _ := json.Marshal(updateData)

	// 测试更新日常照片
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("PUT", "/api/v1/daily_photograph/update", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+data.Token)
	router.ServeHTTP(w, req)

	// 验证响应
	assert.Equal(t, http.StatusOK, w.Code)

	var response internal.Response
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, IError.OK, response.Code)

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

// 测试更新日常照片 - 权限验证
func TestUpdateDailyPhotographPermission(t *testing.T) {
	// 准备测试数据
	data := setupTestData(t)
	defer cleanupTestData(t, data)

	// 设置测试路由
	router := setupTestRouter()

	// 准备更新数据
	updateData := map[string]interface{}{
		"photo_id":    data.Photo.ID.String(),
		"user_id":     data.User.ID.String(),
		"title":       "Updated Title",
	}
	jsonData, _ := json.Marshal(updateData)

	// 测试使用其他用户的token更新照片（应该失败）
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("PUT", "/api/v1/daily_photograph/update", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+data.OtherToken)
	router.ServeHTTP(w, req)

	// 验证响应
	assert.Equal(t, http.StatusOK, w.Code)

	var response internal.Response
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.NotEqual(t, IError.OK, response.Code)

	// 验证数据库中的数据未更新
	var unchangedPhoto models.DailyPhotograph
	if err := models.DB.First(&unchangedPhoto, "id = ?", data.Photo.ID.String()).Error; err != nil {
		t.Fatalf("Failed to get unchanged photo: %v", err)
	}

	assert.Equal(t, data.Photo.Title, unchangedPhoto.Title)
}

// 测试删除日常照片
func TestDeleteDailyPhotograph(t *testing.T) {
	// 准备测试数据
	data := setupTestData(t)
	defer cleanupTestData(t, data)

	// 设置测试路由
	router := setupTestRouter()

	// 测试删除日常照片
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("DELETE", fmt.Sprintf("/api/v1/daily_photograph/delete?photo_id=%s&user_id=%s", data.Photo.ID.String(), data.User.ID.String()), nil)
	req.Header.Set("Authorization", "Bearer "+data.Token)
	router.ServeHTTP(w, req)

	// 验证响应
	assert.Equal(t, http.StatusOK, w.Code)

	var response internal.Response
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, IError.OK, response.Code)

	// 验证数据库中的数据已删除
	var deletedPhoto models.DailyPhotograph
	err = models.DB.First(&deletedPhoto, "id = ?", data.Photo.ID.String()).Error
	assert.Error(t, err)
	assert.Equal(t, gorm.ErrRecordNotFound, err)
}

// 测试删除日常照片 - 权限验证
func TestDeleteDailyPhotographPermission(t *testing.T) {
	// 准备测试数据
	data := setupTestData(t)
	defer cleanupTestData(t, data)

	// 设置测试路由
	router := setupTestRouter()

	// 测试使用其他用户的token删除照片（应该失败）
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("DELETE", fmt.Sprintf("/api/v1/daily_photograph/delete?photo_id=%s&user_id=%s", data.Photo.ID.String(), data.User.ID.String()), nil)
	req.Header.Set("Authorization", "Bearer "+data.OtherToken)
	router.ServeHTTP(w, req)

	// 验证响应
	assert.Equal(t, http.StatusOK, w.Code)

	var response internal.Response
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.NotEqual(t, IError.OK, response.Code)

	// 验证数据库中的数据未删除
	var unchangedPhoto models.DailyPhotograph
	err = models.DB.First(&unchangedPhoto, "id = ?", data.Photo.ID.String()).Error
	assert.NoError(t, err)
	assert.Equal(t, data.Photo.ID, unchangedPhoto.ID)
}

// 测试点赞日常照片
func TestLikeDailyPhotograph(t *testing.T) {
	// 准备测试数据
	data := setupTestData(t)
	defer cleanupTestData(t, data)

	// 设置测试路由
	router := setupTestRouter()

	// 测试点赞日常照片
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/v1/daily_photograph/like/"+data.Photo.ID.String(), nil)
	router.ServeHTTP(w, req)

	// 验证响应
	assert.Equal(t, http.StatusOK, w.Code)

	var response internal.Response
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, IError.OK, response.Code)

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

// 测试创建日常照片
func TestCreateDailyPhotograph(t *testing.T) {
	// 准备测试数据
	data := setupTestData(t)
	defer cleanupTestData(t, data)

	// 设置测试路由
	router := setupTestRouter()

	// 准备测试文件
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	writer.WriteField("user_id", data.User.ID.String())
	writer.WriteField("title", "Test Upload Photo")
	writer.WriteField("description", "A test upload photo")
	writer.WriteField("tags", "test,upload")
	writer.WriteField("location", "Test Upload Location")
	writer.WriteField("camera", "Test Upload Camera")
	writer.WriteField("lens", "Test Upload Lens")
	writer.WriteField("iso", "400")
	writer.WriteField("aperture", "5.6")
	writer.WriteField("shutter_speed", "0.002")
	writer.WriteField("focal_length", "100")
	writer.WriteField("is_public", "true")

	// 创建一个虚拟的图片文件
	part, err := writer.CreateFormFile("photos", "test.jpg")
	if err != nil {
		t.Fatalf("Failed to create form file: %v", err)
	}
	part.Write([]byte("fake image content"))

	writer.Close()

	// 测试创建日常照片
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/v1/daily_photograph/create", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("Authorization", "Bearer "+data.Token)
	router.ServeHTTP(w, req)

	// 验证响应
	assert.Equal(t, http.StatusOK, w.Code)

	var response internal.Response
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, IError.OK, response.Code)

	// 验证返回的数据
	responseData, ok := response.Data.(map[string]interface{})
	assert.True(t, ok)
	assert.NotNil(t, responseData["success"])
	assert.NotNil(t, responseData["fail"])

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

// 测试创建日常照片 - 权限验证
func TestCreateDailyPhotographPermission(t *testing.T) {
	// 准备测试数据
	data := setupTestData(t)
	defer cleanupTestData(t, data)

	// 设置测试路由
	router := setupTestRouter()

	// 准备测试文件
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	writer.WriteField("user_id", data.User.ID.String())
	writer.WriteField("title", "Test Upload Photo")

	// 创建一个虚拟的图片文件
	part, err := writer.CreateFormFile("photos", "test.jpg")
	if err != nil {
		t.Fatalf("Failed to create form file: %v", err)
	}
	part.Write([]byte("fake image content"))

	writer.Close()

	// 测试不使用token创建日常照片（应该失败）
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/v1/daily_photograph/create", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	router.ServeHTTP(w, req)

	// 验证响应
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}