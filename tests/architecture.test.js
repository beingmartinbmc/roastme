const arch = require('../lib/analyzers/architecture');

describe('architecture analyzer', () => {
  test('detectGodStructures flags large files', () => {
    const big = 'a;\n'.repeat(500);
    const finds = arch.detectGodStructures(big, 'big.js');
    expect(finds.some(f => f.type === 'godFile')).toBe(true);
  });

  test('detectGodStructures flags too many functions', () => {
    let src = '';
    for (let i = 0; i < 20; i++) src += `function f${i}() { return ${i}; }\n`;
    const finds = arch.detectGodStructures(src, 'many.js');
    expect(finds.some(f => f.type === 'tooManyFunctions')).toBe(true);
  });

  test('detectGodStructures detects god classes', () => {
    let methods = '';
    for (let i = 0; i < 15; i++) methods += `  m${i}() { return ${i}; }\n`;
    const src = `class Mega {\n${methods}\n}\n`;
    const finds = arch.detectGodStructures(src);
    expect(finds.some(f => f.type === 'godClass')).toBe(true);
  });

  test('detectGodStructures returns [] for non-string input', () => {
    expect(arch.detectGodStructures(null)).toEqual([]);
    expect(arch.detectGodStructures(123)).toEqual([]);
  });

  test('extractClasses parses class methods', () => {
    const src = `class Foo {
      bar() {}
      baz() {}
    }`;
    const classes = arch.extractClasses(src);
    expect(classes[0].name).toBe('Foo');
    expect(classes[0].methods).toEqual(expect.arrayContaining(['bar', 'baz']));
  });

  test('extractImports finds requires and ESM imports', () => {
    const src = `
      const a = require('a');
      const { b } = require("b");
      import c from 'c';
      import { d } from "d";
    `;
    const imports = arch.extractImports(src);
    expect(imports).toEqual(expect.arrayContaining(['a', 'b', 'c', 'd']));
  });

  test('extractImports handles non-string input', () => {
    expect(arch.extractImports(null)).toEqual([]);
  });

  test('detectTightCoupling flags many imports', () => {
    let src = '';
    for (let i = 0; i < 12; i++) src += `const m${i} = require('mod${i}');\n`;
    const finds = arch.detectTightCoupling(src, 'busy.js');
    expect(finds[0].type).toBe('tightCoupling');
  });

  test('detectTightCoupling returns [] for normal files', () => {
    expect(arch.detectTightCoupling("const a = require('a');", 'x.js')).toEqual([]);
    expect(arch.detectTightCoupling(null, 'x.js')).toEqual([]);
  });

  test('buildDependencyGraph + detectCircularDependencies finds cycles', () => {
    const files = {
      'a.js': "const b = require('./b');",
      'b.js': "const c = require('./c');",
      'c.js': "const a = require('./a');"
    };
    const graph = arch.buildDependencyGraph(files);
    const cycles = arch.detectCircularDependencies(graph);
    expect(cycles.length).toBeGreaterThan(0);
  });

  test('detectCircularDependencies returns [] when none exist', () => {
    const graph = { 'a.js': ['b.js'], 'b.js': [], 'c.js': [] };
    expect(arch.detectCircularDependencies(graph)).toEqual([]);
  });

  test('approximateComplexity counts branches', () => {
    const src = `
      if (a) {} else if (b) {} else {}
      for (let i=0;i<10;i++){}
      while (x) {}
      try { x; } catch (e) {}
      a && b || c ? 1 : 2;
    `;
    expect(arch.approximateComplexity(src)).toBeGreaterThan(5);
    expect(arch.approximateComplexity(null)).toBe(0);
  });

  test('analyzeArchitecture aggregates and reports complexity', () => {
    let src = '';
    for (let i = 0; i < 35; i++) src += `if (x${i}) {}\n`;
    const result = arch.analyzeArchitecture(src, 'busy.js');
    expect(result.complexity).toBeGreaterThan(30);
    expect(result.findings.some(f => f.type === 'highComplexity')).toBe(true);
  });

  test('buildDependencyGraph handles index.js resolution and missing imports', () => {
    const files = {
      'a.js': "const b = require('./b');\nconst x = require('./missing');",
      'b/index.js': 'module.exports = {};'
    };
    const graph = arch.buildDependencyGraph(files);
    expect(graph['a.js']).toEqual(expect.arrayContaining(['b/index.js']));
  });
});
