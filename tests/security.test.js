const sec = require('../lib/analyzers/security');

describe('security analyzer', () => {
  test('detectSecrets finds AWS access key', () => {
    const finds = sec.detectSecrets('const k = "AKIA' + 'IOSFODNN7EXAMPLE";');
    expect(finds.length).toBeGreaterThan(0);
    expect(finds[0].severity).toBe('critical');
    expect(finds[0].name).toBe('AWS Access Key');
  });

  test('detectSecrets finds GitHub PAT and Slack token', () => {
    const code = `
      const gh = "ghp_${'A'.repeat(36)}";
      const slack = "${'xoxb'}-1234567890-abcdef";
    `;
    const finds = sec.detectSecrets(code);
    const names = finds.map(f => f.name);
    expect(names).toEqual(expect.arrayContaining(['GitHub Token', 'Slack Token']));
  });

  test('detectSecrets finds private key block', () => {
    const finds = sec.detectSecrets('-----BEGIN RSA ' + 'PRIVATE KEY-----\nblah');
    expect(finds.some(f => f.name === 'Private Key Block')).toBe(true);
  });

  test('detectSecrets finds hardcoded password', () => {
    const finds = sec.detectSecrets('const password = "hunter2";');
    expect(finds.some(f => f.name === 'Hardcoded Password')).toBe(true);
  });

  test('detectSecrets returns empty for empty input', () => {
    expect(sec.detectSecrets('')).toEqual([]);
    expect(sec.detectSecrets(null)).toEqual([]);
    expect(sec.detectSecrets(undefined)).toEqual([]);
  });

  test('detectUnsafePatterns flags eval, innerHTML, exec, MD5', () => {
    const src = `
      eval(input);
      el.innerHTML = userInput;
      exec("rm -rf " + dir);
      crypto.createHash("md5");
      Math.random() + "_token";
      const url = "http://example.com";
      document.write("hi");
      const conn = { rejectUnauthorized: false };
      "SELECT * FROM users WHERE id = '" + id;
    `;
    const finds = sec.detectUnsafePatterns(src);
    const names = finds.map(f => f.name);
    expect(names).toEqual(expect.arrayContaining([
      'eval()',
      'innerHTML assignment',
      'child_process.exec',
      'Weak hash MD5',
      'Math.random for crypto',
      'HTTP (not HTTPS)',
      'document.write',
      'Disabled TLS verification',
      'SQL string concat'
    ]));
    finds.forEach(f => expect(f.advice).toBeDefined());
  });

  test('detectUnsafePatterns handles new Function and SHA1', () => {
    const finds = sec.detectUnsafePatterns('const f = new Function("a","return a"); createHash("sha1");');
    const names = finds.map(f => f.name);
    expect(names).toEqual(expect.arrayContaining(['new Function()', 'Weak hash SHA1']));
  });

  test('detectAuthIssues catches plain comparison and password logging', () => {
    const src = `
      if (password === "letmein") {}
      console.log("password:" + password);
      // TODO: implement auth here
    `;
    const finds = sec.detectAuthIssues(src);
    const names = finds.map(f => f.name);
    expect(names).toEqual(expect.arrayContaining([
      'Plain text password compare',
      'Password logged',
      'No auth check'
    ]));
  });

  test('analyzeSecurity aggregates and computes score', () => {
    const result = sec.analyzeSecurity('const password = "abcdef";\neval(x);');
    expect(result.findings.length).toBeGreaterThan(0);
    expect(result.summary.total).toBe(result.findings.length);
    expect(result.summary.bySeverity).toBeDefined();
    expect(result.summary.byCategory).toBeDefined();
    expect(result.score).toBeLessThanOrEqual(10);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  test('analyzeSecurity returns full score for clean code', () => {
    const result = sec.analyzeSecurity('function add(a,b){return a+b;}');
    expect(result.findings).toEqual([]);
    expect(result.score).toBe(10);
  });

  test('computeSecurityScore floors at 0 for catastrophic input', () => {
    const score = sec.computeSecurityScore({ bySeverity: { critical: 100 } });
    expect(score).toBe(0);
  });

  test('truncates very long snippets', () => {
    const long = 'A'.repeat(500);
    const finds = sec.detectUnsafePatterns(`eval("${long}");`);
    expect(finds[0].snippet.length).toBeLessThanOrEqual(160);
  });
});
