import assert from 'assert';
import { MarkerExtractor, parseMarkers, parseMarkersFromFile } from '../lib';
import * as fs from 'fs';
import * as path from 'path';

function testBasicParse() {
  const FS = String.fromCharCode(28);
  const header = `//${FS}/ a.txt /${FS}//`;
  const header2 = `//${FS}/ dir/b.txt /${FS}//`;
  const content = [
    header,
    'hello',
    header2,
    'world',
  ].join('\n');

  const res = parseMarkers(content);
  assert.strictEqual(res.totalMarkers, 2, 'should find 2 markers');
  assert.strictEqual(res.markers[0].filename, 'a.txt');
  assert.strictEqual(res.markers[0].content.trim(), 'hello');
  assert.strictEqual(res.markers[1].filename, 'dir/b.txt');
  assert.strictEqual(res.markers[1].content.trim(), 'world');
}

function testFSDetect() {
  const GS = String.fromCharCode(29); // group separator
  const header = `//${GS}/ x.js /${GS}//`;
  const content = [header, 'console.log(1);'].join('\n');

  const extractor = new MarkerExtractor();
  const res = extractor.parse(content);
  assert.strictEqual(res.totalMarkers, 1, 'FS autodetect should work');
  assert.strictEqual(res.markers[0].filename, 'x.js');
}

function testFrontmatterPattern() {
  const content = [
    '---',
    'lookatni:',
    '  start: <<',
    '  end: >>',
    '---',
    '<< foo.md >>',
    '# Foo',
    '<< bar.txt >>',
    'Bar',
  ].join('\n');

  const res = parseMarkers(content);
  assert.strictEqual(res.totalMarkers, 2, 'frontmatter marker pattern should apply');
  assert.strictEqual(res.markers[0].filename, 'foo.md');
  assert.ok(res.markers[0].content.includes('# Foo'));
}

function testParseFromFileTmp() {
  const FS = String.fromCharCode(28);
  const tmp = path.join(process.cwd(), 'dist', 'test', `sample-${Date.now()}.txt`);
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  const text = [`//${FS}/ file.txt /${FS}//`, 'data'].join('\n');
  fs.writeFileSync(tmp, text, 'utf-8');
  const res = parseMarkersFromFile(tmp);
  assert.strictEqual(res.totalMarkers, 1);
  assert.strictEqual(res.markers[0].filename, 'file.txt');
  fs.unlinkSync(tmp);
}

function run() {
  console.log('[lookatni-core] running smoke tests...');
  testBasicParse();
  testFSDetect();
  testFrontmatterPattern();
  testParseFromFileTmp();
  console.log('✓ all tests passed');
}

run();
