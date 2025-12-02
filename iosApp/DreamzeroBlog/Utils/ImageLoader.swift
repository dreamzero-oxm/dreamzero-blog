//
//  ImageLoader.swift
//  SwiftUI + Kingfisher
//

import SwiftUI
import Kingfisher

// 默认占位/失败视图（可被泛型 @ViewBuilder 覆盖）
public struct DefaultPlaceholder: View {
    public init() {}
    public var body: some View {
        ZStack {
            Color.secondary.opacity(0.08)
            ProgressView()
        }
    }
}

public struct DefaultFailure: View {
    public init() {}
    public var body: some View {
        ZStack {
            Color.secondary.opacity(0.08)
            Image(systemName: "exclamationmark.triangle")
                .imageScale(.large)
                .foregroundStyle(.secondary)
        }
    }
}

/// SwiftUI 版网络图片组件（基于 Kingfisher）
/// - 占位/失败视图使用 @ViewBuilder 泛型
/// - 无 UIKit 依赖；iOS 17+ 推荐写法
public struct ImageLoader<Placeholder: View, Failure: View>: View {

    // MARK: - Public Props
    public let url: String
    public var contentMode: SwiftUI.ContentMode = .fill
    public var cornerRadius: CGFloat = 8

    /// 视图离开时是否取消下载
    public var cancelOnDisappear: Bool = true
    /// 下载失败的最大重试次数
    public var retryCount: Int = 1
    /// 重试间隔（秒）
    public var retryInterval: TimeInterval = 0.8
    /// 网络错误时是否覆盖显示失败视图
    public var showFailureOverlay: Bool = true

    // MARK: - View Builders
    private let placeholderBuilder: () -> Placeholder
    private let failureBuilder: (KingfisherError) -> Failure

    // MARK: - Callbacks
    public var onSuccess: ((RetrieveImageResult) -> Void)?
    public var onFailure: ((KingfisherError) -> Void)?
    public var onAspectRatio: ((CGFloat) -> Void)?  // 新增

    // MARK: - Env & State
    @Environment(\.displayScale) private var displayScale
    @State private var lastError: KingfisherError?
    @State private var didFail: Bool = false
    @State public var size: CGSize = .zero

    // MARK: - Designated Init（泛型版）
    public init(
        url: String,
        contentMode: SwiftUI.ContentMode = .fill,
        cornerRadius: CGFloat = 8,
        cancelOnDisappear: Bool = true,
        retryCount: Int = 1,
        retryInterval: TimeInterval = 0.8,
        showFailureOverlay: Bool = true,
        @ViewBuilder placeholder: @escaping () -> Placeholder,
        @ViewBuilder failure: @escaping (KingfisherError) -> Failure,
        onSuccess: ((RetrieveImageResult) -> Void)? = nil,
        onFailure: ((KingfisherError) -> Void)? = nil,
        onAspectRatio: ((CGFloat) -> Void)? = nil
    ) {
        self.url = url
        self.contentMode = contentMode
        self.cornerRadius = cornerRadius
        self.cancelOnDisappear = cancelOnDisappear
        self.retryCount = retryCount
        self.retryInterval = retryInterval
        self.showFailureOverlay = showFailureOverlay
        self.placeholderBuilder = placeholder
        self.failureBuilder = failure
        self.onSuccess = onSuccess
        self.onFailure = onFailure
        self.onAspectRatio = onAspectRatio
    }

