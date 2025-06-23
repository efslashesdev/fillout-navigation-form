"use client";

import { useEffect, useRef, useState } from "react"
import { useDraggable } from "@dnd-kit/core"
import { Clipboard, Copy, Edit, Flag, MoreVertical, Trash2 } from "lucide-react"
import { Input } from "../ui/input"
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import type { Page } from "~/lib/types"

interface Props {
  page: Page
  isActive: boolean
  isEditing: boolean
  editingName: string
  onPageClick: () => void
  onSetAsFirst: () => void
  onRename: () => void
  onCopy: () => void
  onDuplicate: () => void
  onDelete: () => void
  onEditingNameChange: (name: string) => void
  onSaveRename: () => void
  onCancelRename: () => void
}

export default function DraggablePageItem({
  page,
  isActive,
  isEditing,
  editingName,
  onPageClick,
  onSetAsFirst,
  onRename,
  onCopy,
  onDuplicate,
  onDelete,
  onEditingNameChange,
  onSaveRename,
  onCancelRename,
}: Props) {
  const [deletePopoverOpen, setDeletePopoverOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showDeletePopover, setShowDeletePopover] = useState(false)
  const dropdownTriggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: page.id,
    disabled: dropdownOpen || deletePopoverOpen,
  })

  const style = transform
    ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    }
    : undefined

  useEffect(() => {
    if (isEditing && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 200)
    }
  }, [inputRef, isEditing])

  const handleDeleteClick = () => {
    setDeletePopoverOpen(false)
    setShowDeletePopover(false)
    onDelete()
  }

  const handleDeleteMenuClick = () => {
    setDropdownOpen(false)

    setTimeout(() => {
      setShowDeletePopover(true)
      setTimeout(() => {
        setDeletePopoverOpen(true)
      }, 50)
    }, 150)
  }

  const handlePopoverClose = () => {
    setDeletePopoverOpen(false)
    setTimeout(() => {
      setShowDeletePopover(false)
    }, 150)
  }

  const handleClick = () => {
    if (!isDragging && !isEditing && !dropdownOpen && !deletePopoverOpen) {
      onPageClick()
    }
  }

  const handleDoubleClick = () => {
    if (!isDragging && !isEditing && !dropdownOpen && !deletePopoverOpen) {
      onPageClick()
      onRename();
    }
  }

  const handleOpenDropdown = (open: boolean) => {
    setDropdownOpen(open);
    if (open) {
      onPageClick()
    }
  }

  const dragListeners = dropdownOpen || deletePopoverOpen ? {} : listeners

  return (
    <>
      <div className="relative group">
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...dragListeners}
          data-page-id={page.id}
          className={`flex items-center gap-2 px-2.5 py-1 rounded-md cursor-pointer transition-all duration-200 h-8 border ${isActive
            ? "bg-white text-content-active border-light-ring shadow-sm"
            : "bg-gray/15 border-gray/15 hover:bg-gray/35 hover:border-gray/35 text-content-default"
            } ${isDragging ? "opacity-50" : ""}`}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
        >
          <div className={isActive ? "text-icon-warning" : "text-icon"}>{page.icon}</div>

          <Input
            ref={inputRef}
            value={editingName}
            onChange={(e) => onEditingNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && editingName.trim()) {
                e.preventDefault()
                onSaveRename()
              } else if (e.key === "Escape") {
                e.preventDefault()
                onCancelRename()
              }
            }}
            onBlur={onSaveRename}
            className={`text-sm font-medium h-6 px-1 py-0 border-0 bg-transparent focus:bg-white focus:border focus:border-blue-500 min-w-[60px] w-auto ${isEditing ? "flex" : "hidden"
              }`}
            onClick={(e) => e.stopPropagation()}
          />
          <span className={`text-sm font-medium whitespace-nowrap ${isEditing ? "hidden" : "flex"}`}>{page.name}</span>

          <DropdownMenu open={dropdownOpen} onOpenChange={handleOpenDropdown}>
            <DropdownMenuTrigger asChild>
              <Button
                ref={dropdownTriggerRef}
                variant="ghost"
                size="sm"
                className="w-5 h-5 p-0 opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-0 rounded-xl">
              <div className="px-4 py-3 border-b border-powder-gray bg-gray-50">
                <h3 className="font-semibold text-content-active">Settings</h3>
              </div>
              <div className="py-2">
                <DropdownMenuItem onClick={onSetAsFirst} className="px-4 py-3 cursor-pointer hover:bg-gray-50 gap-1.5">
                  <Flag className="w-4 h-4 text-icon-blue" fill="#2F72E2" />
                  <span className="text-content-active font-semibold text-sm">Set as first page</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onRename} className="px-4 py-3 cursor-pointer hover:bg-gray-50 gap-1.5">
                  <Edit className="w-4 h-4 text-icon-disabled" />
                  <span className="text-content-active font-semibold text-sm">Rename</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onCopy} className="px-4 py-3 cursor-pointer hover:bg-gray-50 gap-1.5">
                  <Clipboard className="w-4 h-4 text-icon-disabled" />
                  <span className="text-content-active font-semibold text-sm">Copy</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onDuplicate} className="px-4 py-3 cursor-pointer hover:bg-gray-50 gap-1.5">
                  <Copy className="w-4 h-4 text-icon-disabled" />
                  <span className="text-content-active font-semibold text-sm">Duplicate</span>
                </DropdownMenuItem>
              </div>

              <div className="border-t border-powder-gray">
                <DropdownMenuItem
                  onClick={handleDeleteMenuClick}
                  className="px-4 py-3 cursor-pointer hover:bg-gray-50 gap-1.5"
                >
                  <Trash2 className="w-4 h-4 text-danger" />
                  <span className="text-danger font-semibold text-sm">Delete</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {showDeletePopover && (
        <Popover open={deletePopoverOpen} onOpenChange={handlePopoverClose}>
          <PopoverTrigger asChild>
            <Button
              ref={dropdownTriggerRef}
              variant="ghost"
              size="sm"
              className="w-5 h-5 p-0 opacity-0 pointer-events-none absolute"
              style={{
                position: "fixed",
                left: dropdownTriggerRef.current?.getBoundingClientRect().left || 0,
                top: dropdownTriggerRef.current?.getBoundingClientRect().top || 0,
                zIndex: -1,
              }}
            >
              <MoreVertical className="w-3 h-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 p-0"
            align="end"
            side="bottom"
            sideOffset={5}
            onEscapeKeyDown={() => handlePopoverClose()}
            onPointerDownOutside={() => handlePopoverClose()}
          >
            <div className="p-4">
              <h4 className="font-semibold text-content-active mb-2">Delete Page</h4>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete "{page.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={handlePopoverClose}>
                  Cancel
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDeleteClick}>
                  Delete
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </>
  )
}