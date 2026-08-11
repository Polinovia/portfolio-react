// Neon's `neon()` driver talks to Neon's HTTP proxy and doesn't work against
// a plain local Postgres (e.g. the docker-compose dev database). When
// DATABASE_URL points at localhost, fall back to a real `pg` connection with
// a small wrapper that mimics neon()'s tagged-template call shape
// (`sql\`select ...\`` returning rows directly), so every call site in
// ratings-*.js / recommendations-*.js works unchanged against either driver.
const isLocal = /\b(localhost|127\.0\.0\.1)\b/.test(process.env.DATABASE_URL || '')
const isProduction = process.env.NODE_ENV === 'production'

let sql

if (isLocal) {
  const { Pool } = require('pg')
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })

  sql = async (strings, ...values) => {
    let text = strings[0]
    for (let i = 0; i < values.length; i++) {
      text += `$${i + 1}${strings[i + 1]}`
    }
    const { rows } = await pool.query(text, values)
    return rows
  }
} else {
  const { neon } = require('@neondatabase/serverless')
  sql = neon(process.env.DATABASE_URL)
}

module.exports = { sql, isProduction, isLocal }
