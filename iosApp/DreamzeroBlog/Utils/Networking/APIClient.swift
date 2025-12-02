//
//  APIClient.swift
//  DreamzeroBlog
//
//  Created by dreamzero on 2025/10/25.
//

import Foundation
import Alamofire

// MARK: - APIClient：用于执行网络请求

public final class APIClient {
    public let baseURL: URL
    private let session: Session
    private let reachability: NetworkReachabilityManager?

    public init(
        baseURL: URL,
        timeout: TimeInterval = 30,
        additionalHeaders: HTTPHeaders? = nil,
        eventMonitors: [EventMonitor] = [NetworkLogger()],
        interceptors: [RequestInterceptor] = []
    ) {
        self.baseURL = baseURL

        // 设置 URLSession 配置
        let configuration = URLSessionConfiguration.af.default
        configuration.timeoutIntervalForRequest = timeout
        configuration.httpAdditionalHeaders = additionalHeaders?.dictionary
        
        // 创建 Alamofire 的组合拦截器
        let combinedInterceptor = Interceptor(adapters: interceptors, retriers: interceptors)

        self.session = Session(configuration: configuration, interceptor: combinedInterceptor, eventMonitors: eventMonitors)

        // 网络可达性监听
        self.reachability = NetworkReachabilityManager()
        self.reachability?.startListening(onUpdatePerforming: { status in
            LogTool.shared.info("Network: \(status)")
        })
    }

    deinit { reachability?.stopListening() }

    // MARK: - 网络请求：解码泛型返回类型

    public func request<T: Decodable>(_ endpoint: APIEndpoint, as type: T.Type = T.self, decoder: JSONDecoder = JSONDecoder()) async throws -> T {
        let convertible = APIRequestConvertible(baseURL: baseURL, endpoint: endpoint)
        return try await withCheckedThrowingContinuation { continuation in
            session.request(convertible)
                .validate(statusCode: 200..<300)
                .responseDecodable(of: T.self, decoder: decoder) { resp in
                    switch resp.result {
                    case .success(let value): continuation.resume(returning: value)
                    case .failure(let error):
                        if let code = resp.response?.statusCode {
                            if code == 401 {
                                continuation.resume(throwing: APIError.unauthorized)
                                return
                            }
                            continuation.resume(throwing: APIError.server(code: code, message: APIClient.extractMessage(data: resp.data)))
                        } else {
                            continuation.resume(throwing: APIError.from(error))
                        }
                    }
                }
        }
    }

    // 提取服务端错误信息
    static func extractMessage(data: Data?) -> String? {
        guard let data = data,
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return nil }
        for key in ["message", "msg", "error", "detail"] {
            if let v = json[key] as? String { return v }
        }
        return nil
    }
}

