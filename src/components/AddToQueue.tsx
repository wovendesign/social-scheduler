'use client'
import type { ClientComponentProps } from 'payload'

import { Button, useDocumentInfo } from '@payloadcms/ui'

export function ScheduleButton(props: ClientComponentProps) {
  const { id } = useDocumentInfo()
  return (
    <Button
      onClick={async () => {
        await fetch(`/api/plugin-collection/${id}/schedule`, {
          body: JSON.stringify({
            date: new Date().toISOString(),
          }),
          method: 'POST',
        })
      }}
    >
      Publish Newsletter?
    </Button>
  )
}
