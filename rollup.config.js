import typescript from 'rollup-plugin-typescript';
import css from 'rollup-plugin-import-css';
import metablock from 'rollup-plugin-userscript-metablock';

import packageInfo from './package.json';

export default {
    input: 'src/main.ts',
    output: {
        file: 'dist/out.user.js',
        format: 'iife',
    },
    plugins: [
        typescript({ lib: ["es6", "dom"], target: "es3" }),
        css(),
        metablock({
            override: {
                description: packageInfo.description,
                author: packageInfo.author,
                license: packageInfo.license,
                version: packageInfo.version,
            }
        })
    ],
}