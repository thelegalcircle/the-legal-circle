const sharp = require('C:/Users/owner-pc/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const files = ['1768280409512.jpg','1768280408464.jpg','43151e12-88a4-4acb-9f48-504b93dac6a1.jpg','GH0A3087.jpg','GH0A3091.jpg','8a29507e-1c58-4c4f-a7f3-afb84f69b05d.jpg'];
(async () => {
  for (const [i,file] of files.entries()) {
    const result = await sharp(`C:/Users/owner-pc/Downloads/${file}`).rotate().resize({width:1000,withoutEnlargement:true}).webp({quality:82}).toFile(`assets/event-gathering-${i+1}.webp`);
    console.log(i+1,result.width,result.height,result.size);
  }
})();
