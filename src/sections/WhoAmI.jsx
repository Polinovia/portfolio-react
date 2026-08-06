import { useTranslation } from '../i18n/TranslationProvider'

export default function WhoAmI() {
  const { t } = useTranslation()
  const bioParagraphs = t('bio')

  return (
    <div className="card" style={{ animation: 'cardIn 0.5s cubic-bezier(.22,1,.36,1) both' }}>

      {/* Bio paragraphs */}
      {bioParagraphs.map((paragraph, index) => (
        <p
          key={index}
          className="bio-text"
          style={index === bioParagraphs.length - 1 ? { marginBottom: 0 } : {}}
        >
          {paragraph}
        </p>
      ))}

    </div>
  )
}