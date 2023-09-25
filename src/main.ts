import sourceMapSupport from 'source-map-support';

sourceMapSupport.install();

async function main() {
  console.log('esxi-vnc running');
}

main().catch((error: unknown) => console.error(error));
