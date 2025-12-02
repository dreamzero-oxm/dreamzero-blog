//
//  KeychainAccessStore.swift
//  DreamzeroBlog
//
//  Created by dreamzero on 2025/10/25.
//

import Foundation
import KeychainAccess

public final class KeychainAccessStore: SecureStore { // 基于 KeychainAccess 的 SecureStore 实现
    private let keychain: Keychain // 具体的 Keychain 句柄
    private let encoder: JSONEncoder // JSON 编码器
    private let decoder: JSONDecoder // JSON 解码器

    public init(config: KeychainConfiguration, // 通过配置初始化
                encoder: JSONEncoder = JSONEncoder(), // 可注入编码器（测试/定制）
                decoder: JSONDecoder = JSONDecoder()) { // 可注入解码器
        var kc = Keychain(service: config.service, accessGroup: config.accessGroup) // 以 service, 以及accessGroup 初始化 Keychain
            .accessibility(config.accessibility.raw) // 设置可访问性策略
        if config.synchronizable { // 若启用 iCloud 同步
            kc = kc.synchronizable(true) // 打开同步
        }
        self.keychain = kc // 保存最终配置的 keychain 对象
        self.encoder = encoder // 保存编码器
        self.decoder = decoder // 保存解码器
    }

    public func set(_ value: String, for key: String) throws { // 写入字符串值
        do { // 捕获可能抛出的错误
            try keychain.set(value, key: key) // 调用 KeychainAccess 写入
        } catch { // 写入失败
            throw KeychainStoreError.underlying("Set string failed for key=\(key): \(error.localizedDescription)") // 映射为语义化错误
        }
    }

    public func set(_ data: Data, for key: String) throws { // 写入二进制值
        do { // 捕获错误
            try keychain.set(data, key: key) // 写入 Data
        } catch { // 失败情况
            throw KeychainStoreError.underlying("Set data failed for key=\(key): \(error.localizedDescription)") // 转换错误
        }
    }

    public func set<T: Codable>(_ value: T, for key: String) throws { // 写入 Codable 值
        do { // 捕获错误
            let data = try encoder.encode(value) // 使用 JSONEncoder 编码为 Data
            try set(data, for: key) // 复用 Data 写入接口
        } catch let e as EncodingError { // 捕获编码错误
            throw KeychainStoreError.encodingFailed("\(e)") // 转为语义化编码失败
        } catch { // 其他错误
            throw KeychainStoreError.underlying("Set codable failed for key=\(key): \(error.localizedDescription)") // 统一为底层错误
        }
    }

    public func getString(_ key: String) throws -> String? { // 读取字符串
        do { // 捕获错误
            return try keychain.getString(key) // 从 Keychain 读取字符串（未找到返回 nil）
        } catch { // 读取失败
            throw KeychainStoreError.underlying("Get string failed for key=\(key): \(error.localizedDescription)") // 转换错误
        }
    }

    public func getData(_ key: String) throws -> Data? { // 读取二进制
        do { // 捕获错误
            return try keychain.getData(key) // 未找到返回 nil
        } catch { // 失败
            throw KeychainStoreError.underlying("Get data failed for key=\(key): \(error.localizedDescription)") // 转换错误
        }
    }

    public func get<T: Codable>(_ type: T.Type, for key: String) throws -> T? { // 读取并解码为泛型
        do { // 捕获错误
            guard let data = try getData(key) else { return nil } // 若不存在，直接返回 nil
            return try decoder.decode(type, from: data) // JSON 解码为目标类型
        } catch let e as DecodingError { // 捕获解码错误
            throw KeychainStoreError.decodingFailed("\(e)") // 语义化解码失败
        } catch KeychainStoreError.itemNotFound { // 若上层透传未找到
            throw KeychainStoreError.itemNotFound // 保持一致
        } catch { // 其他错误
            throw KeychainStoreError.underlying("Get codable failed for key=\(key): \(error.localizedDescription)") // 转换错误
        }
    }

    public func contains(_ key: String) throws -> Bool { // 判断键是否存在
        do { // 捕获错误
            if try keychain.contains(key) { // 新版 KeychainAccess 提供 contains API
                return true // 若包含则直接返回 true
            }
            if try keychain.getData(key) != nil { return true }
            if try keychain.getString(key) != nil { return true }
            return false // 兼容旧版：尝试读取判断
        } catch { // 失败
            throw KeychainStoreError.underlying("Contains failed for key=\(key): \(error.localizedDescription)") // 转换错误
        }
    }

    public func remove(_ key: String) throws { // 删除单项
        do { // 捕获错误
            try keychain.remove(key) // 调用删除
        } catch { // 失败
            throw KeychainStoreError.underlying("Remove failed for key=\(key): \(error.localizedDescription)") // 转换错误
        }
    }

    public func removeAll() throws { // 删除所有项（当前 service/组）
        do { // 捕获错误
            try keychain.removeAll() // 执行清空
        } catch { // 失败
            throw KeychainStoreError.underlying("RemoveAll failed: \(error.localizedDescription)") // 转换错误
        }
    }
}
