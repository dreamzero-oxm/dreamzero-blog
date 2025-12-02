//
//  APIError.swift
//  DreamzeroBlog
//
//  Created by dreamzero on 2025/10/25.
//

import Foundation
import Alamofire

// MARK: - 公共错误类型
public enum APIError: Error, LocalizedError, Equatable {
    case network(AFError)                    // 网络请求错误
    case server(code: Int, message: String?) // 服务端返回的错误（如非 2xx 状态码）
    case decoding(DecodingError)             // 数据解析错误
    case invalidResponse                     // 响应格式错误
    case cancelled                           // 请求被取消
    case unauthorized                        // 认证失败（401）
    case unknown(Error)                      // 其他未知错误

    // 错误描述
    public var errorDescription: String? {
        switch self {
        case .network(let e): return "Network error: \(e.localizedDescription)"
        case .server(let code, let msg): return "Server error(\(code)): \(msg ?? "Unknown")"
        case .decoding(let e): return "Decoding error: \(e.localizedDescription)"
        case .invalidResponse: return "Invalid response"
        case .cancelled: return "Cancelled"
        case .unauthorized: return "Unauthorized"
        case .unknown(let e): return "Unknown error: \(e.localizedDescription)"
        }
    }

    // 将其他错误类型转换为 APIError
    static func from(_ error: Error) -> APIError {
        if let af = error.asAFError {
            if af.isExplicitlyCancelledError { return .cancelled }
            return .network(af)
        }
        if let dec = error as? DecodingError { return .decoding(dec) }
        return .unknown(error)
    }
    
    public static func == (lhs: APIError, rhs: APIError) -> Bool {
        switch (lhs, rhs) {
        case (.server(let lCode, _), .server(let rCode, _)):
            // 仅按状态码
            return lCode == rCode

        case (.network(let le), .network(let re)):
            // 以文本（描述）比较
            return le.localizedDescription == re.localizedDescription

        case (.decoding(let le), .decoding(let re)):
            // DecodingError 文本化比较（localizedDescription 已含路径/原因）
            return le.localizedDescription == re.localizedDescription

        case (.unknown(let le), .unknown(let re)):
            // 兜底错误也用文本比较
            return le.localizedDescription == re.localizedDescription

        case (.invalidResponse, .invalidResponse),
             (.cancelled, .cancelled),
             (.unauthorized, .unauthorized):
            return true

        default:
            return false
        }
    }
}
