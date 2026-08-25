#!/usr/bin/env node
/**
 * Migrates components from static colors import to useThemedStyles/useTheme.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '../src');

const SKIP_FILES = new Set([
  path.join(SRC, 'styles/colors.js'),
  path.join(SRC, 'theme/lightTheme.js'),
  path.join(SRC, 'theme/darkTheme.js'),
  path.join(SRC, 'theme/buildTheme.js'),
  path.join(SRC, 'theme/accentPresets.js'),
  path.join(SRC, 'theme/ThemeContext.js'),
  path.join(SRC, 'theme/useThemedStyles.js'),
  path.join(SRC, 'screens/authorized/AppearanceScreen.js'),
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (entry.name.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

function getRelativeThemeImport(filePath, target) {
  const dir = path.dirname(filePath);
  let rel = path.relative(dir, path.join(SRC, target)).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return rel.replace(/\.js$/, '');
}

function usesColorsOutsideStyles(content) {
  const withoutStyles = content.replace(
    /const\s+styles\s*=\s*StyleSheet\.create\([\s\S]*?\n\}\);/g,
    '',
  );
  return /\bcolors\./.test(withoutStyles);
}

function migrateFile(filePath) {
  if (SKIP_FILES.has(filePath)) return false;

  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes("styles/colors")) return false;
  if (content.includes('useThemedStyles')) return false;

  const themedStylesImport = getRelativeThemeImport(filePath, 'theme/useThemedStyles.js');
  const themeContextImport = getRelativeThemeImport(filePath, 'theme/ThemeContext.js');

  content = content.replace(
    /import\s+\{\s*colors\s*\}\s*from\s*['"][^'"]*styles\/colors['"];?\n?/,
    `import { useThemedStyles } from '${themedStylesImport}';\n`,
  );

  const needsUseTheme = usesColorsOutsideStyles(content);
  if (needsUseTheme) {
    content = content.replace(
      /import\s+\{\s*useThemedStyles\s*\}\s*from\s*['"][^'"]+['"];?\n/,
      `import { useThemedStyles } from '${themedStylesImport}';\nimport { useTheme } from '${themeContextImport}';\n`,
    );
  }

  if (content.includes('const styles = StyleSheet.create(')) {
    content = content.replace(
      /const styles = StyleSheet\.create\(/,
      'const createStyles = colors => ({',
    );
    content = content.replace(/\}\);\s*\nexport default/m, '});\n\nexport default');
  }

  const componentPatterns = [
    /(const\s+\w+\s*=\s*(?:\([^)]*\)|\(\))\s*=>\s*\{)/,
    /(function\s+\w+\s*\([^)]*\)\s*\{)/,
  ];

  let injected = false;
  for (const pattern of componentPatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, match => {
        if (injected) return match;
        injected = true;
        const lines = [`${match}`];
        if (content.includes('createStyles')) {
          lines.push('  const styles = useThemedStyles(createStyles);');
        }
        if (needsUseTheme) {
          lines.push('  const { colors } = useTheme();');
        }
        return lines.join('\n');
      });
      break;
    }
  }

  if (!injected && content.includes('createStyles')) {
    console.warn(`Could not inject hook: ${filePath}`);
    return false;
  }

  fs.writeFileSync(filePath, content);
  return true;
}

const files = walk(SRC);
let count = 0;
for (const file of files) {
  if (migrateFile(file)) {
    count += 1;
    console.log('Migrated:', path.relative(SRC, file));
  }
}
console.log(`Done. Migrated ${count} files.`);
