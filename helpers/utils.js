import path from 'path';

export const rootPath = (...args) => path.resolve(__dirname, '..', ...args);
export const wwwroot = rootPath('wwwroot');
export const testRootURL = '/app';

function bareImportRewrite(production) {
	return [
		'bare-import-rewrite',
		{
			alwaysRootImport: ['**'],
			/* This must be an absolute URL path because bare imports can
			 * be resolved from sources in multiple directories. */
			modulesDir: production ? rootPath('node_modules') : `${testRootURL}/assets`
		}
	];
}

/* Only necessary plugins / presets should be used by development and test env's.
 * Minifying is generally not recommended as this will slow the test web server
 * without much benefit as bandwidth is not an issue when browsing localhost. */
export const babelrc = {
	babelrc: false,
	configFile: false,
	plugins: [
		'@babel/plugin-proposal-object-rest-spread',
		'@babel/plugin-syntax-import-meta',
		'transform-commonjs'
	],
	env: {
		production: {
			/* Comments are visible from the source-maps and in the assets directory
			 * produced by rollup. */
			comments: false,
			minified: true,
			presets: [
				'minify'
			],
			plugins: [
				['template-html-minifier', {
					modules: {
						'@polymer/lit-element': ['html'],
						'lit-html': ['html']
					},
					htmlMinifier: {
						collapseWhitespace: true,
						removeComments: true,
						minifyCSS: {level: 2},
						minifyJS: true
					}
				}],
				bareImportRewrite(true),
				['bundled-import-meta', {
					/* This could be done using mappings.html == '.' but using
					 * bundleDir means this plugin will throw an error if we try
					 * to bundle anything from outside html or node_modules. */
					bundleDir: 'html',
					mappings: {
						[rootPath('node_modules')]: './assets'
					}
				}]
			]
		},
		development: {
			plugins: [
				bareImportRewrite()
			]
		},
		test: {
			plugins: [
				bareImportRewrite(),
				'istanbul'
			]
		}
	}
};
