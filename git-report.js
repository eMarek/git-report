const { execSync } = require('child_process')
const { lstatSync, readdirSync, writeFileSync } = require('fs')
const { join } = require('path')

const gitReport = 'git-report'
const dirname = '' // path to folder with repos
const author = '' // your email
const separator = ' | '

const isDirectory = source => lstatSync(source).isDirectory()
const getDirectories = source => readdirSync(source).filter(isDirectory)
const directories = getDirectories(dirname)

const leadingZero = month => String('00' + month).slice(-2)
const calcYearMonth = (year, month) => {
  let calcYear = year
  let calcMonth = month - 1
  if (calcMonth === 0) {
    calcYear = calcYear - 1
    calcMonth = 12
  }
  return {
    year: calcYear,
    month: calcMonth
  }
}
const year = new Date().getFullYear()
const month = new Date().getMonth() + 1
const { year: yearTo, month: monthTo } = calcYearMonth(year, month)
const { year: yearFrom, month: monthFrom } = calcYearMonth(yearTo, monthTo)
const prevMonth = `${yearFrom}-${leadingZero(monthFrom)}`
const thisMonth = `${yearTo}-${leadingZero(monthTo)}`
const after = `${prevMonth}-31 23:59`
const before = `${thisMonth}-31 23:59`

let allContent = ''

directories.forEach((directory, directoryIndex) => {
  const gitLogCommand = `git --git-dir='${dirname}${directory}/.git' log --author='${author}' --after='${after}' --before='${before}' --format='%h${separator}%ci${separator}%s' --no-merges --reverse --all`
  const gitLogContent = execSync(gitLogCommand).toString()
  if (gitLogContent) {
    if (allContent) {
      allContent += '\n\n'
    }
    
    const repoTitle = `${directory}--${gitReport}-${thisMonth}\n\n`
    const columnTitles = `Hash${separator}Time${separator}Message\n`

    allContent += repoTitle
    allContent += columnTitles
    allContent += gitLogContent
  }
})

const fileName = `${dirname}${gitReport}--${thisMonth}.csv`
writeFileSync(fileName, allContent)

console.log("SUCCESS!")
