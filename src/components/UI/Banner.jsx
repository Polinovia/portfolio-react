import { useTranslation } from '../../i18n/TranslationProvider'

export default function Banner({ title, titleKey }) {
  const { t } = useTranslation()
  const text = title || (titleKey ? t(titleKey) : '')
  return (
    <div className="banner">
      {text}
    </div>
  )
}