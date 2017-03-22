var path = require('path');
var webpack = require('webpack');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var autoprefixer = require('autoprefixer');

var config = {
	entry: { //配置入口文件，有几个写几个
	},
	output: { 
		path: path.join(__dirname, 'dist'), //输出目录的配置，模板、样式、脚本、图片等资源的路径配置都相对于它
		publicPath: '/dist/',				//模板、样式、脚本、图片等资源对应的server上的路径
		filename: 'js/[name].js',			//每个页面对应的主js的生成配置
		chunkFilename: 'js/[id].chunk.js'   //chunk生成的配置
	},
    resolve: {
        extensions : ['', '.js'],
        alias: {
            'bootstrap.css' : path.join(__dirname, '/node_modules/bootstrap/dist/css/bootstrap.css')
        }
	},
    postcss: [ autoprefixer({ browsers: ['last 2 versions'] }) ],
    devtool : 'source-map',
	module: {
		loaders: [
            {
                test : /\.js?$/,
                loaders : ['babel']
            }, {
				test: /\.css$/,
				loader: ExtractTextPlugin.extract('style', 'css?sourceMap')
			}, {
				test: /\.less$/,
				loader: ExtractTextPlugin.extract('css?sourceMap!postcss?sourceMap!less?sourceMap')
			}, {
				//html模板加载器，可以处理引用的静态资源，默认配置参数attrs=img:src，处理图片的src引用的资源
				//比如你配置，attrs=img:src img:data-src就可以一并处理data-src引用的资源了，就像下面这样
				test: /\.html$/,
				loader: "html?attrs=img:src img:data-src"
			}, {
				//文件加载器，处理文件静态资源
				test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				loader: 'file-loader?name=./fonts/[name].[ext]'
			}, {
				//图片加载器，雷同file-loader，更适合图片，可以将较小的图片转成base64，减少http请求
				//如下配置，将小于8192byte的图片转成base64码
				test: /\.(png|jpg|gif)$/,
				loader: 'url-loader?limit=8192&name=./img/[name]-[hash].[ext]'
			}
		]
	},
	plugins: [
		new webpack.ProvidePlugin({ //加载jq
			$: 'jquery'
		}),
		new ExtractTextPlugin('css/[name].css'), //单独使用link标签加载css并设置路径，相对于output配置中的publickPath
		new webpack.HotModuleReplacementPlugin() //热加载
	],
	//使用webpack-dev-server，提高开发效率
	devServer: {
		contentBase: './',
		host: 'localhost',
		port: 9090,
		inline: true,
		hot: true,
	}
};

//生成页面
function generateHTML(name) {
    var newHtml = new HtmlWebpackPlugin({ //根据模板插入css/js等生成最终HTML
        favicon: './src/img/favicon.ico', //favicon路径，通过webpack引入同时可以生成hash值
        filename: './view/'+ name +'.html', //生成的html存放路径，相对于path
        template: './src/view/'+ name +'.html', //html模板路径
        inject: 'body', //js插入的位置，true/'head'/'body'/false
        hash: true, //为静态资源生成hash值
        chunks: ['vendors', name],//需要引入的chunk，不配置就会引入所有页面的资源
        minify: { //压缩HTML文件
            removeComments: true, //移除HTML中的注释
            collapseWhitespace: false //删除空白符与换行符
        }
    });
    config.entry[name] = './src/js/page/' + name;
    config.plugins.push(newHtml);
}

//提取公共资源
function extractResources(){
	var modulesName = [];
    for(key in config.entry){
        modulesName.push(key);
	}
    var extractSettings = new webpack.optimize.CommonsChunkPlugin({
        name: 'vendors', // 将公共模块提取，生成名为`vendors`的chunk
        chunks: modulesName, //提取哪些模块共有的部分
        minChunks: 3 // 提取至少3个模块共有的部分
    });
    config.plugins.push(extractSettings);
}

generateHTML('index');
generateHTML('index2');
generateHTML('index3');
//需要放在最后
extractResources();

module.exports = config;