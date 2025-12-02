//
//  LogTool.swift
//  DreamzeroBlog
//
//  Created by dreamzero on 2025/10/24.
//

import SwiftyBeaver

// 配置SwiftyBeaver日志工具
class LogTool {
    static let shared = LogTool()
    
    private init() {
        let console = ConsoleDestination()  // 日志输出到控制台
        SwiftyBeaver.addDestination(console)
    }
    
    // 提供日志输出接口
    func verbose(_ message: String) {
        SwiftyBeaver.verbose(message)
    }
    
    func debug(_ message: String) {
        SwiftyBeaver.debug(message)
    }
    
    func info(_ message: String) {
        SwiftyBeaver.info(message)
    }
    
    func warning(_ message: String) {
        SwiftyBeaver.warning(message)
    }
    
    func error(_ message: String) {
        SwiftyBeaver.error(message)
    }
    
}
