import { Command } from 'commander'
import { generateIndex } from './lib'

const program = new Command()
program.version('1.0.0')

program
  .command('init <ghRepo> <projectName> [outputPath]')
  .description('initialize an index page')
  .action((ghRepo: string, projectName: string, outputPath: string) => {
    outputPath ||= 'index.html'
    generateIndex(ghRepo, projectName, outputPath)
  })

program
  .command('upsert <inputPath> <ref> [display]')
  .description('upsert a REF into the index page')
  .action((inputPath: string, ref: string, display: string) => {
    console.log(`upsert cmd called ${inputPath}, ${ref}, ${display}`)
  })

program
  .command('rm <inputPath> <ref>')
  .description('remove a REF from the index page')
  .action((inputPath: string, ref: string, display: string) => {
    console.log(`rm cmd called ${inputPath}, ${ref}`)
  })

program.parse(process.argv)
