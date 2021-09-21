const randSuffixLen = 8
const letters = 'abcdefghijklmnopqrstuvwxyz'

export function makeK8sName(prefix) {
  let name = ''
  if (typeof prefix === 'string' && prefix.length > 0) {
    name = prefix + '-'
  }

  for (let i = 0; i < randSuffixLen; i++) {
    name += letters[Math.floor(Math.random() * letters.length)]
  }

  return name
}
