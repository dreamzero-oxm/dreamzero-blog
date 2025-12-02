//
//  KeychainStoreError.swift
//  DreamzeroBlog
//
//  Created by dreamzero on 2025/10/25.
//
import Foundation

public enum KeychainStoreError: Error, LocalizedError, Equatable { // 定义语义化错误类型，便于上层处理
    case itemNotFound // 未找到项
    case encodingFailed(String) // 编码失败，附加信息
    case decodingFailed(String) // 解码失败，附加信息
    case underlying(String) // 透传底层错误的文本化描述

    public var errorDescription: String? { // 提供本地化错误描述
        switch self { // 根据错误类型返回描述
        case .itemNotFound: return "Keychain item not found." // 未找到项
        case .encodingFailed(let msg): return "Keychain encoding failed: \(msg)" // 编码失败详情
        case .decodingFailed(let msg): return "Keychain decoding failed: \(msg)" // 解码失败详情
        case .underlying(let msg): return msg // 直接返回底层错误信息
        }
    }
}

