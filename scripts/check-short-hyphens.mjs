import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
let tracked;
try{tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).split('\0');}
catch{const walk=(dir='.')=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{if(['.git','node_modules','dist','_legal-drafts'].includes(entry.name))return [];const file=(dir==='.'?'':dir+'/')+entry.name;return entry.isDirectory()?walk(file):[file];});tracked=walk();}
const files=tracked.filter(file=>/\.(?:html|json|jsx?|mjs|tsx?|md)$/.test(file)&&!/(?:^|\/)(?:node_modules|dist|_legal-drafts)\//.test(file)&&!/(?:package-lock|pnpm-lock)/.test(file)&&file!=='api/blog-search.js');
const pattern=/\u2014|\u2013|&(?:mdash|ndash);|&#(?:8211|8212);|&#x201[34];/gi;
const failures=[];
for(const file of files){if(file==='scripts/check-short-hyphens.mjs')continue;const original=fs.readFileSync(file,'utf8');const normalized=original.replace(pattern,match=>/^(?:\u2014|&mdash;|&#8212;|&#x2014;)$/i.test(match)?' - ':'-').replace(/([^\S\r\n])+ - ([^\S\r\n])+/g,' - ');
if(original!==normalized){failures.push(file);if(process.argv.includes('--fix'))fs.writeFileSync(file,normalized);}}
if(failures.length){console.log((process.argv.includes('--fix')?'Normalized: ':'Long dashes found: ')+failures.join('\n'));if(!process.argv.includes('--fix'))process.exitCode=1;}else console.log('Short-hyphen content check passed.');
