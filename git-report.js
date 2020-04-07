const { execSync } = require('child_process')
const { lstatSync, readdirSync, writeFileSync } = require('fs')
const { join } = require('path')
const fs = require('fs')

const dirname = '' // path to folder with repos
const reportsFolder = '' // folder name with reports
const reportFileName = '' // file name of report
const author = '' // your email
const separator = ' | '

const ignoreDirectories = ['.vscode']
const isDirectory = source => lstatSync(source).isDirectory() && !ignoreDirectories.includes(source)
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

console.log("STARTED!")

let allContent = ''

directories.forEach((directory, directoryIndex) => {
  const gitDirectory = `${dirname}${directory}/.git`
  if (!fs.existsSync(gitDirectory)) {
    console.log(`IGNORED ${directory} - no git`)
    return
  }
  const gitLogCommand = `git --git-dir='${gitDirectory}' log --author='${author}' --after='${after}' --before='${before}' --format='%h${separator}%ci${separator}%s' --no-merges --reverse --all`
  const gitLogContent = execSync(gitLogCommand).toString()
  if (gitLogContent) {
    if (allContent) {
      allContent += '\n\n'
    }
    
    const repoTitle = `${directory}--${reportFileName}-${thisMonth}\n\n`
    const columnTitles = `Hash${separator}Time${separator}Message\n`

    allContent += repoTitle
    allContent += columnTitles
    allContent += gitLogContent
  }
  console.log(`PROCESSED ${directory}`)
})

const reportFullPath = `${dirname}${reportsFolder}/${reportFileName}--${thisMonth}.csv`
writeFileSync(reportFullPath, allContent)

console.log("SUCCESS!")
console.log(reportFullPath)
