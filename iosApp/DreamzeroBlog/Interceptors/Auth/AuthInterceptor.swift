//
//  AuthInterceptor.swift
//  DreamzeroBlog
//
//  Created by dreamzero on 2025/10/25.
//

import Foundation
import Alamofire

/// 约定的刷新器协议
/// 要求：拿旧的 refreshToken，返回一组新的 AuthTokens（至少应含新的 accessToken；refreshToken 可选刷新）
public protocol TokenRefresher: AnyObject {
    func refreshToken(oldRefreshToken: String) async throws -> AuthTokens
}

/// 认证拦截器：
/// 1) 在请求发出前自动附加 Authorization 头；
/// 2) 当响应为 401 时串行刷新 token，并在成功后重试一次失败请求。
final class AuthInterceptor: RequestInterceptor {

    // MARK: - Dependencies

    /// 使用在 Toolkit 中实现的 TokenStore（KeychainAccess 封装）
    private weak var tokenStore: TokenStore?
    /// 负责实际调用后端刷新接口
    private weak var refresher: TokenRefresher?

    // MARK: - Concurrency State

    private let lock = NSLock()
    private var isRefreshing = false
    private var queuedCompletions: [(RetryResult) -> Void] = []

    // MARK: - Init

    init(tokenStore: TokenStore?, refresher: TokenRefresher?) {
        self.tokenStore = tokenStore
        self.refresher = refresher
    }

    // MARK: - 1) Attach Authorization before request

    func adapt(
        _ urlRequest: URLRequest,
        for session: Session,
        completion: @escaping (Result<URLRequest, Error>) -> Void
    ) {
        var request = urlRequest

        // 从 TokenStore 读取 accessToken 与 tokenType
        let accessToken = try? tokenStore?.currentAccessToken()
        let tokenType = try? tokenStore?.currentTokens()?.tokenType

        if let token = accessToken, !token.isEmpty {
            // 若有 tokenType 优先使用，例如 "Bearer <token>" / "JWT <token>"
            let prefix: String
            if let type = tokenType, !type.isEmpty {
                prefix = type
            } else {
                prefix = "Bearer"
            }
            let value = "\(prefix) \(token)"
            var headers = request.headers
            headers.update(name: "Authorization", value: value)
            request.headers = headers
        }

        completion(.success(request))
    }

    // MARK: - 2) Retry on 401 with token refresh

    func retry(
        _ request: Request,
        for session: Session,
        dueTo error: Error,
        completion: @escaping (RetryResult) -> Void
    ) {
        // 仅处理 HTTP 401
        guard
            let response = request.task?.response as? HTTPURLResponse,
            response.statusCode == 401
        else {
            completion(.doNotRetry)
            return
        }

        // 避免无限重试：已重试过（>=1）则不再重试
        if request.retryCount >= 1 {
            completion(.doNotRetry)
            return
        }

        // 需要存在 refresher 与 refreshToken
        guard
            let refresher = refresher,
            let refreshToken = (try? tokenStore?.currentTokens()?.refreshToken) ?? nil,
            !refreshToken.isEmpty
        else {
            completion(.doNotRetry)
            return
        }

        // 并发保护：把本次 completion 入队，若正在刷新则等待结果
        lock.lock()
        queuedCompletions.append(completion)
        if isRefreshing {
            lock.unlock()
            return
        }
        isRefreshing = true
        lock.unlock()

        // 开始刷新（不强制切主线程，交由 refresher 自行决定调度）
        Task {
            do {
                // 1) 请求后端刷新 token
                let newTokens = try await refresher.refreshToken(oldRefreshToken: refreshToken)

                // 2) 合并 refreshToken（若后端未返回新的 refreshToken，保留旧值）
                var merged = newTokens
                if merged.refreshToken == nil {
                    merged.refreshToken = refreshToken
                }

                // 3) 持久化
                try await tokenStore?.save(merged)

                // 4) 广播：允许所有排队请求重试
                flushQueue(with: .retry)

            } catch {
                // 刷新失败：清理本地 token，阻止重试
                _ = try? await tokenStore?.clear()
                flushQueue(with: .doNotRetry)
            }
        }
    }

    // MARK: - 3) Broadcast helper

    private func flushQueue(with result: RetryResult) {
        lock.lock()
        let completions = queuedCompletions
        queuedCompletions.removeAll()
        isRefreshing = false
        lock.unlock()

        completions.forEach { $0(result) }
    }
    
    /// 外部只能在登录/登出/切换环境时调用，保证线程安全
    func setRefresher(_ newRefresher: TokenRefresher?) {
        lock.lock(); defer { lock.unlock() }
        refresher = newRefresher
    }
}
