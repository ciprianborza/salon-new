const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js", // Generare hash pentru versiuni cache
    publicPath: "/", // IMPORTANT: Servește fișierele corect pe Vercel
  },
  mode: "production",
  devtool: "source-map", // Asigură-te că `eval()` nu este folosit
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: "all",
      maxSize: 244000, // Setați limita de mărime pentru asset-uri
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
    minimizer: [
      new (require("terser-webpack-plugin"))({
        terserOptions: {
          compress: {
            drop_console: true, // Elimină console.log() pentru optimizare
          },
        },
      }),
    ],
  },
  performance: {
    maxAssetSize: 300000, // Crește limita de mărime pentru asset-uri
    maxEntrypointSize: 400000, // Crește limita pentru entrypoints
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "index.html",
    }),
  ],
  devServer: {
    static: "./dist",
    historyApiFallback: true,
  },
};
