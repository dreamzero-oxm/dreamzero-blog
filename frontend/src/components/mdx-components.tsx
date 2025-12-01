import * as React from "react"
import Link from "next/link"
import Mermaid from "@/components/Mermaid"

import { cn } from "@/lib/utils"

const components = {
  h1: ({ className, id, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      id={id}
      className={cn(
        "font-heading mt-8 mb-8 scroll-m-20 text-[3.2rem] leading-[3.6rem] font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  ),
  h2: ({ className, id, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      id={id}
      className={cn(
        "font-heading mt-8 mb-8 scroll-m-20 text-[1.6rem] leading-[2.4rem] font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, id, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      id={id}
      className={cn(
        "font-heading mt-8 mb-8 scroll-m-20 text-[1.4rem] leading-[2.2rem] font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  ),
  h4: ({ className, id, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      id={id}
      className={cn(
        "font-heading mt-8 mb-8 scroll-m-20 text-[1.2rem] leading-[2rem] font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  ),
  h5: ({ className, id, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h5
      id={id}
      className={cn(
        "font-heading mt-8 mb-8 scroll-m-20 text-[1rem] leading-[1.8rem] font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  ),
  h6: ({ className, id, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h6
      id={id}
      className={cn(
        "font-heading mt-8 mb-8 scroll-m-20 text-[0.8rem] leading-[1.6rem] font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  ),
  a: ({ className, ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
    <a
      className={cn(
        "font-medium text-foreground transition-all duration-300 ease-in-out underline underline-offset-3",
        className
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={cn(
        "my-4 text-[1.1rem] leading-[2rem] text-foreground",
        className
      )}
      {...props}
    />
  ),
  strong: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className={cn("font-bold text-foreground", className)} {...props} />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn("my-6 ml-6 list-disc text-foreground", className)} {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className={cn("my-6 ml-6 list-decimal text-foreground", className)} {...props} />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <li className={cn("mt-2 ml-4 text-[1.1rem] leading-[1.6em] text-foreground", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <blockquote
      className={cn(
        "my-6 border-l-[3px] border-[#343a40] pl-4 text-foreground",
        className
      )}
      {...props}
    />
  ),
  img: ({
    className,
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={cn("max-w-full rounded-md text-foreground", className)} alt={alt} {...props} />
  ),
  hr: ({ ...props }: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className="my-4 md:my-8" {...props} />
  ),
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-x-auto">
      <table
        className={cn(
          "mx-auto mb-12 w-full border-collapse border-spacing-0 text-left text-foreground",
          "text-[1.1rem]",
          className
        )}
        {...props}
      />
    </div>
  ),
  tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr
      className={cn("m-0 text-foreground", className)}
      {...props}
    />
  ),
  th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className={cn(
        "border-b border-solid border-muted-foreground p-4 text-left font-semibold text-foreground",
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className={cn(
        "border-b border-dashed border-muted-foreground p-4 text-left leading-[1.5] text-foreground",
        className
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className={cn(
        "text-[0.8rem] text-foreground",
        className
      )}
      {...props}
    />
  ),
  code: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLElement>) => {
    // 支持三种识别方式：
    // 1) ```mermaid 围栏会带上 className 包含 "language-mermaid"
    // 2) rehype/remark 可能把语言放在 data-language 属性
    // 3) 也兼容用户手动写 <code class="mermaid"> 的情况
    const lang =
      (className ?? "")
        .split(/\s+/)
        .find(s => s.startsWith("language-"))
        ?.replace("language-", "") ||
      (props as any)["data-language"] ||
      ((className ?? "").includes("mermaid") ? "mermaid" : "")

    // children 可能是数组/ReactNode，这里尽量拿到纯文本
    const text =
      typeof children === "string"
        ? children
        : Array.isArray(children)
          ? children.join("")
          : ""

    if (lang === "mermaid" && typeof text === "string" && text.trim()) {
      return <Mermaid chart={text} className={cn("my-6")} />
    }

    return (
      <code
        className={cn(
          "w-max-2xl rounded-[0.6rem] bg-muted px-[0.3rem] py-[0.2rem]",
          "font-mono text-[1.0rem] font-normal text-foreground",
          className
        )}
        {...props}
      >
        {children}
      </code>
    )
  },
  small: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <small
      className={cn("text-[70%] text-foreground", className)}
      {...props}
    />
  ),
  Link: ({ className, ...props }: React.ComponentProps<typeof Link>) => (
    <Link
      className={cn(
        "font-medium text-foreground no-underline transition-all duration-300 ease-in-out hover:underline", 
        className
      )}
      {...props}
    />
  ),
  LinkedCard: ({ className, ...props }: React.ComponentProps<typeof Link>) => (
    <Link
      className={cn(
        "flex w-full flex-col items-center rounded-xl border bg-card p-6 text-card-foreground shadow transition-colors hover:bg-muted/50 sm:p-10",
        className
      )}
      {...props}
    />
  ),
  
}

export { components }

