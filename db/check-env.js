// Manual check for which environment the app resolves to - run this after
// editing .env / .env.local to confirm NODE_ENV and isProduction() line up.
// Run: `node db/check-env.js` (loads .env.local) or
//      `node db/check-env.js .env` to check a different file.
const path = require('path')

const envFile = process.argv[2] || '.env.local'
require('dotenv').config({ path: path.join(__dirname, '..', envFile) })

const { isProduction } = require('../netlify/functions/_db')

console.log(`Loaded ${envFile}`)
console.log(`NODE_ENV = ${process.env.NODE_ENV || '(unset)'}`)
console.log(`isProduction() = ${isProduction}`)
