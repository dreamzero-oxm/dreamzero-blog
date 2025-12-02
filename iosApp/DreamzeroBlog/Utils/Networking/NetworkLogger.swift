//
//  NetworkLogger.swift
//  DreamzeroBlog
//
//  Created by dreamzero on 2025/10/25.
//

import Foundation
import Alamofire

// MARK: - 网络请求日志记录
public final class NetworkLogger: EventMonitor {
    // EventMonitor 协议要求你实现 queue 属性，这个属性指定了 Alamofire 事件回调的执行队列。如果你不显式使用 queue，Alamofire 会自动将事件回调调度到你指定的队列上。
    public let queue = DispatchQueue(label: "network.logger.queue")
    
    public init() {}

    // 请求开始时打印日志
    public func requestDidResume(_ request: Request) {
        LogTool.shared.debug("➡️ \(request.description)")
        if let headers = request.request?.allHTTPHeaderFields {
            LogTool.shared.verbose("Headers: \(headers)")
        }
        if let body = request.request?.httpBody, let s = String(data: body, encoding: .utf8) {
            LogTool.shared.verbose("Body: \(s)")
        }
    }

    // 请求完成后打印日志
    public func request<Value>(_ request: DataRequest, didParseResponse response: DataResponse<Value, AFError>) {
        let code = response.response?.statusCode ?? -1
        switch response.result {
        case .success:
            LogTool.shared.info("✅ [\(code)] \(request.description)")
        case .failure(let err):
            LogTool.shared.error("❌ [\(code)] \(request.description) - \(err.localizedDescription)")
            if let data = response.data, let s = String(data: data, encoding: .utf8) {
                LogTool.shared.verbose("Response body: \(s)")
            }
        }
    }
}

