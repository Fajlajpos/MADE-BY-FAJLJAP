import type { ElementType, ReactNode } from 'react'

/** DEPRECATED (phase 2): a plain heading. Sections are moving off it. */
export function Overprint({
  as: Tag = 'span',
  id,
  className,
  children,
}: {
  as?: ElementType
  id?: string
  className?: string
  ink?: string
  children: ReactNode
}) {
  return (
    <Tag id={id} className={className}>
      {children}
    </Tag>
  )
}
