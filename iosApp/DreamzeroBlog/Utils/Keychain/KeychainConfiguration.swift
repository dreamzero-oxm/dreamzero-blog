//
//  KeychainConfiguration.swift
//  DreamzeroBlog
//
//  Created by dreamzero on 2025/10/25.
//

import Foundation
import KeychainAccess 

public struct KeychainConfiguration { // 定义用于配置 Keychain 行为的公开结构体
    public let service: String // service：命名空间，区分同一设备上不同应用的数据
    public let accessGroup: String? // accessGroup：用于 App 与扩展间共享（可选）
    public let accessibility: Accessibility // accessibility：可访问性策略（何时可解锁访问）
    public let synchronizable: Bool // synchronizable：是否启用 iCloud 钥匙串同步

    public init( // 自定义初始化方法
        service: String, // 传入 service 名称
        accessGroup: String? = nil, // 可选的访问组，默认无
        accessibility: Accessibility = .afterFirstUnlockThisDeviceOnly, // 默认“首次解锁后且仅此设备”
        synchronizable: Bool = false // 默认不启用 iCloud 同步
    ) {
        self.service = service // 赋值给存储属性
        self.accessGroup = accessGroup // 赋值访问组
        self.accessibility = accessibility // 赋值可访问性
        self.synchronizable = synchronizable // 赋值同步标志
    }

    public enum Accessibility { // 自定义可访问性枚举，包装 KeychainAccess.Accessibility
        case whenUnlocked // 设备解锁期间可访问
        case afterFirstUnlock // 首次解锁后至下次关机前可访问
        case always // 始终可访问（不推荐用于敏感数据）
        case whenPasscodeSetThisDeviceOnly // 需设置密码且仅此设备
        case whenUnlockedThisDeviceOnly // 解锁且仅此设备
        case afterFirstUnlockThisDeviceOnly // 首次解锁后仅此设备
        case alwaysThisDeviceOnly // 始终可访问仅此设备（不随备份迁移）

        public var raw: KeychainAccess.Accessibility { // 将自定义枚举映射为 KeychainAccess 的枚举
            switch self { // 根据自身 case 返回对应值
            case .whenUnlocked: return .whenUnlocked // 映射到 whenUnlocked
            case .afterFirstUnlock: return .afterFirstUnlock // 映射到 afterFirstUnlock
            case .always: return .always // 映射到 always
            case .whenPasscodeSetThisDeviceOnly: return .whenPasscodeSetThisDeviceOnly // 映射到更严格策略
            case .whenUnlockedThisDeviceOnly: return .whenUnlockedThisDeviceOnly // 仅此设备且解锁
            case .afterFirstUnlockThisDeviceOnly: return .afterFirstUnlockThisDeviceOnly // 仅此设备且首次解锁后
            case .alwaysThisDeviceOnly: return .alwaysThisDeviceOnly // 仅此设备始终
            }
        }
    }
}

