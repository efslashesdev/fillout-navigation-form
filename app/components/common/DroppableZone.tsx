"use client";

import React from "react"
import { useDroppable } from "@dnd-kit/core"

interface Props {
  id: string
  children?: React.ReactNode
  className?: string
}

export default function DroppableZone({
  id,
  children,
  className,
}: Props) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  })

  return (
    <div ref={setNodeRef} className={`${className} ${isOver ? "bg-blue-100" : ""}`}>
      {children}
    </div>
  )
}