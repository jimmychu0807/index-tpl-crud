# index-tpl-crud

This package used to handle the `index.html` change for Parity projects that have their versioned
rustdocs published in GitHub Pages. An example is
[Substrate](https://github.com/paritytech/substrate), with the rustdocs deployed at its
[`gh-pages` branch](https://github.com/paritytech/substrate/tree/gh-pages).

## Help

```
Usage: index [options] [command]

Options:
  -V, --version                                 output the version number
  -h, --help                                    display help for command

Commands:
  init <ghRepo> <projectName> [outputPath]      initialize an index page
  upsert [options] <inputPath> <ref> [display]  upsert a REF into the index page
  rm [options] <inputPath> <ref>                remove a REF from the index page
  help [command]                                display help for command
```

## Usage

1. To generate a new `index.html`, run something like:

    ```
    index-tpl-crud init substrate Substrate index.html
    ```

    - `<ghRepo>`: Required. This is the name of the repository without the user /
      organization name. So for Substrate with URL at `https://github.com/paritytech/substrate`,
      use `substrate`.
    - `<projectName>`: Required. Project name it will display as.
    - `[outputPath]`: Optional. The output. If unspecified, it will be `index.html`.

2. To add a new version of rustdocs, run something like:

    ```
    index-tpl-crud upsert -l index.html monthly-2021-10
    ```

    - `-l`: Flag. Specified this ref has been aliased as `latest` as well.
    - `<inputPath>`: Required. The input file, where it read the html content, update them, and
      write to also.
    - `<ref>`: Required. The branch or tag of source where the rustdocs is built from.
    - `[display]`: Optional. The name of the link. If unspecified, it will use the value of `ref`.

3. To remove a version of rustdocs, run something like:

    ```
    index-tpl-crud rm index.html monthly-2021-10
    ```

    parameters similar to `upsert` sub-command.
