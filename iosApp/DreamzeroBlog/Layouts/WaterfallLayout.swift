//
//  WaterfallLayout.swift
//  DreamzeroBlog
//
//  Created by dreamzero on 2025/10/27.
//

import SwiftUI

/// 两列瀑布流布局（按最矮列布局，避免重叠）
struct WaterfallLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        guard !subviews.isEmpty, let containerWidth = proposal.width else { return .zero }

        let colWidth = (containerWidth - spacing) / 2
        var colHeights: [CGFloat] = [0, 0]
        var colCounts:  [Int]     = [0, 0]   // 用于控制首个不加 spacing

        for view in subviews {
            let h = view.sizeThatFits(.init(width: colWidth, height: nil)).height
            let col = (colHeights[0] <= colHeights[1]) ? 0 : 1
            if colCounts[col] > 0 { colHeights[col] += spacing }
            colHeights[col] += h
            colCounts[col]  += 1
        }
        return CGSize(width: containerWidth, height: max(colHeights[0], colHeights[1]))
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let colWidth = (bounds.width - spacing) / 2
        var colOffsets: [CGFloat] = [bounds.minY, bounds.minY]
        var colCounts:  [Int]     = [0, 0]

        for view in subviews {
            let h = view.sizeThatFits(.init(width: colWidth, height: nil)).height
            let col = (colOffsets[0] <= colOffsets[1]) ? 0 : 1
            if colCounts[col] > 0 { colOffsets[col] += spacing }
            let x = bounds.minX + CGFloat(col) * (colWidth + spacing)
            let y = colOffsets[col]

            view.place(
                at: CGPoint(x: x, y: y),
                proposal: .init(width: colWidth, height: h)
            )
            colOffsets[col] = y + h
            colCounts[col] += 1
        }
    }
}
