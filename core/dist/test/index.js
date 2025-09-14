"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const lib_1 = require("../lib");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
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
    const res = (0, lib_1.parseMarkers)(content);
    assert_1.default.strictEqual(res.totalMarkers, 2, 'should find 2 markers');
    assert_1.default.strictEqual(res.markers[0].filename, 'a.txt');
    assert_1.default.strictEqual(res.markers[0].content.trim(), 'hello');
    assert_1.default.strictEqual(res.markers[1].filename, 'dir/b.txt');
    assert_1.default.strictEqual(res.markers[1].content.trim(), 'world');
}
function testFSDetect() {
    const GS = String.fromCharCode(29); // group separator
    const header = `//${GS}/ x.js /${GS}//`;
    const content = [header, 'console.log(1);'].join('\n');
    const extractor = new lib_1.MarkerExtractor();
    const res = extractor.parse(content);
    assert_1.default.strictEqual(res.totalMarkers, 1, 'FS autodetect should work');
    assert_1.default.strictEqual(res.markers[0].filename, 'x.js');
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
    const res = (0, lib_1.parseMarkers)(content);
    assert_1.default.strictEqual(res.totalMarkers, 2, 'frontmatter marker pattern should apply');
    assert_1.default.strictEqual(res.markers[0].filename, 'foo.md');
    assert_1.default.ok(res.markers[0].content.includes('# Foo'));
}
function testParseFromFileTmp() {
    const FS = String.fromCharCode(28);
    const tmp = path.join(process.cwd(), 'dist', 'test', `sample-${Date.now()}.txt`);
    fs.mkdirSync(path.dirname(tmp), { recursive: true });
    const text = [`//${FS}/ file.txt /${FS}//`, 'data'].join('\n');
    fs.writeFileSync(tmp, text, 'utf-8');
    const res = (0, lib_1.parseMarkersFromFile)(tmp);
    assert_1.default.strictEqual(res.totalMarkers, 1);
    assert_1.default.strictEqual(res.markers[0].filename, 'file.txt');
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
//# sourceMappingURL=index.js.map