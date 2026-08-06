// ── Bio text ───────────────────────────────────
// Each string = one paragraph displayed in the card.
// You can add or remove paragraphs freely.
const BIO_PARAGRAPHS = [
  "I'm a 26-year-old front-end developer based in Namur, Belgium — with a soul caught somewhere between code and poetry. I see interfaces the way others see paintings: every pixel a brushstroke, every animation a breath of life.",
  "I love building things that feel as beautiful as they function. Writing code isn't just technical work for me — it's a form of expression, a way to turn invisible ideas into something people can actually touch and feel. When I'm not deep in a project, you'll find me lost in a book, drawing, or listening to music that makes the world feel a little bigger.",
]

export default function WhoAmI() {
  return (
    <div className="card" style={{ animation: 'cardIn 0.5s cubic-bezier(.22,1,.36,1) both' }}>

      {/* Bio paragraphs */}
      {BIO_PARAGRAPHS.map((paragraph, index) => (
        <p
          key={index}
          className="bio-text"
          style={index === BIO_PARAGRAPHS.length - 1 ? { marginBottom: 0 } : {}}
        >
          {paragraph}
        </p>
      ))}

    </div>
  )
}