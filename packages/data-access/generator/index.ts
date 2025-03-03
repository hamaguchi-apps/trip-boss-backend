import { program } from 'commander'
import { EntityGenerator } from '@mikro-orm/entity-generator'
import { MikroORM } from '@mikro-orm/postgresql'
import fs from 'fs/promises'

program
  .option('-d, --database <database>', 'database name', 'postgres')
  .option('-h, --host <host>', 'database host', 'localhost')
  .option('-p, --port <port>', 'database port', '5434')
  .option('-u, --user <user>', 'database user', 'postgres')
  .option('-w, --password <password>', 'database password', 'secretpgpassword')

program.parse()

const options = program.opts();

(async () => {
  const orm = await MikroORM.init({
    discovery: {
      // we need to disable validation for no entities
      warnWhenNoEntities: false,
    },
    extensions: [EntityGenerator],
    dbName: options.database,
    // debug: true,
    host: options.host,
    port: options.port,
    user: options.user,
    password: options.password,
    driverOptions: { connection: { ssl: false, timezone: '-03:00' } },
  })

  const map: Record<string, string> = {}
  const fileNames: Record<string, string> = {}
  const sourceFiles = await fs.readdir(process.cwd() + '/src/repositories', { recursive: true })
  const findRepository = (className: string) => {
    return sourceFiles.find(file => file.includes(`\\${className}Repository.ts`) || file.includes(`${className}Repository.ts`))
  }

  await orm.entityGenerator.generate({
    save: true,
    path: process.cwd() + '/out/entities/',
    skipTables: [/^hdb_.*$/i],
    fileName: (className: string) => {
      const name = `${map[className]}/${className}`
      fileNames[className] = name
      return name
    },
    onImport: (name, basePath, extension) => {
      return { path: `../${map[name]}/${name}${extension}`, name }
    },
    onProcessedMetadata: (metadata, platform) => {
      metadata.forEach(m => {
        map[m.className ?? ''] = m.schema ?? ''
        const repoPath = findRepository(m.className ?? '')

        if (repoPath) {
          console.warn('repo found for', m.className)
          const repoDir = repoPath.split('/').slice(0, -1).join('/')

          const repoClass = `${m.className}Repository`
          map[repoClass] = `../repositories/${repoDir}`
          m.repositoryClass = `${m.className}Repository`
        }
      })
    },
  })

  const imports = Object.entries(fileNames)
    .map(([key, value]) => {
      return `import { ${key} } from './${value}';`
    })
    .join('\n')

  await fs.writeFile(`${process.cwd()}/out/entities/index.ts`, `${imports}\n\nexport {\n\t${Object.keys(fileNames).join(',\n\t')}\n}\n`)

  await orm.close(true)
})()
