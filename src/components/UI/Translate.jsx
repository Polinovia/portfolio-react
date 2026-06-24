import React from 'react'
import { useTranslation } from '../../i18n/TranslationProvider'

export default function Translate({ path, children }) {
  const { t } = useTranslation()
  const text = t(path)
  return <>{text || children || path}</>
}
