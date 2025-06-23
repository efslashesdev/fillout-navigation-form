"use client";

import React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Info,
  FileText,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react"
import { Button } from "../components/ui/button"

import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core"
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers"
import DraggablePageItem from "~/components/common/DraggablePageItem"
import DroppableZone from "~/components/common/DroppableZone"

interface Page {
  id: string
  name: string
  icon: React.ReactNode
}

const initialPages: Page[] = [
  { id: "1", name: "Info", icon: <Info className="w-4 h-4" /> },
  { id: "2", name: "Details", icon: <FileText className="w-4 h-4" /> },
  { id: "3", name: "Other", icon: <FileText className="w-4 h-4" /> },
  { id: "4", name: "Ending", icon: <Check className="w-4 h-4" /> },
  { id: "5", name: "Additional", icon: <FileText className="w-4 h-4" /> },
  { id: "6", name: "Final Page", icon: <FileText className="w-4 h-4" /> },
];

export function Welcome() {
  const [pages, setPages] = useState<Page[]>(initialPages)
  const [activePage, setActivePage] = useState("1")
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)
  const [hoveredInsertIndex, setHoveredInsertIndex] = useState<number | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const [editingPageId, setEditingPageId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 6,
      },
    }),
  )

  const checkScrollState = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(checkScrollState, 100)
    return () => clearTimeout(timeoutId)
  }, [pages])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", checkScrollState)
      return () => container.removeEventListener("scroll", checkScrollState)
    }
  }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver(checkScrollState)
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    const activeTabElement = document.querySelector(`[data-page-id="${activePage}"]`)
    if (activeTabElement && scrollContainerRef.current) {
      activeTabElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      })
    }
  }, [activePage])

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: "smooth",
      })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: "smooth",
      })
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const activeIndex = pages.findIndex((page) => page.id === active.id)
      let overIndex = -1

      if (over.id.toString().startsWith("page-")) {
        overIndex = pages.findIndex((page) => page.id === over.id)
      }
      else if (over.id.toString().startsWith("drop-")) {
        overIndex = Number.parseInt(over.id.toString().replace("drop-", ""))
      }

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        const newPages = [...pages]
        const [draggedPage] = newPages.splice(activeIndex, 1)

        const insertIndex = activeIndex < overIndex ? overIndex - 1 : overIndex
        newPages.splice(insertIndex, 0, draggedPage)

        setPages(newPages)
      }
    }

    setActiveId(null)
  }

  const insertPage = (index: number) => {
    const newPage: Page = {
      id: Date.now().toString(),
      name: `Page ${pages.length + 1}`,
      icon: <FileText className="w-4 h-4" />,
    }
    const newPages = [...pages]
    newPages.splice(index, 0, newPage)
    setPages(newPages)
    setActivePage(newPage.id)
    setHoveredInsertIndex(null)
  }

  const addPage = () => {
    const newPage: Page = {
      id: Date.now().toString(),
      name: `Page ${pages.length + 1}`,
      icon: <FileText className="w-4 h-4" />,
    }
    setPages([...pages, newPage])
    setActivePage(newPage.id)
  }

  const setAsFirstPage = (pageId: string) => {
    const pageIndex = pages.findIndex((p) => p.id === pageId)
    if (pageIndex > 0) {
      const newPages = [...pages]
      const [pageToMove] = newPages.splice(pageIndex, 1)
      newPages.unshift(pageToMove)
      setPages(newPages)
    }
  }

  const startRename = (pageId: string) => {
    const page = pages.find((p) => p.id === pageId)
    if (page) {
      setEditingPageId(pageId)
      setEditingName(page.name)
    }
  }

  const saveRename = () => {
    if (editingPageId && editingName.trim()) {
      setPages(pages.map((page) => (page.id === editingPageId ? { ...page, name: editingName.trim() } : page)))
    }
    setEditingPageId(null)
    setEditingName("")
  }

  const cancelRename = () => {
    setEditingPageId(null)
    setEditingName("")
  }

  const copyPage = (pageId: string) => {
    const pageToCopy = pages.find((p) => p.id === pageId)
    if (pageToCopy) {
      const pageData = {
        name: pageToCopy.name,
        icon: "FileText",
      }
      navigator.clipboard.writeText(JSON.stringify(pageData))
    }
  }

  const duplicatePage = (pageId: string) => {
    const pageIndex = pages.findIndex((p) => p.id === pageId)
    const pageToDuplicate = pages[pageIndex]
    if (pageToDuplicate) {
      const newPage: Page = {
        id: Date.now().toString(),
        name: `${pageToDuplicate.name} Copy`,
        icon: pageToDuplicate.icon,
      }
      const newPages = [...pages]
      newPages.splice(pageIndex + 1, 0, newPage)
      setPages(newPages)
      setActivePage(newPage.id)
    }
  }

  const deletePage = (pageId: string) => {
    if (pages.length > 1) {
      const newPages = pages.filter((p) => p.id !== pageId)
      setPages(newPages)
      if (activePage === pageId) {
        setActivePage(newPages[0]?.id || "")
      }
    }
  }

  const activeDragPage = activeId ? pages.find((page) => page.id === activeId) : null

  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="flex items-center px-4 py-3">
        {showLeftArrow && (
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 hover:bg-gray-100 flex-shrink-0 mr-2"
            onClick={scrollLeft}
          >
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </Button>
        )}

        <div
          ref={scrollContainerRef}
          className="flex items-center flex-1 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToHorizontalAxis]}
          >
            <div className="inline-flex items-center bg-white" style={{ minWidth: "max-content" }}>
              <DroppableZone id="drop-0" className="w-2 h-8 transition-all duration-200" />

              {pages.map((page, index) => (
                <React.Fragment key={page.id}>
                  <DraggablePageItem
                    page={page}
                    isActive={activePage === page.id}
                    isEditing={editingPageId === page.id}
                    editingName={editingName}
                    onPageClick={() => setActivePage(page.id)}
                    onSetAsFirst={() => setAsFirstPage(page.id)}
                    onRename={() => startRename(page.id)}
                    onCopy={() => copyPage(page.id)}
                    onDuplicate={() => duplicatePage(page.id)}
                    onDelete={() => deletePage(page.id)}
                    onEditingNameChange={setEditingName}
                    onSaveRename={saveRename}
                    onCancelRename={cancelRename}
                  />

                  {index < pages.length - 1 && (
                    <div
                      className="relative flex items-center mx-2"
                      onMouseEnter={() => !activeId && setHoveredInsertIndex(index + 1)}
                      onMouseLeave={() => setHoveredInsertIndex(null)}
                    >
                      <DroppableZone id={`drop-${index + 1}`} className="flex items-center flex-row gap-0.5">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="w-1 h-1 bg-light-ring rounded-full" />
                        ))}
                      </DroppableZone>

                      <div className="absolute left-1/2 transform -translate-x-1/2">
                        <Button
                          size="sm"
                          variant="outline"
                          className={`w-6 h-6 p-0 rounded-full bg-white border-light-ring hover:bg-gray-100 transition-opacity ${hoveredInsertIndex === index + 1 && !activeId ? "opacity-100" : "opacity-0"
                            }`}
                          onClick={() => insertPage(index + 1)}
                        >
                          <Plus className="w-1 h-1 text-black" />
                        </Button>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}

              <div
                className="relative flex items-center mx-2"
                onMouseEnter={() => !activeId && setHoveredInsertIndex(pages.length)}
                onMouseLeave={() => setHoveredInsertIndex(null)}
              >
                <DroppableZone id={`drop-${pages.length}`} className="flex items-center flex-row gap-0.5">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-light-ring rounded-full" />
                  ))}
                </DroppableZone>

                <div className="absolute left-1/2 transform -translate-x-1/2">
                  <Button
                    size="sm"
                    variant="outline"
                    className={`w-6 h-6 p-0 rounded-full bg-white border-light-ring hover:bg-gray-100 transition-opacity ${hoveredInsertIndex === pages.length && !activeId ? "opacity-100" : "opacity-0"
                      }`}
                    onClick={() => insertPage(pages.length)}
                  >
                    <Plus className="w-3 h-3 text-black" />
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                className="flex items-center gap-2 px-2.5 py-1 bg-white border-gray-200 hover:bg-gray-50 rounded-md ml-2 h-8"
                onClick={addPage}
              >
                <Plus className="w-3 h-3 text-content-active" />
                <span className="text-sm font-medium text-content-active">Add page</span>
              </Button>
            </div>

            <DragOverlay>
              {activeDragPage ? (
                <div className="flex items-center gap-2 px-2.5 py-1 bg-white border border-light-ring rounded-md shadow-lg h-8">
                  <div className="flex-shrink-0 text-orange-500">{activeDragPage.icon}</div>
                  <span className="text-sm font-medium text-content-active">{activeDragPage.name}</span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {showRightArrow && (
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 hover:bg-gray-100 flex-shrink-0 ml-2"
            onClick={scrollRight}
          >
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </Button>
        )}
      </div>
    </div>
  )
}
