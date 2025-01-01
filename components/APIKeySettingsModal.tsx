import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface APIKeySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keys: APIKeys) => void;
  initialKeys: APIKeys;
}

export interface APIKeys {
  OPENAI_API_KEY: string;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  [key: string]: string;
}

export function APIKeySettingsModal({ isOpen, onClose, onSave, initialKeys }: APIKeySettingsModalProps) {
  const [keys, setKeys] = useState<APIKeys>(initialKeys);

  useEffect(() => {
    setKeys(initialKeys);
  }, [initialKeys])

  const handleSave = () => {
    onSave(keys)
  }

  const isInitialSetup = !initialKeys.OPENAI_API_KEY && !initialKeys.CLIENT_ID && !initialKeys.CLIENT_SECRET;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{'API 키 설정'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="openaiKey" className="text-right">
              OpenAI API Key
            </Label>
            <Input
              id="openaiKey"
              value={keys.OPENAI_API_KEY}
              onChange={(e) => setKeys({ ...keys, OPENAI_API_KEY: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="clientId" className="text-right">
              Client ID
            </Label>
            <Input
              id="clientId"
              value={keys.CLIENT_ID}
              onChange={(e) => setKeys({ ...keys, CLIENT_ID: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="clientSecret" className="text-right">
              Client Secret
            </Label>
            <Input
              id="clientSecret"
              value={keys.CLIENT_SECRET}
              onChange={(e) => setKeys({ ...keys, CLIENT_SECRET: e.target.value })}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>{isInitialSetup ? '설정' : '저장'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

