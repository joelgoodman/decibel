'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Podcast extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Podcast.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    coverImage: DataTypes.STRING,
    hostId: DataTypes.INTEGER,
    categories: DataTypes.ARRAY,
    rssFeed: DataTypes.STRING,
    episodesCount: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Podcast',
  });
  return Podcast;
};