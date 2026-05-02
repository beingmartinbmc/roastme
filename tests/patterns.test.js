const { detectPatterns } = require('../lib/analyzers/patterns');

describe('pattern detection', () => {
  test('detects MVC boilerplate', () => {
    const files = {
      'src/controllers/userController.js': 'module.exports = {};',
      'src/models/user.js': 'module.exports = {};',
      'src/views/user.ejs': '<html></html>'
    };
    const patterns = detectPatterns(files);
    expect(patterns.some(p => p.pattern === 'MVC Boilerplate')).toBe(true);
  });

  test('detects reinvented queue', () => {
    const files = { 'q.js': 'class MyQueue { enqueue(x){} dequeue(){} }' };
    const patterns = detectPatterns(files);
    expect(patterns.some(p => p.pattern === 'Reinvented Queue')).toBe(true);
  });

  test('detects reinvented logger', () => {
    const files = { 'l.js': 'class AppLogger { log(){} }' };
    const patterns = detectPatterns(files);
    expect(patterns.some(p => p.pattern === 'Reinvented Logger')).toBe(true);
  });

  test('detects util junk drawer', () => {
    const files = {
      'src/utils/a.js': '',
      'src/helpers/b.js': '',
      'src/common/c.js': ''
    };
    const patterns = detectPatterns(files);
    expect(patterns.some(p => p.pattern === 'Util Junk Drawer')).toBe(true);
  });

  test('detects singleton abuse', () => {
    const files = { 'a.js': 'function getInstance() { return {}; }' };
    const patterns = detectPatterns(files);
    expect(patterns.some(p => p.pattern === 'Singleton Abuse')).toBe(true);
  });

  test('detects callback hell', () => {
    const files = {
      'cb.js': `doA((a) => { doB((b) => { doC((c) => { console.log(a,b,c); }); }); });`
    };
    const patterns = detectPatterns(files);
    expect(patterns.some(p => p.pattern === 'Callback Hell')).toBe(true);
  });

  test('detects Express boilerplate', () => {
    const files = { 'server.js': "const e = require('express');" };
    const patterns = detectPatterns(files);
    expect(patterns.some(p => p.pattern === 'Express Boilerplate')).toBe(true);
  });

  test('detects no tests', () => {
    const files = {
      'a.js': '',
      'b.js': '',
      'c.js': '',
      'd.js': '',
      'e.js': '',
      'f.js': ''
    };
    const patterns = detectPatterns(files);
    expect(patterns.some(p => p.pattern === 'No Tests')).toBe(true);
  });

  test('detects mixed module systems', () => {
    const files = {
      'a.js': "const x = require('x');\nmodule.exports = x;",
      'b.js': "import y from 'y';\nexport default y;"
    };
    const patterns = detectPatterns(files);
    expect(patterns.some(p => p.pattern === 'Module System Mashup')).toBe(true);
  });

  test('returns empty when no patterns match', () => {
    expect(detectPatterns({})).toEqual([]);
  });
});
