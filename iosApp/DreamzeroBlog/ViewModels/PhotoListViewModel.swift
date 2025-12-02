//
//  PhotoListViewModel.swift
//  DreamzeroBlog
//
//  Created by dreamzero on 2025/10/27.
//

import Foundation
import Observation
import Factory

@Observable
final class PhotoListViewModel {
    enum State {
        case idle          // 初始空闲：尚未触发加载
        case loading       // 正在加载：可显示菊花/骨架屏
        case loaded        // 已成功加载：展示内容
        case failed(String) // 加载失败：携带错误信息用于提示
    }


    // 可观测状态（注意：在主线程更新）
    var state: State = .idle
    var photos: [Photo] = []

    // 依赖
    private let repo: PhotoRepositoryType

    // 构造器注入（测试友好）
    init(repo: PhotoRepositoryType) {
        self.repo = repo
    }

    // 便捷构造：从容器解析（可选）
    convenience init(container: Container = .shared) {
        self.init(repo: container.photoRepository())
    }

    // 业务逻辑
    func load() {
        // 防重复
        if case .loading = state { return }
        state = .loading
        Task { await fetch() }
    }

    private func fetch() async {
        do {
            let items = try await repo.fetchAll()
            await MainActor.run {
                self.photos = items
                self.state = .loaded
            }
        } catch {
            await MainActor.run {
                self.state = .failed(error.localizedDescription)
            }
        }
    }
}

