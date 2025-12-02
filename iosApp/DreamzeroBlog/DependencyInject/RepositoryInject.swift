//
//  RepositoryInject.swift
//  DreamzeroBlog
//
//  Created by dreamzero on 2025/10/27.
//

import Foundation
import Factory

extension Container {
    // Repository
    // 注册 PhotoRepository
    var photoRepository: Factory<PhotoRepositoryType> {
        self { PhotoRepository(client: self.apiClient()) }
    }
}