    // MARK: - Body
    public var body: some View {
        if let u = URL(string: url) {
            GeometryReader { proxy in
                let widthPx  = max(1, proxy.size.width  * displayScale)
                let heightPx = max(1, proxy.size.height * displayScale)
                let targetPx = CGSize(width: widthPx, height: heightPx)

                ZStack {
                    KFImage.url(u)
                        .placeholder { placeholderBuilder() }     // 加载中
                        .onSuccess { result in                    // 成功
                            didFail = false
                            lastError = nil
                            size = result.image.size
                            onSuccess?(result)
                            let sz = result.image.size
                            let ratio = max(0.1, sz.height / max(sz.width, 1))
                            onAspectRatio?(ratio)
                        }
                        .onFailure { error in                     // 失败
                            lastError = error
                            didFail = true
                            onFailure?(error)
                        }

                        // 配置（链式 API）
                        .setProcessor(DownsamplingImageProcessor(size: targetPx))
                        .cacheOriginalImage()
                        .backgroundDecode()
                        .fade(duration: 0.2)
                        .retry(maxCount: retryCount, interval: .seconds(retryInterval))
                        .cancelOnDisappear(cancelOnDisappear)

                        // 显示
                        .resizable()
                        .aspectRatio(contentMode: contentMode)
                        .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
                        .frame(width: proxy.size.width, height: proxy.size.height)

                    if showFailureOverlay, didFail, let err = lastError {
                        failureBuilder(err)
                            .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
                            .frame(width: proxy.size.width, height: proxy.size.height)
                    }
                }
            }
        } else {
            // 非法 URL：构造一个占位请求对象，满足 KingfisherError 的参数要求
            let dummy = URLRequest(url: URL(string: "https://example.com/invalid")!)
            failureBuilder(.requestError(reason: .invalidURL(request: dummy)))
                .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
        }
    }
}

// MARK: - 便捷初始化器（默认占位/失败）
// 允许直接用 `ImageLoader(url:)`，无需显式写泛型参数

public extension ImageLoader where Placeholder == DefaultPlaceholder, Failure == DefaultFailure {
    init(
        url: String,
        contentMode: SwiftUI.ContentMode = .fill,
        cornerRadius: CGFloat = 8,
        cancelOnDisappear: Bool = true,
        retryCount: Int = 1,
        retryInterval: TimeInterval = 0.8,
        showFailureOverlay: Bool = true,
        onSuccess: ((RetrieveImageResult) -> Void)? = nil,
        onFailure: ((KingfisherError) -> Void)? = nil,
        onAspectRatio: ((CGFloat) -> Void)? = nil
    ) {
        self.init(
            url: url,
            contentMode: contentMode,
            cornerRadius: cornerRadius,
            cancelOnDisappear: cancelOnDisappear,
            retryCount: retryCount,
            retryInterval: retryInterval,
            showFailureOverlay: showFailureOverlay,
            placeholder: { DefaultPlaceholder() },
            failure: { _ in DefaultFailure() },
            onSuccess: onSuccess,
            onFailure: onFailure,
            onAspectRatio: onAspectRatio
        )
    }
}

public extension ImageLoader where Placeholder == DefaultPlaceholder, Failure == DefaultFailure {
    init(
        url: String,
        contentMode: SwiftUI.ContentMode = .fill,
        cornerRadius: CGFloat = 8,
        cancelOnDisappear: Bool = true,
        retryCount: Int = 1,
        retryInterval: TimeInterval = 0.8,
        showFailureOverlay: Bool = true,
        onSuccess: ((RetrieveImageResult) -> Void)? = nil,
        onFailure: ((KingfisherError) -> Void)? = nil,
        onAspectRatio: @escaping (CGFloat) -> Void
    ) {
        self.init(
            url: url,
            contentMode: contentMode,
            cornerRadius: cornerRadius,
            cancelOnDisappear: cancelOnDisappear,
            retryCount: retryCount,
            retryInterval: retryInterval,
            showFailureOverlay: showFailureOverlay,
            placeholder: { DefaultPlaceholder() },
            failure: { _ in DefaultFailure() },
            onSuccess: onSuccess,
            onFailure: onFailure,
            onAspectRatio: onAspectRatio
        )
    }
}

