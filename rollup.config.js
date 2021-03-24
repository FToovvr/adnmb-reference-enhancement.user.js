import path from 'path';

import license from 'rollup-plugin-license';
import typescript from 'rollup-plugin-typescript';
import scss from 'rollup-plugin-scss';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import metablock from 'rollup-plugin-userscript-metablock';

import packageInfo from './package.json';

const browserslist = ["defaults"];

export default {
    input: 'src/main.ts',
    plugins: [
        license({ banner: { commentStyle: 'ignored', content: { file: path.join(__dirname, 'LICENSE') } } }),
        typescript({ lib: ["es2020", "dom"], target: "es6" }),
        scss({
            output: false,
            processor: css => postcss([
                autoprefixer({ overrideBrowserslist: browserslist }),
                cssnano({ presets: "lite" }),
            ]),
        }),
    ],
    output: [
        {
            file: 'dist/out.user.js',
            format: 'iife',
            plugins: [
                metablock({
                    override: {
                        description: packageInfo.description,
                        author: packageInfo.author,
                        license: packageInfo.license,
                        version: packageInfo.version,
                    }
                })
            ]
        },
    ],
}