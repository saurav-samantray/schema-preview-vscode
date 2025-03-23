// webpack.prod.mjs
import { merge } from 'webpack-merge';
import common from './webpack.common.mjs'; // Assuming you also convert webpack.common.js

export default merge(common, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimize: true,
  },
});
