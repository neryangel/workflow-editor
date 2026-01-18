# Visual Regression Testing

## Chromatic Setup (Optional)

For visual regression testing, you can integrate with [Chromatic](https://www.chromatic.com/):

### Installation

```bash
npm install -D chromatic @chromatic-com/storybook
```

### Configuration

```bash
npx chromatic --project-token=<your-token>
```

### CI Integration

Add to `.github/workflows/visual.yml`:

```yaml
name: Visual Tests
on: push
jobs:
    visual:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
              with:
                  fetch-depth: 0
            - run: npm ci
            - run: npx chromatic --project-token=${{ secrets.CHROMATIC_TOKEN }}
```

## Alternative: Percy

[Percy](https://percy.io/) is another option:

```bash
npm install -D @percy/cli @percy/playwright
npx percy exec -- playwright test
```

## Manual Visual Testing

Without external services, use Playwright screenshots:

```typescript
test('visual snapshot', async ({ page }) => {
    await page.goto('/workflows/new');
    await expect(page).toHaveScreenshot('editor.png');
});
```
