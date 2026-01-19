## [1.10.3](https://github.com/neryangel/workflow-editor/compare/v1.10.2...v1.10.3) (2026-01-19)

### Bug Fixes

- add tolerance to flaky async timing test in CI ([1883adc](https://github.com/neryangel/workflow-editor/commit/1883adca7b65237b192c2a9f9f3993af2ceab054))

## [1.10.2](https://github.com/neryangel/workflow-editor/compare/v1.10.1...v1.10.2) (2026-01-19)

### Bug Fixes

- sync nodeRegistry with LLMNode - add 3 image inputs and fix connection handles ([19a12e0](https://github.com/neryangel/workflow-editor/commit/19a12e0c29a1f0702b53a74b9a7faff38ee19d4e))

## [1.10.1](https://github.com/neryangel/workflow-editor/compare/v1.10.0...v1.10.1) (2026-01-19)

### Bug Fixes

- resolve all ESLint warnings and cleanup unused code ([71eb87e](https://github.com/neryangel/workflow-editor/commit/71eb87ebd97172a688276a2e9bbd542b85a389b8))

# [1.10.0](https://github.com/neryangel/workflow-editor/compare/v1.9.1...v1.10.0) (2026-01-19)

### Features

- add multi-image support for LLM node ([b8bfd9b](https://github.com/neryangel/workflow-editor/commit/b8bfd9b60f3ab7613f02352ce73a0af55be93dd0))

## [1.9.1](https://github.com/neryangel/workflow-editor/compare/v1.9.0...v1.9.1) (2026-01-19)

### Bug Fixes

- update prompts to understand reference images for generation ([a070263](https://github.com/neryangel/workflow-editor/commit/a0702631f71e0fe6c896b2188bae172f3e13a55f))

# [1.9.0](https://github.com/neryangel/workflow-editor/compare/v1.8.1...v1.9.0) (2026-01-19)

### Features

- integrate prompt composer with persona system ([047b500](https://github.com/neryangel/workflow-editor/commit/047b5001126ca7b5c692bad378ca4a74023bf841))

## [1.8.1](https://github.com/neryangel/workflow-editor/compare/v1.8.0...v1.8.1) (2026-01-19)

### Bug Fixes

- correct Veo model names and fix executor tests ([6c706d1](https://github.com/neryangel/workflow-editor/commit/6c706d1d6f2c799d0a0bf1bfc3eb5076614f73e1))

# [1.8.0](https://github.com/neryangel/workflow-editor/compare/v1.7.0...v1.8.0) (2026-01-19)

### Features

- add video generation API with Veo 2/3/3.1 support ([a602b6d](https://github.com/neryangel/workflow-editor/commit/a602b6d530a357f0371c108d4f3fa23e4c14047c))

# [1.7.0](https://github.com/neryangel/workflow-editor/compare/v1.6.0...v1.7.0) (2026-01-19)

### Features

- enforce Google-First AI strategy (Jan 2026) ([60a9ab5](https://github.com/neryangel/workflow-editor/commit/60a9ab50a33640714b2d3a45399669882e57a6fb))
- integrate real APIs and add model selectors ([834a5e8](https://github.com/neryangel/workflow-editor/commit/834a5e85f4e04764676e9589703fc9cfb9e53ffe))

# [1.6.0](https://github.com/neryangel/workflow-editor/compare/v1.5.0...v1.6.0) (2026-01-19)

### Features

- implement AI model manager architecture ([eecdd61](https://github.com/neryangel/workflow-editor/commit/eecdd611a979194ce4384afc567af41e2e715347))

# [1.5.0](https://github.com/neryangel/workflow-editor/compare/v1.4.0...v1.5.0) (2026-01-19)

### Features

- add Vision support and real Image Generation API ([a66eab4](https://github.com/neryangel/workflow-editor/commit/a66eab4912be798b1119111370b82485adce72a3))

# [1.4.0](https://github.com/neryangel/workflow-editor/compare/v1.3.0...v1.4.0) (2026-01-19)

### Features

- add 5 complex workflow templates ([706df55](https://github.com/neryangel/workflow-editor/commit/706df5571204a410959a2a0d7ecd7787ddacd080))

# [1.3.0](https://github.com/neryangel/workflow-editor/compare/v1.2.0...v1.3.0) (2026-01-18)

### Features

- add SystemPrompt + Upscaler nodes, enhance Gen-4 and Gemini inputs ([9a16077](https://github.com/neryangel/workflow-editor/commit/9a160775aad165bae034525a396a31571ffaf89f))

# [1.2.0](https://github.com/neryangel/workflow-editor/compare/v1.1.0...v1.2.0) (2026-01-18)

### Features

- add multi-modal support to Gemini node (text + image input) ([a75918e](https://github.com/neryangel/workflow-editor/commit/a75918e1a641ccf1c5c524fe1ce4fdd9ebbec2c0))

# [1.1.0](https://github.com/neryangel/workflow-editor/compare/v1.0.0...v1.1.0) (2026-01-18)

### Features

- enterprise hardening - refactor WorkflowCanvas, add cancellation, fix race conditions ([9794eaf](https://github.com/neryangel/workflow-editor/commit/9794eaff618e20123f8bbc7ffb377332b0a7acd6))

# 1.0.0 (2026-01-18)

### Bug Fixes

- **ci:** upgrade Node.js to 22 for semantic-release, update Lighthouse action ([a271928](https://github.com/neryangel/workflow-editor/commit/a2719287a85b9ef40174e1fc550ac70bdb0391bc))
- redirect home page to workflow editor ([7385d33](https://github.com/neryangel/workflow-editor/commit/7385d331ecda6f6cfd0139660a3ab24bca35b8be))
- update Lighthouse pattern for Next.js 16 ([3e2548b](https://github.com/neryangel/workflow-editor/commit/3e2548b2e6da2ee7edbc103594fc24342c9ff767))

### Features

- add enterprise-grade features ([69bc659](https://github.com/neryangel/workflow-editor/commit/69bc659486304711824962a5a04cd62106ca80ed))
- add health check API and retry utility ([3ce5a92](https://github.com/neryangel/workflow-editor/commit/3ce5a924abaf88e5a156d271a1b62a5603f60f25))
- add i18n, OpenAPI spec, load testing, and more tests ([da29d9b](https://github.com/neryangel/workflow-editor/commit/da29d9b1b4be9792e22cef896ea502af89327e41))
- add logger and performance monitoring utilities ([0bab05f](https://github.com/neryangel/workflow-editor/commit/0bab05ff3fc2034f980ceb30f36edf955f5857fa))
- add rate limiter and API documentation ([246cccb](https://github.com/neryangel/workflow-editor/commit/246cccbe5addc273d12352287115b659619279fa))
- add security utilities ([813be29](https://github.com/neryangel/workflow-editor/commit/813be290e56bf0bfa178209d303714c2a4b337c1))
- add validation utilities ([1ac1b74](https://github.com/neryangel/workflow-editor/commit/1ac1b74e8e3785c6051b11c92b141b22e583a5d2))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Visual workflow editor with drag-and-drop node creation
- LLM, Image Generation, Video Generation nodes
- Extract Frame utility node
- Keyboard shortcuts (Undo/Redo, Save, Delete)
- Workflow save/load functionality
- Export/Import workflows as JSON
- PWA support for offline usage
- Accessibility testing with axe-core
- Comprehensive test suite (99+ tests)
- Docker containerization
- CI/CD pipeline with GitHub Actions
- Lighthouse performance audits
- Sentry error monitoring
- Security headers and Dependabot

### Security

- HSTS, XSS Protection, Content-Type-Options headers
- Zod validation on all API routes
- Dependabot for automated security updates
