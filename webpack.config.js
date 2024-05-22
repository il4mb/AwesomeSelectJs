

module.exports = {
    entry: './src/awesome-select.js',
    output: {
        path: __dirname + '/dist',
        filename: 'awesome-select.js',
        library: 'AwesomeSelect',
        libraryTarget: 'umd',
        globalObject: 'this'
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: ['css-loader', 'postcss-loader', 'sass-loader'],
            }
        ]
    }
}