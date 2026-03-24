import Tag from '../components/UI/Tag'

// ── Bio text ───────────────────────────────────
// Each string = one paragraph displayed in the card.
// You can add or remove paragraphs freely.
const BIO_PARAGRAPHS = [
  "I'm a 23-year-old front-end developer based in Namur, Belgium — with a soul caught somewhere between code and poetry. I see interfaces the way others see paintings: every pixel a brushstroke, every animation a breath of life.",
  "I love building things that feel as beautiful as they function. Writing code isn't just technical work for me — it's a form of expression, a way to turn invisible ideas into something people can actually touch and feel. When I'm not deep in a project, you'll find me lost in a book, drawing, or listening to music that makes the world feel a little bigger.",
]

// ── Skill tags ─────────────────────────────────
// Each string = one tag shown below the bio.
// Add or remove skills as you grow!
const SKILLS = [
  'Front-end Dev',
  'Figma',
  'WordPress',
  'PHP',
  'React',
  'CSS Animation',
]

export default function WhoAmI() {
  return (
    <div className="card" style={{ animation: 'cardIn 0.5s cubic-bezier(.22,1,.36,1) both' }}>

      {/* Bio paragraphs */}
      {BIO_PARAGRAPHS.map((paragraph, index) => (
        <p
          key={index}
          className="bio-text"
          // Last paragraph has extra bottom margin before the tags
          style={index === BIO_PARAGRAPHS.length - 1 ? { marginBottom: '20px' } : {}}
        >
          {paragraph}
        </p>
      ))}

      {/* Skill tags */}
      <div className="tags">
        {SKILLS.map(skill => (
          <Tag key={skill} label={skill} />
        ))}
      </div>

    </div>
  )
}