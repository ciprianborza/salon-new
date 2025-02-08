const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    publicPath: "/", // IMPORTANT: Servește fișierele corect pe Vercel
  },
  mode: "production",
  devtool: "source-map", // Asigură-te că `eval()` nu este folosit
  optimization: {
    minimize: true,
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
