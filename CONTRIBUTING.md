# Contributing to Workflow Editor

Thank you for contributing! 🎉

## Development Setup

```bash
git clone <repo>
cd workflow-editor
npm install
npm run dev
```

## Commit Convention

We use [Conventional Commits](https://conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation
style: formatting
refactor: code improvement
test: tests
chore: maintenance
```

Examples:

```bash
git commit -m "feat: add video generation node"
git commit -m "fix: resolve canvas zoom issue"
git commit -m "docs: update README"
```

## Pre-commit Hooks

Husky runs automatically:

- **ESLint** - Code quality
- **Prettier** - Formatting
- **Commitlint** - Commit message validation

## Testing

```bash
npm run test:unit  # Before committing
npm run test:e2e   # For UI changes
```

## Pull Request Process

1. Create feature branch from `main`
2. Write tests for new features
3. Ensure all tests pass
4. Update documentation if needed
5. Open PR with clear description
