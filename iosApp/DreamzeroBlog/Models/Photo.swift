//
//  Photo.swift
//  DreamzeroBlog
//
//  Created by dreamzero on 2025/10/27.
//

import Foundation

public struct Photo: Decodable, Identifiable, Hashable {
    public let id: Int
    public let createdAt: String
    public let updatedAt: String
    public let imageURL: String
    public let title: String

    enum CodingKeys: String, CodingKey {
        case id
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case imageURL = "image_url"
        case title
    }
}