// 自定义占位 + 默认失败
public extension ImageLoader where Failure == DefaultFailure {
    init(
        url: String,
        contentMode: SwiftUI.ContentMode = .fill,
        cornerRadius: CGFloat = 8,
        cancelOnDisappear: Bool = true,
        retryCount: Int = 1,
        retryInterval: TimeInterval = 0.8,
        showFailureOverlay: Bool = true,
        @ViewBuilder placeholder: @escaping () -> Placeholder,
        onSuccess: ((RetrieveImageResult) -> Void)? = nil,
        onFailure: ((KingfisherError) -> Void)? = nil,
        onAspectRatio: ((CGFloat) -> Void)? = nil
    ) {
        self.init(
            url: url,
            contentMode: contentMode,
            cornerRadius: cornerRadius,
            cancelOnDisappear: cancelOnDisappear,
            retryCount: retryCount,
            retryInterval: retryInterval,
            showFailureOverlay: showFailureOverlay,
            placeholder: placeholder,
            failure: { _ in DefaultFailure() },
            onSuccess: onSuccess,
            onFailure: onFailure,
            onAspectRatio: onAspectRatio
        )
    }
}

// 默认占位 + 自定义失败
public extension ImageLoader where Placeholder == DefaultPlaceholder {
    init(
        url: String,
        contentMode: SwiftUI.ContentMode = .fill,
        cornerRadius: CGFloat = 8,
        cancelOnDisappear: Bool = true,
        retryCount: Int = 1,
        retryInterval: TimeInterval = 0.8,
        showFailureOverlay: Bool = true,
        @ViewBuilder failure: @escaping (KingfisherError) -> Failure,
        onSuccess: ((RetrieveImageResult) -> Void)? = nil,
        onFailure: ((KingfisherError) -> Void)? = nil,
        onAspectRatio: ((CGFloat) -> Void)? = nil
    ) {
        self.init(
            url: url,
            contentMode: contentMode,
            cornerRadius: cornerRadius,
            cancelOnDisappear: cancelOnDisappear,
            retryCount: retryCount,
            retryInterval: retryInterval,
            showFailureOverlay: showFailureOverlay,
            placeholder: { DefaultPlaceholder() },
            failure: failure,
            onSuccess: onSuccess,
            onFailure: onFailure,
            onAspectRatio: onAspectRatio
        )
    }
}


public enum ImageLoaderCache {
    /// 预取一组图片，提升滚动首帧体验（内部自动忽略非法 URL）
    public static func prefetch(urls: [String]) {
        let valid = urls.compactMap(URL.init(string:))
        guard !valid.isEmpty else { return }
        ImagePrefetcher(urls: valid).start()
    }

    /// 清理内存缓存（适合内存警告时调用）
    public static func clearMemory() {
        ImageCache.default.clearMemoryCache()
    }

    /// 清理磁盘缓存
    public static func clearDisk(completion: (() -> Void)? = nil) {
        ImageCache.default.clearDiskCache { completion?() }
    }

    /// 移除指定 URL 的缓存（支持选择只清内存/只清磁盘）
    public static func remove(
        for url: String,
        fromMemory: Bool = true,
        fromDisk: Bool = true,
        completion: (() -> Void)? = nil
    ) {
        guard let u = URL(string: url) else { completion?(); return }
        let key = u.absoluteString
        ImageCache.default.removeImage(
            forKey: key,
            fromMemory: fromMemory,
            fromDisk: fromDisk
        ) {
            completion?()
        }
    }

    /// 查询缓存中是否已有图片（优先内存，再磁盘；异步）
    public static func cachedImage(for url: String) async -> KFCrossPlatformImage? {
        guard let u = URL(string: url) else { return nil }
        let key = u.absoluteString
        // 内存命中
        if let img = ImageCache.default.retrieveImageInMemoryCache(forKey: key) {
            return img
        }
        // 磁盘命中（异步）
        return await withCheckedContinuation { cont in
            ImageCache.default.retrieveImage(forKey: key) { result in
                switch result {
                case .success(let value): cont.resume(returning: value.image)
                case .failure:            cont.resume(returning: nil)
                }
            }
        }
    }
}
