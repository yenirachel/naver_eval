import React, { useState } from 'react'
import { Button } from "@/components/ui/button"

interface ExpandedCellViewProps {
  header: string
  content: string
  onClose: () => void
  onSave: (newContent: string) => void
}

export const ExpandedCellView: React.FC<ExpandedCellViewProps> = ({ header, content, onClose, onSave }) => {
  const [editedContent, setEditedContent] = useState(content)

  const handleSave = () => {
    onSave(editedContent)
    onClose()
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 p-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold mb-2">{header}</h3>
      <textarea
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        className="w-full h-40 border rounded p-2 mb-4"
      />
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          취소
        </Button>
        <Button onClick={handleSave}>
          저장
        </Button>
      </div>
    </div>
  )
}

