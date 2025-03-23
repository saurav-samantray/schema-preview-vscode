// webpack.dev.js
import { merge } from 'webpack-merge';
import common from './webpack.common.mjs'; // Assuming you also convert webpack.common.js
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import webpack  from 'webpack';

export default merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
    hot: true,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ReactRefreshWebpackPlugin(),
  ],
});
