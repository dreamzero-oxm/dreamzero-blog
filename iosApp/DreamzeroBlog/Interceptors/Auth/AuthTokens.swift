//
//  AuthTokens.swift
//  DreamzeroBlog
//
//  Created by dreamzero on 2025/10/25.
//

import Foundation // 使用 Date/Codable

public struct AuthTokens: Codable, Equatable { // 表示一组认证令牌
    public var accessToken: String // 访问令牌（必填）
    public var refreshToken: String? // 刷新令牌（可选）
    public var tokenType: String? // 令牌类型，如 "Bearer"
    public var expiresAt: Date? // 过期时间（可选）

    public init(accessToken: String, // 自定义初始化
                refreshToken: String? = nil, // 可选刷新令牌
                tokenType: String? = nil, // 可选类型
                expiresAt: Date? = nil) { // 可选过期时间
        self.accessToken = accessToken // 赋值访问令牌
        self.refreshToken = refreshToken // 赋值刷新令牌
        self.tokenType = tokenType // 赋值类型
        self.expiresAt = expiresAt // 赋值过期时间
    }
}
