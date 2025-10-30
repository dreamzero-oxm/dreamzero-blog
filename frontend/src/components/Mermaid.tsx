"use client"

import React from "react"
import mermaid from "mermaid"

type Props = {
  chart: string
  className?: string
  /** 可选：强制暗/亮主题；不传则跟随 mermaid 默认 */
  theme?: "default" | "neutral" | "dark" | "forest" | "base"
}

let hasInit = false

export default function Mermaid({ chart, className, theme }: Props) {
  const [html, setHtml] = React.useState<string>("")
  const idRef = React.useRef(`mermaid-${Math.random().toString(36).slice(2)}`)

  React.useEffect(() => {
    // 只初始化一次
    if (!hasInit) {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict", // 需要更宽松可设为 "loose"
        theme: theme ?? "default",
      })
      hasInit = true
    }
    let mounted = true
    ;(async () => {
      try {
        const { svg } = await mermaid.render(idRef.current, chart)
        if (mounted) setHtml(svg)
      } catch {
        // 渲染失败时回退为代码块
        if (mounted) setHtml(`<pre><code>${escapeHtml(chart)}</code></pre>`)
      }
    })()
    return () => {
      mounted = false
    }
  }, [chart, theme])

  return (
    <div
      className={className}
      // mermaid.render 已经给出完整 svg
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function escapeHtml(str: string) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}
