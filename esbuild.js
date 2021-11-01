const fs = require('fs');

const jsdomPatch = {
  name: 'jsdom-patch',
  setup(build) {
    build.onLoad({ filter: /jsdom\/living\/xhr\/XMLHttpRequest-impl\.js$/ }, async args => {
      let contents = await fs.promises.readFile(args.path, 'utf8');

      contents = contents.replace(
        'const syncWorkerFile = require.resolve ? require.resolve("./xhr-sync-worker.js") : null;',
        `const syncWorkerFile = "${require.resolve('jsdom/lib/jsdom/living/xhr/xhr-sync-worker.js')}";`,
      );

      return { contents, loader: 'js' };
    });
  },
};

require('esbuild').build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  platform: 'node',
  target: 'node14',
  sourcemap: 'external',
  outdir: 'dist/esbuild',
  plugins: [jsdomPatch],
  external: ['canvas'],
  assetNames: '[dir]/[name]',
  loader: {
    '.ejs': 'file',
  }
})
  .catch(() => process.exit(1))
