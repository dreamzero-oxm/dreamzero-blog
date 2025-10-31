// 表单验证工具

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否有效
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号格式（中国大陆）
 * @param phone 手机号
 * @returns 是否有效
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证密码强度
 * @param password 密码
 * @returns 验证结果
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('密码不能为空');
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('密码长度至少为8位');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('密码应包含小写字母');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('密码应包含大写字母');
  }
  
  if (!/\d/.test(password)) {
    errors.push('密码应包含数字');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('密码应包含特殊字符');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 验证用户名格式
 * @param username 用户名
 * @returns 是否有效
 */
export function isValidUsername(username: string): boolean {
  // 用户名长度4-20位，只能包含字母、数字、下划线
  const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
  return usernameRegex.test(username);
}

/**
 * 验证昵称格式
 * @param nickname 昵称
 * @returns 是否有效
 */
export function isValidNickname(nickname: string): boolean {
  // 昵称长度2-20位，不能包含特殊字符
  const nicknameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9]{2,20}$/;
  return nicknameRegex.test(nickname);
}

/**
 * 验证URL格式
 * @param url URL地址
 * @returns 是否有效
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证文件类型
 * @param file 文件对象
 * @param allowedTypes 允许的文件类型数组
 * @returns 是否有效
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * 验证文件大小
 * @param file 文件对象
 * @param maxSizeInMB 最大文件大小（MB）
 * @returns 是否有效
 */
export function isValidFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

/**
 * 验证图片文件
 * @param file 文件对象
 * @param maxSizeInMB 最大文件大小（MB），默认为5MB
 * @returns 验证结果
 */
export function validateImageFile(file: File, maxSizeInMB: number = 5): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!file) {
    errors.push('请选择文件');
    return { isValid: false, errors };
  }
  
  if (!isValidFileType(file, allowedTypes)) {
    errors.push('只支持 JPEG、PNG、GIF、WebP 格式的图片');
  }
  
  if (!isValidFileSize(file, maxSizeInMB)) {
    errors.push(`图片大小不能超过 ${maxSizeInMB}MB`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 表单验证器类
 */
export class FormValidator {
  private errors: Record<string, string[]> = {};
  
  /**
   * 添加验证规则
   * @param field 字段名
   * @param value 字段值
   * @param rules 验证规则数组
   * @returns 验证器实例
   */
  addRule(
    field: string,
    value: any,
    rules: Array<{
      test: (value: any) => boolean;
      message: string;
    }>
  ): FormValidator {
    const fieldErrors: string[] = [];
    
    for (const rule of rules) {
      if (!rule.test(value)) {
        fieldErrors.push(rule.message);
      }
    }
    
    if (fieldErrors.length > 0) {
      this.errors[field] = fieldErrors;
    }
    
    return this;
  }
  
  /**
   * 验证必填字段
   * @param field 字段名
   * @param value 字段值
   * @param fieldName 字段显示名称
   * @returns 验证器实例
   */
  required(field: string, value: any, fieldName: string = field): FormValidator {
    return this.addRule(field, value, [
      {
        test: (val) => val !== undefined && val !== null && val !== '',
        message: `${fieldName}不能为空`
      }
    ]);
  }
  
  /**
   * 验证邮箱
   * @param field 字段名
   * @param value 字段值
   * @returns 验证器实例
   */
  email(field: string, value: string): FormValidator {
    return this.addRule(field, value, [
      {
        test: (val) => isValidEmail(val),
        message: '请输入有效的邮箱地址'
      }
    ]);
  }
  
  /**
   * 验证手机号
   * @param field 字段名
   * @param value 字段值
   * @returns 验证器实例
   */
  phone(field: string, value: string): FormValidator {
    return this.addRule(field, value, [
      {
        test: (val) => !val || isValidPhone(val),
        message: '请输入有效的手机号码'
      }
    ]);
  }
  
  /**
   * 验证密码
   * @param field 字段名
   * @param value 字段值
   * @returns 验证器实例
   */
  password(field: string, value: string): FormValidator {
    return this.addRule(field, value, [
      {
        test: (val) => validatePassword(val).isValid,
        message: '密码必须至少8位，包含大小写字母、数字和特殊字符'
      }
    ]);
  }
  
  /**
   * 验证昵称
   * @param field 字段名
   * @param value 字段值
   * @returns 验证器实例
   */
  nickname(field: string, value: string): FormValidator {
    return this.addRule(field, value, [
      {
        test: (val) => isValidNickname(val),
        message: '昵称长度应为2-20位，只能包含中文、字母和数字'
      }
    ]);
  }
  
  /**
   * 验证最小长度
   * @param field 字段名
   * @param value 字段值
   * @param min 最小长度
   * @param fieldName 字段显示名称
   * @returns 验证器实例
   */
  minLength(field: string, value: string, min: number, fieldName: string = field): FormValidator {
    return this.addRule(field, value, [
      {
        test: (val) => !val || val.length >= min,
        message: `${fieldName}长度至少为${min}位`
      }
    ]);
  }
  
  /**
   * 验证最大长度
   * @param field 字段名
   * @param value 字段值
   * @param max 最大长度
   * @param fieldName 字段显示名称
   * @returns 验证器实例
   */
  maxLength(field: string, value: string, max: number, fieldName: string = field): FormValidator {
    return this.addRule(field, value, [
      {
        test: (val) => !val || val.length <= max,
        message: `${fieldName}长度不能超过${max}位`
      }
    ]);
  }
  
  /**
   * 验证两个值是否相等
   * @param field 字段名
   * @param value 字段值
   * @param compareValue 比较值
   * @param fieldName 字段显示名称
   * @param compareFieldName 比较字段显示名称
   * @returns 验证器实例
   */
  equals(
    field: string,
    value: string,
    compareValue: string,
    fieldName: string = field,
    compareFieldName: string = '确认值'
  ): FormValidator {
    return this.addRule(field, value, [
      {
        test: (val) => val === compareValue,
        message: `${fieldName}与${compareFieldName}不一致`
      }
    ]);
  }
  
  /**
   * 获取所有验证错误
   * @returns 错误对象
   */
  getErrors(): Record<string, string[]> {
    return this.errors;
  }
  
  /**
   * 获取第一个错误消息
   * @returns 错误消息或null
   */
  getFirstError(): string | null {
    const fields = Object.keys(this.errors);
    if (fields.length === 0) return null;
    
    return this.errors[fields[0]][0];
  }
  
  /**
   * 获取所有错误消息（扁平化）
   * @returns 错误消息数组
   */
  getAllErrors(): string[] {
    const allErrors: string[] = [];
    
    for (const field in this.errors) {
      allErrors.push(...this.errors[field]);
    }
    
    return allErrors;
  }
  
  /**
   * 验证是否通过
   * @returns 是否通过验证
   */
  isValid(): boolean {
    return Object.keys(this.errors).length === 0;
  }
}

/**
 * 创建表单验证器实例
 * @returns 验证器实例
 */
export function createValidator(): FormValidator {
  return new FormValidator();
}