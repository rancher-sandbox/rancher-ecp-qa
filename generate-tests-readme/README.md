# generate-tests-readme

This small tool is used to automatically generate a `README.md` file from QA tests.

It currently supports these frameworks/languages:
- Ginkgo(Gomega)/Go
- Cypress/Typescript
- BATS/Bash

You just have to copy the `generate-*` script files in some `scripts/` directory and add this in a Makefile:
```Makefile
# Generate tests description file
generate-cypress-readme:
    @./scripts/generate-readme tests > tests/README.md
```

To automate the update of the `README.md` file you can use the provided workflow templare.

Of course, you have to adapt the `Makefile` example as well as the workflow template to your needs!
Also, you can directly use the scripts without any `Makefile`/template, again just adapt all to your project!
