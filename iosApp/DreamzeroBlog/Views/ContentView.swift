//
//  ContentView.swift
//  DreamzeroBlog
//
//  Created by dreamzero on 2025/10/24.
//

import SwiftUI
import SwiftData

struct ContentView: View {
    var body: some View {
        TabView {
            
            // Daily Photo View
            PhotoGridView()
                .tabItem {
                    Label("日常照片", systemImage: "photo")
                }
            

            OtherTabView()
                .tabItem {
                    Label("更多", systemImage: "ellipsis.circle")
                }
            
            // Login Tab
            LoginView()
                .tabItem {
                    Label("我的", systemImage: "person.crop.circle")
                }
            
            
        }
    }
}


#Preview {
    ContentView()
}
