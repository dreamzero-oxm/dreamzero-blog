//
//  SecureStore.swift
//  DreamzeroBlog
//
//  Created by dreamzero on 2025/10/25.
//

import Foundation

public protocol SecureStore { // 抽象安全存储协议，便于替换实现与单测
    func set(_ value: String, for key: String) throws // 写入字符串
    func set(_ data: Data, for key: String) throws // 写入二进制
    func set<T: Codable>(_ value: T, for key: String) throws // 写入任意 Codable（将被 JSON 编码）

    func getString(_ key: String) throws -> String? // 读取字符串
    func getData(_ key: String) throws -> Data? // 读取二进制
    func get<T: Codable>(_ type: T.Type, for key: String) throws -> T? // 读取并 JSON 解码为泛型类型

    func contains(_ key: String) throws -> Bool // 判断是否存在
    func remove(_ key: String) throws // 删除单个键
    func removeAll() throws // 删除当前命名空间内全部项
}
