//
//  PagedResponse.swift
//  DreamzeroBlog
//
//  Created by dreamzero on 2025/10/25.
//

import Foundation

// MARK: - 分页响应模型，适用于需要分页数据的接口

public struct PagedResponse<T: Decodable>: Decodable {
    public let items: [T]     // 当前页的数据项
    public let page: Int      // 当前页码
    public let pageSize: Int  // 每页大小
    public let total: Int     // 总条数
}
