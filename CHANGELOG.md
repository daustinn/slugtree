# Changelog

## [0.9.0](https://github.com/daustinn/slugtree/compare/slugtree-v0.8.0...slugtree-v0.9.0) (2026-08-09)


### Features

* treat folders with href as page-like nodes in getPageNodes, pagination and search ([f975008](https://github.com/daustinn/slugtree/commit/f975008e59a3620f683da753e998c0e9d32d7448))

## [0.8.0](https://github.com/daustinn/slugtree/compare/slugtree-v0.7.0...slugtree-v0.8.0) (2026-08-06)


### Features

* export slugify function and handle diacritics ([bd5ccc3](https://github.com/daustinn/slugtree/commit/bd5ccc38d963dc80d31061711eec13a38eb23a24))

## [0.7.0](https://github.com/daustinn/slugtree/compare/slugtree-v0.6.3...slugtree-v0.7.0) (2026-08-06)


### Features

* support custom href in MDX frontmatter to override auto-generated href ([39f702d](https://github.com/daustinn/slugtree/commit/39f702db84ced632edeb4cba1d94f96f48d76e9e))


### Bug Fixes

* rewrite getNodeLabel with ancestor chain to prevent infinite loop ([7c73e01](https://github.com/daustinn/slugtree/commit/7c73e01c8f10e4174d8e37eb5bb81d9ab29026e5))

## [0.6.3](https://github.com/daustinn/slugtree/compare/slugtree-v0.6.2...slugtree-v0.6.3) (2026-08-06)


### Bug Fixes

* improve getNodeLabel to bubble up through ancestors and add scope param ([10e1519](https://github.com/daustinn/slugtree/commit/10e1519e35e7c39fad03046a52a0cc736775f1d3))

## [0.6.2](https://github.com/daustinn/slugtree/compare/slugtree-v0.6.1...slugtree-v0.6.2) (2026-08-05)


### Bug Fixes

* add getNodeLabel to retrieve the nearest preceding label for a slug ([277063e](https://github.com/daustinn/slugtree/commit/277063e721a7606e29a70394addf12cde799b087))

## [0.6.1](https://github.com/daustinn/slugtree/compare/slugtree-v0.6.0...slugtree-v0.6.1) (2026-08-05)


### Bug Fixes

* **astro:** resolve HMR infinite loop and vite optimization errors ([8cef61e](https://github.com/daustinn/slugtree/commit/8cef61e753c514bcec3b3b95a2806a2a88ae4d89))
* **core:** add .md extension support alongside .mdx ([05ccbcd](https://github.com/daustinn/slugtree/commit/05ccbcd9a864bc3988e625abcf897518c25be7d5))
* **deps:** configure workspaces and add vite devDependency ([31b062e](https://github.com/daustinn/slugtree/commit/31b062ec84781583d3be99380f9be5c0239682ba))

## [0.6.0](https://github.com/daustinn/slugtree/compare/slugtree-v0.5.1...slugtree-v0.6.0) (2026-08-05)


### Features

* add astro integration ([dec0c92](https://github.com/daustinn/slugtree/commit/dec0c92085a123cde1a659c1243417e5d6685819))
* update client provider ([2d91e4a](https://github.com/daustinn/slugtree/commit/2d91e4a5d616c9c66f56b1a6bd3a794680f4a3b1))
* update server ([afb1dd6](https://github.com/daustinn/slugtree/commit/afb1dd627db7b5b71113b3a74a6354791140c70c))


### Bug Fixes

* resolve no-explicit-any lint error in astro.ts and ignore prof/ in eslint ([8f6e8e5](https://github.com/daustinn/slugtree/commit/8f6e8e56d91738e7657964e6aa13ccc55df96964))
* update parser ([447e071](https://github.com/daustinn/slugtree/commit/447e071fcda909d3cd07f973011f3cf70341c7d1))

## [0.5.1](https://github.com/daustinn/slugtree/compare/slugtree-v0.5.0...slugtree-v0.5.1) (2026-06-06)


### Bug Fixes

* resolve eslint vitest race condition and merge publish workflow ([84e53ec](https://github.com/daustinn/slugtree/commit/84e53ec1a4d6f5a15dd97d5200673961a8bdbc82))
* update release workflow to streamline job conditions and outputs ([ebff86c](https://github.com/daustinn/slugtree/commit/ebff86c22305d700acb21f228fe404a3d5abb147))

## [0.5.0](https://github.com/daustinn/slugtree/compare/slugtree-v0.4.0...slugtree-v0.5.0) (2026-06-06)


### Features

* add ArrowOutward icon component to icons ([47cdb7a](https://github.com/daustinn/slugtree/commit/47cdb7a9a45ef92ca533d8d2dc8c6f8982307270))
* add automated release workflow for versioning and NPM publishing ([8b81185](https://github.com/daustinn/slugtree/commit/8b811856033ac948cd0acf2a5772f7afeea1c8fc))
* add icon support in parser.ts and related types ([47cdb7a](https://github.com/daustinn/slugtree/commit/47cdb7a9a45ef92ca533d8d2dc8c6f8982307270))
* define core interface types for slugtree node structure and navigation ([f4ec5de](https://github.com/daustinn/slugtree/commit/f4ec5deaeda814f794879e1d6302e71a17984e3e))
* enhance folder node structure with icon support in builder.ts ([47cdb7a](https://github.com/daustinn/slugtree/commit/47cdb7a9a45ef92ca533d8d2dc8c6f8982307270))
* implement content generation and dev-mode file watcher for slugtree plugin ([64c8165](https://github.com/daustinn/slugtree/commit/64c8165b7168bee9d6bae8a803590e6506a78684))
* implement server-side navigation and metadata query utilities with CI/CD workflows ([c712466](https://github.com/daustinn/slugtree/commit/c712466e5a9bc080ada2c4ba2a2f9f2d7d2bff79))
* include icon in search results and breadcrumbs in server.ts ([47cdb7a](https://github.com/daustinn/slugtree/commit/47cdb7a9a45ef92ca533d8d2dc8c6f8982307270))
* initialize marketing website with documentation routes, metadata configuration, and updated project build settings ([bafe163](https://github.com/daustinn/slugtree/commit/bafe1633517f1cc002d932d0b4a3db66101240ed))
* initialize slugtree package with core content generation logic, React provider, and documentation website ([c81b432](https://github.com/daustinn/slugtree/commit/c81b4329db04dc6d0103abfa033d3bcbf7de84df))


### Bug Fixes

* improve block code component for better overflow handling ([47cdb7a](https://github.com/daustinn/slugtree/commit/47cdb7a9a45ef92ca533d8d2dc8c6f8982307270))
* improve content generation logic in generator.ts ([47cdb7a](https://github.com/daustinn/slugtree/commit/47cdb7a9a45ef92ca533d8d2dc8c6f8982307270))
* revert version number to 0.3.0 in package.json ([7b7771e](https://github.com/daustinn/slugtree/commit/7b7771e34a1d21afae0d51cc49433ec0030dadde))
* uncomment NPM publish step in release workflow ([d325e70](https://github.com/daustinn/slugtree/commit/d325e70d045f5a3899a71aaa1194c0ead858b9a0))
* update documentation links to reflect new structure in various mdx files ([47cdb7a](https://github.com/daustinn/slugtree/commit/47cdb7a9a45ef92ca533d8d2dc8c6f8982307270))
* update README notes ([42ba5dc](https://github.com/daustinn/slugtree/commit/42ba5dc0937cd73152419b68f0dc07bf5f33840f))

## [0.4.0](https://github.com/daustinn/slugtree/compare/slugtree-v0.3.0...slugtree-v0.4.0) (2026-06-06)


### Features

* add ArrowOutward icon component to icons ([47cdb7a](https://github.com/daustinn/slugtree/commit/47cdb7a9a45ef92ca533d8d2dc8c6f8982307270))
* add automated release workflow for versioning and NPM publishing ([8b81185](https://github.com/daustinn/slugtree/commit/8b811856033ac948cd0acf2a5772f7afeea1c8fc))
* add icon support in parser.ts and related types ([47cdb7a](https://github.com/daustinn/slugtree/commit/47cdb7a9a45ef92ca533d8d2dc8c6f8982307270))
* define core interface types for slugtree node structure and navigation ([f4ec5de](https://github.com/daustinn/slugtree/commit/f4ec5deaeda814f794879e1d6302e71a17984e3e))
* enhance folder node structure with icon support in builder.ts ([47cdb7a](https://github.com/daustinn/slugtree/commit/47cdb7a9a45ef92ca533d8d2dc8c6f8982307270))
* implement content generation and dev-mode file watcher for slugtree plugin ([64c8165](https://github.com/daustinn/slugtree/commit/64c8165b7168bee9d6bae8a803590e6506a78684))
* implement server-side navigation and metadata query utilities with CI/CD workflows ([c712466](https://github.com/daustinn/slugtree/commit/c712466e5a9bc080ada2c4ba2a2f9f2d7d2bff79))
* include icon in search results and breadcrumbs in server.ts ([47cdb7a](https://github.com/daustinn/slugtree/commit/47cdb7a9a45ef92ca533d8d2dc8c6f8982307270))
* initialize marketing website with documentation routes, metadata configuration, and updated project build settings ([bafe163](https://github.com/daustinn/slugtree/commit/bafe1633517f1cc002d932d0b4a3db66101240ed))
* initialize slugtree package with core content generation logic, React provider, and documentation website ([c81b432](https://github.com/daustinn/slugtree/commit/c81b4329db04dc6d0103abfa033d3bcbf7de84df))


### Bug Fixes

* improve block code component for better overflow handling ([47cdb7a](https://github.com/daustinn/slugtree/commit/47cdb7a9a45ef92ca533d8d2dc8c6f8982307270))
* improve content generation logic in generator.ts ([47cdb7a](https://github.com/daustinn/slugtree/commit/47cdb7a9a45ef92ca533d8d2dc8c6f8982307270))
* uncomment NPM publish step in release workflow ([d325e70](https://github.com/daustinn/slugtree/commit/d325e70d045f5a3899a71aaa1194c0ead858b9a0))
* update documentation links to reflect new structure in various mdx files ([47cdb7a](https://github.com/daustinn/slugtree/commit/47cdb7a9a45ef92ca533d8d2dc8c6f8982307270))
* update README notes ([42ba5dc](https://github.com/daustinn/slugtree/commit/42ba5dc0937cd73152419b68f0dc07bf5f33840f))

## [0.3.0](https://github.com/daustinn/slugtree/compare/slugtree-v0.2.0...slugtree-v0.3.0) (2026-06-04)


### Features

* implement content generation and dev-mode file watcher for slugtree plugin ([64c8165](https://github.com/daustinn/slugtree/commit/64c8165b7168bee9d6bae8a803590e6506a78684))

## [0.2.0](https://github.com/daustinn/slugtree/compare/slugtree-v0.1.0...slugtree-v0.2.0) (2026-06-04)


### Features

* add automated release workflow for versioning and NPM publishing ([8b81185](https://github.com/daustinn/slugtree/commit/8b811856033ac948cd0acf2a5772f7afeea1c8fc))
* implement server-side navigation and metadata query utilities with CI/CD workflows ([c712466](https://github.com/daustinn/slugtree/commit/c712466e5a9bc080ada2c4ba2a2f9f2d7d2bff79))
* initialize marketing website with documentation routes, metadata configuration, and updated project build settings ([bafe163](https://github.com/daustinn/slugtree/commit/bafe1633517f1cc002d932d0b4a3db66101240ed))
* initialize slugtree package with core content generation logic, React provider, and documentation website ([c81b432](https://github.com/daustinn/slugtree/commit/c81b4329db04dc6d0103abfa033d3bcbf7de84df))


### Bug Fixes

* update README notes ([42ba5dc](https://github.com/daustinn/slugtree/commit/42ba5dc0937cd73152419b68f0dc07bf5f33840f))
