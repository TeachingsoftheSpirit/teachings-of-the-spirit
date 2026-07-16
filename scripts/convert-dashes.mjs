import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const input = path.resolve(__dirname, '../data/quotes-raw.txt')
const output = path.resolve(__dirname, '../data/quotes-converted.txt')

let text = readFileSync(input, 'utf8')

text = text
  .replace(/\u201C/g, '"')
  .replace(/\u201D/g, '"')
  .replace(/\u2018/g, "'")
  .replace(/\u2019/g, "'")
  .replace(/\u2013/g, '-')
  .replace(/\u2014/g, '-')
  .replace(/â€œ/g, '"')
  .replace(/â€/g, '"')
  .replace(/â€™/g, "'")
  .replace(/â€“/g, '-')
  .replace(/â€”/g, '-')

text = text.replace(
  /"\s*-\s*"?([^"\n]+?)"?\s*[-–,]\s*([A-Za-z0-9.,\s]*?(?:19|20)\d{2})/g,
  '" ||| $1 ||| $2'
)

writeFileSync(output, text, 'utf8')
console.log('Converted file written to data/quotes-converted.txt')
