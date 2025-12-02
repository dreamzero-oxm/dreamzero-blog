//
//  LoggingInterceptor.swift
//  DreamzeroBlog
//
//  Created by dreamzero on 2025/10/25.
//

import Alamofire
import Foundation

// 第二个拦截器，记录日志
final class LoggingInterceptor: RequestInterceptor {
    func adapt(_ urlRequest: URLRequest, for session: Session, completion: @escaping (Result<URLRequest, Error>) -> Void) {
        print("Request URL: \(urlRequest.url?.absoluteString ?? "")")
        completion(.success(urlRequest))
    }
}
