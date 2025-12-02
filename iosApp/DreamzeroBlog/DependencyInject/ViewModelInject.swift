//
//  ViewModelInject.swift
//  DreamzeroBlog
//
//  Created by dreamzero on 2025/10/27.
//

import Factory


extension Container {
    var photoListViewModel: Factory<PhotoListViewModel> {
        self { PhotoListViewModel(repo: self.photoRepository()) }
    }
    
    var registerViewModel: Factory<RegisterViewModel> {
        self { RegisterViewModel() }
    }
}
