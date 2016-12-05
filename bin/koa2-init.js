#!/usr/bin/env node

const download = require('download-git-repo')
const program = require('commander')
const exists = require('fs').existsSync
const os = require('os')
const path = require('path')
const rm = require('rimraf').sync
const uid = require('uid')
const ora = require('ora')
const chalk = require('chalk')
const inquirer = require('inquirer')
const Metalsmith = require('metalsmith')

/**
 * Usage.
 */

program
  .usage('<template-name> [project-name]')
  .option('-c, --clone', 'use git clone')

/**
 * Help
 */

program
  .on('--help', () => {
    console.log('  Examples:')
    console.log()
    console.log(chalk.gray('    # create a new project with an official template'))
    console.log('    $ react init webpack my-project')
    console.log()
    console.log(chalk.gray('    # create a new project straight from a github template'))
    console.log('    $ react init username/repo my-project')
    console.log()
  })

/**
 * Help.
 */
function help () {
  program.parse(process.argv)
  if (program.args.length < 1) {
    return program.help()
  }
}

help()

/**
 * Padding.
 */

console.log()
process.on('exit', function () {
  console.log()
})

/**
 * Settings.
 */
const template = program.args[0]
const hasSlash = template.includes('/')
const rawName = program.args[1]
const inPlace = !rawName || rawName === '.'
// const name = inPlace ? path.relative('../', process.cwd()) : rawName
const to = path.resolve(rawName || '.')
const clone = program.clone || false

if (exists(to)) {
  inquirer.prompt([{
    type: 'confirm',
    message: inPlace
      ? 'Generate project in current directory?'
      : 'Target directory exists. Continue?',
    name: 'ok'
  }], function (answers) {
    if (answers.ok) {
      run()
    } else {
      process.on('exit', () => {
        console.og('Exit')
      })
    }
  })
} else {
  run()
}

/**
 * Check, download and generate the project.
 */

function run () {
  // check if template is local
  if (/^[./]/.test(template)) {
    console.error('Local template "%s" not support')
  } else {
    if (!hasSlash) {
      // use ly template
      let officialTemplate = `fengyun2/${template}#dev`
      if (template.indexOf('#') !== -1) {
        downloadAndGenerate(officialTemplate)
      } else {
        downloadAndGenerate(officialTemplate)
      }
    } else {
      downloadAndGenerate(template)
    }
  }
}

/**
 * Download a generate from a template repo.
 *
 * @param {String} template
 */

function downloadAndGenerate (template) {
  const tmp = `${os.tmpdir()}/react-template-${uid()}`
  const spinner = ora('downloading template')

  spinner.start()
  download(template, tmp, { clone: clone }, err => {
    spinner.stop()
    process.on('exit', () => {
      rm(tmp)
    })
    if (err) {
      return console.error(`Failed to download repo ${template}: ${err.message.trim()}`)
    }
    generate(tmp, to, err => {
      if (err) {
        return console.error(`Copy ${tmp} to ${to} Error: ${err}`)
      }
      console.log()
      console.log('    To get started:')
      console.log()
      console.log(`      $ cd ${program.args[0]}`)
      console.log('      npm install')
      console.log('      npm run dev')
      console.log()
      console.log('    Documentation can be found at https://github.com/ly2011/react-cli')
    })
  })
}

function generate (src, dest, done) {
  let metalsmith = Metalsmith(src)

  metalsmith
    .clean(true)
    .source('.')
    .destination(dest)
    .build(function (err) {
      done(err)
    })
}
