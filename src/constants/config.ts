import minimist from 'minimist'

const argv = minimist(process.argv)
export const isProduction = Boolean(argv.production)
