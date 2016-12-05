#!/usr/bin/env node

require('commander')
  .version(require('../package').version)
  .usage('<command> [options]')
  .description(require('../package').description)
  .command('init', 'generate a new project from a template')
  .parse(process.argv)
