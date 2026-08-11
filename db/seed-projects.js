// Upserts the real project catalog into Neon (or whichever DATABASE_URL is
// configured). Unlike db/seed.js, this only touches the `projects` table via
// an idempotent upsert - no truncate, and it never touches
// project_ratings/recommendations (those are dev-only fixtures; real
// reviews should come from actual visitors, not from a seed script).
// Run: `pnpm db:seed:projects` (loads .env, i.e. Neon, by default) or
//      `node db/seed-projects.js .env.local` to target another env file.
const path = require('path')
const { Client } = require('pg')

const envFile = process.argv[2] || '.env'
require('dotenv').config({ path: path.join(__dirname, '..', envFile) })

const databaseUrl = process.env.DATABASE_URL || ''
if (!databaseUrl) {
  console.error(`Refusing to seed: no DATABASE_URL found in ${envFile}.`)
  process.exit(1)
}

async function main() {
  const client = new Client({ connectionString: databaseUrl })
  await client.connect()

  await client.query(`
    create table if not exists projects (
      slug         text primary key,
      name         text not null,
      tech         text not null,
      description  text not null,
      category     text not null check (category in ('dev', 'design')),
      folder       text not null,
      url          text not null,
      preview_url  text,
      figma_url    text,
      image        text,
      sort_order   integer not null
    )
  `)

  await client.query(`
    insert into projects (slug, name, tech, description, category, folder, url, preview_url, figma_url, image, sort_order) values
      ('who-where-what', 'Who Where What', 'TypeScript · Browser Game · EN/FR', 'A multilingual (EN/FR) browser game where friends build an absurd story together, designed from scratch in Figma before being coded and deployed.', 'dev', 'TypeScript', 'https://github.com/Polinovia/who-where-what', 'https://who-where-what.netlify.app/', 'https://www.figma.com/design/sqG49YO6i4XueFX4IuenbF/who--where--what-?node-id=19-334&t=YS4YU5ueKN3VzMLW-1', '/assets/projects/whowherewhat.webp', 1),
      ('nezzen', 'NezZen', 'Figma · UI Design', 'New UI design proposal for the NezZen product, built and iterated on in Figma.', 'design', 'Figma', 'https://www.figma.com/design/9FhPm5Ric9S2FQj2Syr1J6/NezZen?node-id=0-1&t=6BQBuoPJaaO8kriO-1', null, null, '/assets/projects/nezzen.png', 2),
      ('portfolio-figma', 'Portfolio', 'Figma · UI Design', 'Figma design mockups for this very portfolio, before it became a React app.', 'design', 'Figma', 'https://www.figma.com/design/a3iytrjfRqUQUAZfDZg4Mq/Portfolio?node-id=0-1&t=UVWcuWniWx7Z3pIY-1', null, null, '/assets/projects/portfolio-figma.png', 3),
      ('15-05', '15.05', 'JavaScript · Interaction', 'A small JavaScript exercise focused on DOM manipulation and interactivity.', 'dev', 'JavaScript', 'https://github.com/Polinovia/15.05', null, null, null, 4),
      ('airport', 'airport', 'React · API · UI', 'A React app that browses flights via a public API with a clean, responsive UI.', 'dev', 'React', 'https://github.com/Polinovia/airport', null, null, '/assets/projects/airport.png', 5),
      ('articles-vue', 'articles-vue', 'Vue · Content · Articles', 'A Vue app for browsing and reading articles, with a focus on content layout.', 'dev', 'Vue', 'https://github.com/Polinovia/articles-vue', 'https://pwa-vue-polina.netlify.app/', null, null, 6),
      ('exercice-front', 'exercice-front', 'JavaScript · Game · UI', 'A small JavaScript game exercise built to practice logic and UI state.', 'dev', 'JavaScript', 'https://github.com/Polinovia/exercice-front', 'https://jeuphrasesbevz.netlify.app/', null, '/assets/projects/exercice-front.png', 7),
      ('front-quiestla', 'front_quiestla', 'Vue · Responsive · UI', 'A responsive Vue front-end built around a "who is it" style UI.', 'dev', 'Vue', 'https://github.com/Polinovia/front_quiestla', 'https://quiestla-polina.netlify.app/', null, '/assets/projects/front_quiestla.png', 8),
      ('jamstack-nuxt', 'jamstack-nuxt', 'Nuxt · Jamstack · Static', 'A statically generated Jamstack site built with Nuxt.', 'dev', 'Nuxt', 'https://github.com/Polinovia/jamstack-nuxt', 'https://nuxtdyn.netlify.app/', null, '/assets/projects/jamstack-nuxt.png', 9),
      ('my-nuxt-auth', 'my-nuxt-auth', 'Nuxt · Auth · SSR', 'A Nuxt app exploring server-side rendering with authenticated routes.', 'dev', 'Nuxt', 'https://github.com/Polinovia/my-nuxt-auth', 'https://courir-ex.netlify.app/', null, '/assets/projects/my-nuxt-auth.png', 10),
      ('plan-culture-front', 'plan-culture-front', 'Vue · Planning · UI', 'A Vue front-end for planning crops and tracking plant harvests.', 'dev', 'Vue', 'https://github.com/Polinovia/plan-culture-front', null, null, null, 11),
      ('urbex-project-front', 'Urbex-Project-FRONT', 'Vue · Exploration Game · Group Project', 'A Vue exploration game where players discover and navigate abandoned urban sites - built as a team project at the end of our formation.', 'dev', 'Vue', 'https://github.com/mplscrummaster/Urbex-Project-FRONT', null, null, '/assets/projects/urbex-project-front.png', 12),
      ('notif-avec-vue', 'notif_avec_vue', 'Vue · Notifications · UI', 'A Vue app demonstrating a real-time notification system and UI.', 'dev', 'Vue', 'https://github.com/Polinovia/notif_avec_vue', null, null, null, 13),
      ('php-demo', 'php-demo', 'PHP · Demo · Backend', 'A small PHP backend demo covering basic server-side logic.', 'dev', 'PHP', 'https://github.com/Polinovia/php-demo', null, null, null, 14),
      ('react-practice', 'React', 'React · Web App', 'A React practice repo used to explore components, hooks and routing.', 'dev', 'React', 'https://github.com/Polinovia/React', null, null, null, 15),
      ('wf12-pwa-bpi', 'wf12-pwa-bpi', 'PWA · Service Workers · Offline', 'A Progressive Web App with offline support via service workers.', 'dev', 'PWA', 'https://github.com/Polinovia/wf12-pwa-bpi', 'https://wf12-pwa-bpi.netlify.app/', null, null, 16)
    on conflict (slug) do update set
      name = excluded.name,
      tech = excluded.tech,
      description = excluded.description,
      category = excluded.category,
      folder = excluded.folder,
      url = excluded.url,
      preview_url = excluded.preview_url,
      figma_url = excluded.figma_url,
      image = excluded.image,
      sort_order = excluded.sort_order
  `)

  const target = databaseUrl.replace(/:\/\/[^@]*@/, '://***@')
  console.log(`Seeded projects table (${envFile} -> ${target}).`)
  await client.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
